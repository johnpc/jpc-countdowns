import { createBdd } from "playwright-bdd";

const { When } = createBdd();

// The original App Loading feature logs in explicitly (rather than via the
// shared "I am logged in" background). Navigation + list assertions live in
// auth.ts and are shared across all features.
When("I log in with valid credentials", async ({ page }) => {
  const username = process.env.E2E_USERNAME ?? "";
  const password = process.env.E2E_PASSWORD ?? "";

  await page.waitForSelector('[name="username"]', { timeout: 15000 });
  await page.fill('[name="username"]', username);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
});
