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

let hasFailure = false;

for (const [filePath, fileData] of Object.entries(coverageData)) {
  const fnMap = fileData.fnMap;
  const fnCoverage = fileData.f;

  for (const [fnKey, fnMeta] of Object.entries(fnMap)) {
    const hits = fnCoverage[fnKey];
    const coverage = hits > 0 ? 1 : 0;
    // Estimate complexity as 1 (no branch data per-function in Istanbul)
    // Use branch coverage at file level as proxy
    const branchData = fileData.branchMap;
    const branchCoverage = fileData.b;

    let totalBranches = 0;
    let coveredBranches = 0;
    for (const [branchKey, branchMeta] of Object.entries(branchData)) {
      const locations = branchCoverage[branchKey];
      for (const loc of locations) {
        totalBranches++;
        if (loc > 0) coveredBranches++;
      }
    }

    const fileBranchCoverage =
      totalBranches > 0 ? coveredBranches / totalBranches : 1;
    const complexity = Math.max(1, Object.keys(branchData).length);
    const crap =
      Math.pow(complexity, 2) * Math.pow(1 - fileBranchCoverage, 3) +
      complexity;

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
