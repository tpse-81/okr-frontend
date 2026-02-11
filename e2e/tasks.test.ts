import { expect, keyResultBaseTest, uniq } from "./fixtures";

keyResultBaseTest(
	"can create a task for a key result and see it in the list",
	async ({ keyResultPage: page }) => {
		const taskDesc = uniq("e2e-task");
		await page.locator("#task-submit #description").fill(taskDesc);
		await page.locator("#task-submit select").selectOption("open");

		const [createRes] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/tasks") && res.request().method() === "POST",
			),
			page.locator("#task-submit input[type=submit]").click(),
		]);
		expect(createRes.ok()).toBeTruthy();

		await expect(page.locator("#tasks-list")).toContainText(taskDesc);
	},
);

keyResultBaseTest(
	"cannot create task without description (required)",
	async ({ keyResultPage: page }) => {
		// description leer lassen
		await page.locator("#task-submit input[type=submit]").click();

		await expect(page.locator("#task-submit #description")).toHaveJSProperty(
			"validity.valueMissing",
			true,
		);
	},
);
