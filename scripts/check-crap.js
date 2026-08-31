/**
 * CRAP gate: CRAP = complexity^2 * (1 - coverage)^3 + complexity, per FUNCTION.
 *
 * Complexity is cyclomatic: 1 + the number of branch decision points located
 * inside the function's span. Coverage is that same function's branch coverage
 * (or its hit-count when it has no branches). Computing both per-function is
 * the actual CRAP definition — a file-level proxy misattributes one hot spot
 * to every function in the file.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const CRAP_THRESHOLD = 15;

const coveragePath = resolve("coverage/coverage-final.json");
let coverageData;

try {
  coverageData = JSON.parse(readFileSync(coveragePath, "utf-8"));
} catch {
  console.error(
    "Could not read coverage-final.json. Run tests with coverage first.",
  );
  process.exit(1);
}

const contains = (span, loc) =>
  loc &&
  span.start &&
  span.end &&
  (loc.start.line > span.start.line ||
    (loc.start.line === span.start.line &&
      loc.start.column >= span.start.column)) &&
  (loc.start.line < span.end.line ||
    (loc.start.line === span.end.line && loc.start.column <= span.end.column));

const spanSize = (span) =>
  (span.end.line - span.start.line) * 1000 +
  (span.end.column - span.start.column);

let hasFailure = false;

for (const [filePath, fileData] of Object.entries(coverageData)) {
  const { fnMap, f: fnHits, branchMap, b: branchHits } = fileData;

  // Attribute each branch to its INNERMOST enclosing function — otherwise an
  // outer function absorbs every branch of its nested callbacks.
  const owner = {};
  for (const [branchKey, branchMeta] of Object.entries(branchMap)) {
    let best = null;
    for (const [fnKey, fnMeta] of Object.entries(fnMap)) {
      if (!contains(fnMeta.loc ?? {}, branchMeta.loc ?? branchMeta)) continue;
      if (!best || spanSize(fnMap[best].loc) > spanSize(fnMeta.loc)) {
        best = fnKey;
      }
    }
    if (best !== null) owner[branchKey] = best;
  }

  for (const [fnKey, fnMeta] of Object.entries(fnMap)) {
    let branches = 0;
    let coveredBranches = 0;
    for (const branchKey of Object.keys(branchMap)) {
      if (owner[branchKey] !== fnKey) continue;
      for (const hits of branchHits[branchKey]) {
        branches++;
        if (hits > 0) coveredBranches++;
      }
    }

    const complexity = 1 + branches;
    const coverage = branches
      ? coveredBranches / branches
      : fnHits[fnKey] > 0
        ? 1
        : 0;
    const crap =
      Math.pow(complexity, 2) * Math.pow(1 - coverage, 3) + complexity;

    if (crap > CRAP_THRESHOLD) {
      const name = fnMeta.name || "(anonymous)";
      const loc = fnMeta.loc?.start;
      console.error(
        `CRAP ${crap.toFixed(1)} > ${CRAP_THRESHOLD} in ${filePath}:${loc?.line}:${loc?.column} (${name})`,
      );
      hasFailure = true;
    }
  }
}

if (hasFailure) {
  console.error(
    "\nCRAP score check FAILED. Reduce complexity or increase coverage.",
  );
  process.exit(1);
} else {
  console.log("CRAP score check passed.");
}
