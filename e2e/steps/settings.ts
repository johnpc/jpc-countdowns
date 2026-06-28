import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { When, Then } = createBdd();

When("I open settings", async ({ page }) => {
  await page.getByRole("button", { name: /^Settings/ }).click();
});

Then("I should see the widget settings", async ({ page }) => {
  await expect(page.getByText(/Widget Settings/i)).toBeVisible({
    timeout: 15000,
  });
});

Then("I should see account management options", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Sign Out/i })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("button", { name: /Generate Holiday Countdowns/i }),
  ).toBeVisible();
});

When("I return from settings", async ({ page }) => {
  await page.getByRole("button", { name: /^Back$/ }).click();
  await expect(
    page.getByRole("button", { name: /Create Countdown/i }),
  ).toBeVisible({ timeout: 15000 });
});
