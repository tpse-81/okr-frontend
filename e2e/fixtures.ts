import {
	test as base,
	expect as baseExpect,
	type Page,
} from "@playwright/test";

export const E2E_USERNAME = process.env.E2E_USERNAME ?? "admin";
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "password";

export const expect = baseExpect;

export function uniq(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function openNavigationDrawer(page: Page): Promise<void> {
	await page.locator("#navigation-drawer-toggle").click();
	await baseExpect(page.locator("#navigation-drawer-overlay")).toBeVisible();
}

export async function closeNavigationDrawer(page: Page): Promise<void> {
	const overlay = page.locator("#navigation-drawer-overlay");
	if (await overlay.isVisible().catch(() => false)) {
		await overlay.click({ force: true });
	}
}

export async function navigateViaDrawer(
	page: Page,
	linkName: string,
	expectedPath: string,
): Promise<void> {
	await openNavigationDrawer(page);
	await page.getByRole("link", { name: linkName, exact: true }).click();
	await baseExpect(page).toHaveURL(
		new RegExp(`${expectedPath.replace("/", "\\/")}$`),
	);
	await closeNavigationDrawer(page);
}

export const loginBaseTest = base.extend<{ loginPage: Page }>({
	loginPage: async ({ page }, use) => {
		await page.goto("/login");
		await baseExpect(page).toHaveURL(/\/login$/);

		await baseExpect(page.locator("#username")).toBeVisible();
		await baseExpect(page.locator("#password")).toBeVisible();

		await page.locator("#username").fill(E2E_USERNAME);
		await page.locator("#password").fill(E2E_PASSWORD);

		await page.locator("#login-submit input[type=submit]").click();
		await baseExpect(page).toHaveURL(/\/$/);

		await use(page);
	},
});

export const projectBaseTest = loginBaseTest.extend<{ projectPage: Page }>({
	projectPage: async ({ loginPage: page }, use) => {
		await navigateViaDrawer(page, "Projects", "/projects");

		const projectName = uniq("e2e-project");
		await page.locator("#project-name").fill(projectName);
		await page.locator("#project-deadline").fill("2099-12-31");

		await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/projects") && res.request().method() === "POST",
			),
			page.locator("#project-submit button[type=submit]").click(),
		]);

		const projectLink = page
			.locator("#projects-list")
			.getByRole("link", { name: new RegExp(projectName) });
		await baseExpect(projectLink).toBeVisible();
		await projectLink.click();
		await baseExpect(page).toHaveURL(/\/projects\/.+/);

		await use(page);
	},
});

export const objectiveBaseTest = projectBaseTest.extend<{
	objectivePage: Page;
}>({
	objectivePage: async ({ projectPage: page }, use) => {
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
		await baseExpect(objectiveLink).toBeVisible();
		await objectiveLink.click();
		await baseExpect(page).toHaveURL(/\/objectives\/.+/);

		await use(page);
	},
});

export const keyResultBaseTest = objectiveBaseTest.extend<{
	keyResultPage: Page;
}>({
	keyResultPage: async ({ objectivePage: page }, use) => {
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
		await baseExpect(krLink).toBeVisible();
		await krLink.click();
		await baseExpect(page).toHaveURL(/\/key_results\/.+/);

		await use(page);
	},
});
