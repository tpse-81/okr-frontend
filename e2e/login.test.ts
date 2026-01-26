import { expect, test } from "@playwright/test";

test("try successful login", async ({ page }) => {
	await page.goto("/login");
	await expect(page).toHaveURL((url) => url.pathname === "/login");
	await expect(page.locator("#username")).toBeVisible();
	await expect(page.locator("#password")).toBeVisible();
	await page.locator("#username").fill("admin");
	await page.locator("#password").fill("password");
	await page.locator("input[type=submit]").click();
	await expect(page).toHaveURL((url) => url.pathname === "/");
});

test("try empty username", async ({ page }) => {
	await page.goto("/login");
	await expect(page).toHaveURL((url) => url.pathname === "/login");
	await expect(page.locator("#username")).toBeVisible();
	await expect(page.locator("#password")).toBeVisible();
	await page.locator("#username").fill("");
	await page.locator("#password").fill("password");
	await page.locator("input[type=submit]").click();

	// Todo: Broken
	page.on("dialog", (dialog) =>
		expect(dialog.message()).toBe("Empty username or password."),
	);

	await expect(page).toHaveURL((url) => url.pathname === "/login");
});

test("try wrong username", async ({ page }) => {
	await page.goto("/login");
	await expect(page).toHaveURL((url) => url.pathname === "/login");
	await expect(page.locator("#username")).toBeVisible();
	await expect(page.locator("#password")).toBeVisible();
	await page.locator("#username").fill("Ha");
	await page.locator("#password").fill("password");
	await page.locator("input[type=submit]").click();
	await page.waitForTimeout(500);
	await expect(page).toHaveURL((url) => url.pathname === "/login");
});
