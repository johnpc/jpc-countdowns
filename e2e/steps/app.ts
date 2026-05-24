import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

Given("I navigate to the app", async ({ page }) => {
  await page.goto("/");
});

When("I log in with valid credentials", async ({ page }) => {
  const username = process.env.E2E_USERNAME ?? "";
  const password = process.env.E2E_PASSWORD ?? "";

  await page.waitForSelector('[name="username"]', { timeout: 15000 });
  await page.fill('[name="username"]', username);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
});

Then("I should see the countdowns list", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /Create Countdown/i }),
  ).toBeVisible({ timeout: 30000 });
});
