import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, Then } = createBdd();

Given("I navigate to the app", async ({ page }) => {
  await page.goto("/");
});

Given("I am logged in", async ({ page }) => {
  await page.goto("/");
  const username = process.env.E2E_USERNAME ?? "";
  const password = process.env.E2E_PASSWORD ?? "";

  // If a previous scenario left us authenticated, the Create button is already
  // there and the login form never renders — skip straight through.
  const createButton = page.getByRole("button", { name: /Create Countdown/i });
  if (await createButton.isVisible().catch(() => false)) return;

  await page.waitForSelector('[name="username"]', { timeout: 15000 });
  await page.fill('[name="username"]', username);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(createButton).toBeVisible({ timeout: 30000 });
});

Then("I should see the countdowns list", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /Create Countdown/i }),
  ).toBeVisible({ timeout: 30000 });
});
