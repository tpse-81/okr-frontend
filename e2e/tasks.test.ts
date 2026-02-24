import { expect, keyResultBaseTest, uniq } from "./fixtures";

keyResultBaseTest(
	"can create a task for a key result and see it in the list",
	async ({ keyResultPage: page }) => {
		const taskTitle = uniq("e2e-task-title");
		const taskDesc = uniq("e2e-task-desc");

		await page.locator("#task-submit #task-name").fill(taskTitle);
		await page.locator("#task-submit #task-description").fill(taskDesc);
		await page.locator("#task-submit select").selectOption("open");

		const [createRes] = await Promise.all([
		page.waitForResponse(
			(res) => res.url().includes("/tasks") && res.request().method() === "POST",
		),
		page.locator("#task-submit button[type=submit]").click(),
		]);
		expect(createRes.ok()).toBeTruthy();

		await expect(page.locator("#tasks-list")).toContainText(taskDesc, { timeout: 10000 });
	},
);

keyResultBaseTest(
	"cannot create task without description (required)",
	async ({ keyResultPage: page }) => {
		// description leer lassen
		const taskTitle = uniq("e2e-task-title");
		await page.locator("#task-submit #task-name").fill(taskTitle);

		// description absichtlich leer lassen
		await page.locator("#task-submit button[type=submit]").click();

		await expect(page.locator("#task-submit #task-description")).toHaveJSProperty(
		"validity.valueMissing",
		true,
		);
	},
);
