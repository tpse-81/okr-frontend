import { expect, projectBaseTest, uniq } from "./fixtures";

projectBaseTest(
	"can create an objective inside a project and see it in the list",
	async ({ projectPage: page }) => {
		const objectiveName = uniq("e2e-objective");
		await page.locator("#objective-name").fill(objectiveName);
		await page.locator("#objective-description").fill("my first objective");

		await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/objectives") &&
					res.request().method() === "POST",
			),
			page.locator("#objective-submit button[type=submit]").click(),
		]);

		const objectiveLink = page
			.locator("#objectives-list")
			.getByRole("link", { name: new RegExp(objectiveName) });
		await expect(objectiveLink).toBeVisible();
	},
);

projectBaseTest(
	"cannot create objective without name (required)",
	async ({ projectPage: page }) => {
		// Objective Name leer lassen, Description setzen
		await page.locator("#objective-description").fill("desc");
		await page.locator("#objective-submit button[type=submit]").click();

		await expect(page.locator("#objective-name")).toHaveJSProperty(
			"validity.valueMissing",
			true,
		);
	},
);
