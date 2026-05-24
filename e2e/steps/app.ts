import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BddWorld } from "playwright-bdd";

Given("I navigate to the app", async function (this: BddWorld) {
  await this.page.goto("/");
});

Then("I should see the authentication form", async function (this: BddWorld) {
  await expect(this.page.locator("[data-amplify-authenticator]")).toBeVisible({
    timeout: 10000,
  });
});
