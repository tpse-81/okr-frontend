import { expect, objectiveBaseTest, uniq } from "./fixtures";

objectiveBaseTest(
	"can create a key result for an objective and see it in the list",
	async ({ objectivePage: page }) => {
		const krDescription = uniq("e2e-kr");
		await page.locator("#keyResultSubmit #description").fill(krDescription);
		await page.locator("#keyResultSubmit #start-value").fill("0");
		await page.locator("#keyResultSubmit #end-value").fill("10");

		await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/key_results") &&
					res.request().method() === "POST",
			),
			page.locator("#keyResultSubmit input[type=submit]").click(),
		]);

		const krLink = page
			.locator("#key-results-list")
			.getByRole("link", { name: new RegExp(krDescription) });
		await expect(krLink).toBeVisible();
	},
);

objectiveBaseTest(
	"cannot create a key result with out a description",
	async ({ objectivePage: page }) => {
		await page.locator("#keyResultSubmit #start-value").fill("0");
		await page.locator("#keyResultSubmit #end-value").fill("10");

		// description leer lassen
		await page.locator("#keyResultSubmit input[type=submit]").click();

		await expect(
			page.locator("#keyResultSubmit #description"),
		).toHaveJSProperty("validity.valueMissing", true);
	},
);
