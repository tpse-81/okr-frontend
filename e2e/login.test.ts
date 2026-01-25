import { expect, test } from '@playwright/test';

test('try successful login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(url=>url.pathname == "/login")
    await page.locator('#username').fill('mustafa')
    await page.locator('#password').fill('mustafa')
    await page.locator('input[type=submit]').click()
    await expect(page).toHaveURL(url=>url.pathname == "/")
});

test('try empty username', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(url=>url.pathname == "/login")

    await page.locator('#username').fill('')
    await page.locator('#password').fill('asdf')
    await page.locator('input[type=submit]').click()

    const error = page.locator('.alert.alert-error span');
    await expect(error).toBeVisible();
    await expect(error).toHaveText('Empty username or password.');

    await expect(page).toHaveURL(url=>url.pathname == "/login")
});

test('try wrong username', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(url=>url.pathname == "/login")

    await page.locator('#username').fill('asd')
    await page.locator('#password').fill('asd')
    await page.locator('input[type=submit]').click()
  
    const error = page.locator('.alert.alert-error span');
    await expect(error).toBeVisible({ timeout: 10_000 });
    await expect(error).toHaveText('Wrong username or password.');

    await expect(page).toHaveURL(url=>url.pathname == "/login")
});



