#!/usr/bin/env node
/**
 * File-length discipline: every source file (.ts and .tsx) must stay short
 * and single-purpose. Anything over MAX_LINES is a signal to extract logic
 * into a smaller, tested helper or split the file. Fails the build if any
 * source file is too long. Test files are exempt.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const MAX_LINES = 100;
// Every source tree we author — app code AND Amplify backend LOGIC. Only
// declarative Amplify config (resource.ts / backend.ts) is exempt below.
const ROOTS = ["src", "amplify"].map((d) => join(process.cwd(), d));
const SKIP_DIRS = new Set(["node_modules", ".amplify", "dist", "build"]);
// Exempt DECLARATIVE definitions only — Amplify resource/backend config.
// Backend LOGIC (future Lambda functions, resolvers, seed runners) is NOT
// exempt and must obey the limit.
const isExcluded = (rel) =>
  rel === "amplify/backend.ts" || /^amplify\/.*resource\.ts$/.test(rel);

/** @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const rel = relative(process.cwd(), full).split("\\").join("/");
    if (isExcluded(rel)) continue;
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (
      (entry.endsWith(".ts") || entry.endsWith(".tsx")) &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx") &&
      !entry.endsWith(".d.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

const offenders = [];
for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split("\n").length;
    if (lines > MAX_LINES)
      offenders.push({ file: relative(process.cwd(), file), lines });
  }
}

if (offenders.length > 0) {
  console.error(`\n✖ Source files exceeding ${MAX_LINES} lines:`);
  for (const o of offenders) console.error(`    ${o.file} — ${o.lines} lines`);
  console.error(`\n  Extract logic into a smaller helper or split the file.\n`);
  process.exit(1);
}

console.log(`✓ All source files are within ${MAX_LINES} lines.`);
