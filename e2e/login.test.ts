import { expect, test } from "@playwright/test";

test("try successful login", async ({ page }) => {
	await page.goto("/login");
	await expect(page).toHaveURL(/\/login$/);

	await page.locator("#username").fill("admin");
	await page.locator("#password").fill("password");
	await page.locator("#login-submit input[type=submit]").click();

	await expect(page).toHaveURL(/\/dashboard$/);
});

test("try empty username", async ({ page }) => {
	await page.goto("/login");
	await expect(page).toHaveURL(/\/login$/);

	await page.locator("#username").fill("");
	await page.locator("#password").fill("password");
	await page.locator("#login-submit input[type=submit]").click();

	await expect(page.locator("#username")).toHaveJSProperty(
		"validity.valueMissing",
		true,
	);
	await expect(page).toHaveURL(/\/login$/);
});

test("try wrong username", async ({ page }) => {
	await page.goto("/login");
	await expect(page).toHaveURL(/\/login$/);

	await page.locator("#username").fill("wrong-user");
	await page.locator("#password").fill("password");
	await page.locator("#login-submit input[type=submit]").click();

	await expect(page.locator("#login-error")).toBeVisible();
	await expect(page.locator("#login-error")).toHaveText(
		/Wrong username or password\./,
	);
	await expect(page).toHaveURL(/\/login$/);
});
