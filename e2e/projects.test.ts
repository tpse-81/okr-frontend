import { expect, loginBaseTest, navigateViaDrawer, uniq } from "./fixtures";

loginBaseTest(
	"projects page shows form and list/empty state",
	async ({ loginPage: page }) => {
		await navigateViaDrawer(page, "Projects", "/projects");

		await expect(page.locator("#project-submit")).toBeVisible();
		await expect(page.locator("#project-name")).toBeVisible();
		await expect(page.locator("#project-deadline")).toBeVisible();

		const empty = page.getByText("Keine Projekte geladen");
		const list = page.locator("#projects-list");
		await expect(empty.or(list)).toBeVisible();
	},
);

loginBaseTest(
	"can create a new project and see it in the list",
	async ({ loginPage: page }) => {
		await navigateViaDrawer(page, "Projects", "/projects");

		const projectName = uniq("e2e-project");
		await page.locator("#project-name").fill(projectName);
		await page.locator("#project-deadline").fill("2099-12-31");

		const [createRes] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/projects") && res.request().method() === "POST",
			),
			page.locator("#project-submit button[type=submit]").click(),
		]);

		expect(createRes.ok()).toBeTruthy();

		const projectLink = page
			.locator("#projects-list")
			.getByRole("link", { name: new RegExp(projectName) });
		await expect(projectLink).toBeVisible();
	},
);

loginBaseTest(
	"cannot create project without name (required)",
	async ({ loginPage: page }) => {
		await navigateViaDrawer(page, "Projects", "/projects");

		await page.locator("#project-deadline").fill("2099-12-31");
		await page.locator("#project-submit button[type=submit]").click();

		await expect(page.locator("#project-name")).toHaveJSProperty(
			"validity.valueMissing",
			true,
		);
		await expect(page).toHaveURL(/\/projects$/);
	},
);

loginBaseTest(
	"cannot create project without deadline (required)",
	async ({ loginPage: page }) => {
		await navigateViaDrawer(page, "Projects", "/projects");

		await page.locator("#project-name").fill(`e2e-project-${Date.now()}`);
		await page.locator("#project-submit button[type=submit]").click();

		await page.locator("#project-deadline").clear();

		await expect(page.locator("#project-deadline")).toHaveJSProperty(
			"validity.valueMissing",
			true,
		);
		await expect(page).toHaveURL(/\/projects$/);
	},
);

loginBaseTest(
	"can't create project if logo is unconfirmed",
	async ({ loginPage: page }) => {
		await navigateViaDrawer(page, "Projects", "/projects");

		const name = page.locator("#project-name");
		const logo = page.locator("#project-submit #project-logo");

		await name.fill(uniq("e2e-project"));
		await logo.setInputFiles("./src/lib/assets/favicon.svg");
		await page.locator("#project-submit button[type=submit]").isDisabled();
	},
);
