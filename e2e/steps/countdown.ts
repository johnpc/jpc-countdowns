import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { When, Then } = createBdd();

// A per-run unique title keeps these write-scenarios safe against the shared
// prod backend and re-runnable: each run operates on its own row, and the
// delete step cleans it up. Stored on the worker's process so the When/Then
// steps within a scenario share it. A far-future date keeps it visible (the
// list hides past countdowns).
let currentTitle = "";
const uniqueTitle = () =>
  `e2e ${process.env.TEST_WORKER_INDEX ?? "0"} ${Date.now()}`;
const FUTURE_DATE = "2999-12-31";

const createButton = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /Create Countdown/i });

When("I create a countdown with a unique title", async ({ page }) => {
  currentTitle = uniqueTitle();
  await createButton(page).click();

  await page.locator('input[type="text"]').first().fill(currentTitle);
  await page.locator('input[type="color"]').first().fill("#123456");
  await page.locator('input[type="date"]').first().fill(FUTURE_DATE);

  // Pick an emoji. The picker's leading buttons are category tabs ("Frequently
  // used", …); the actual emojis are buttons named by their glyph. Target a
  // glyph button, then wait for the selection to register (the picker closes
  // and "You have chosen" appears) before submitting — otherwise the form's
  // all-fields-required guard silently rejects the create.
  const picker = page.locator("em-emoji-picker");
  await picker.waitFor({ timeout: 15000 });
  await picker.getByRole("button", { name: "👍" }).first().click({
    timeout: 15000,
  });
  await expect(page.getByText(/You have chosen 👍/)).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: /^Create$/ }).click();
});

Then("I should see my new countdown in the list", async ({ page }) => {
  await expect(page.getByText(currentTitle, { exact: true })).toBeVisible({
    timeout: 30000,
  });
});

When("I open my countdown for editing", async ({ page }) => {
  await page.getByText(currentTitle, { exact: true }).click();
  await expect(page.getByRole("button", { name: /^Update$/ })).toBeVisible({
    timeout: 15000,
  });
});

When("I change its title", async ({ page }) => {
  currentTitle = `${currentTitle} edited`;
  await page.locator('input[type="text"]').first().fill(currentTitle);
  await page.getByRole("button", { name: /^Update$/ }).click();
});

When("I delete my countdown", async ({ page }) => {
  // The countdown row is an amplify-flex containing the title and a single
  // (delete) button. Filter rows by the title text, then click that row's
  // button — robust to sibling ordering.
  const row = page
    .locator(".amplify-flex")
    .filter({ hasText: currentTitle })
    .first();
  await row.getByRole("button").last().click({ timeout: 15000 });
});

Then("I should not see my countdown in the list", async ({ page }) => {
  await expect(page.getByText(currentTitle, { exact: true })).toHaveCount(0, {
    timeout: 30000,
  });
});
