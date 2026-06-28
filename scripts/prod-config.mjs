/**
 * Pull amplify_outputs.json from the deployed `main` backend, waiting out an
 * in-progress Amplify deployment.
 *
 * A merge to main triggers an Amplify Hosting rebuild, so a deploy is often
 * mid-flight when CI / the iOS deploy calls `ampx generate outputs` — which
 * hard-fails with DeploymentInProgressError. That's a transient race, not a
 * real failure, so we retry the pull until it succeeds (the only real success
 * signal) or we run out of attempts.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const APP_ID = "d1letrbu1eg8la";
const BRANCH = "main";
const PROFILE = "personal";

// CI authenticates with AWS_ACCESS_KEY_ID env creds (no named profile); local
// + the iOS deploy use the `personal` profile. Only pass --profile when there
// are no env creds, so the same wrapper works in both.
const useProfile = !process.env.AWS_ACCESS_KEY_ID;
const GENERATE_ARGS = [
  "ampx",
  "generate",
  "outputs",
  "--app-id",
  APP_ID,
  "--branch",
  BRANCH,
  ...(useProfile ? ["--profile", PROFILE] : []),
];

const MAX_ATTEMPTS = 40; // ~20 min at 30s — deep enough for a few stacked deploys
const DELAY_MS = 30_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isInProgress = (s) =>
  s.includes("DeploymentInProgressError") ||
  s.includes("deployment is in progress");

/** Pull outputs, retrying only on the deploy-in-progress race. */
async function generateOutputs() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { stdout } = await run("npx", GENERATE_ARGS, { encoding: "utf8" });
      process.stdout.write(stdout);
      return;
    } catch (err) {
      const out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
      if (!isInProgress(out) || attempt === MAX_ATTEMPTS) {
        process.stderr.write(out);
        throw err;
      }
      console.log(
        `Amplify deploy in progress — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${DELAY_MS / 1000}s…`,
      );
      await sleep(DELAY_MS);
    }
  }
}

await generateOutputs();
