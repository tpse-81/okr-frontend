import { expect, test } from '@playwright/test';

// 1) Seite lädt, Formular ist sichtbar, und es gibt entweder
//    "Keine Projekte geladen" ODER mindestens eine Projekt-Card.
test('projects page shows form and either empty state or a project list', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(url => url.pathname == '/projects');

    // Formular vorhanden
    await expect(page.locator('#project-submit')).toBeVisible();
    await expect(page.getByPlaceholder('Name')).toBeVisible();
    await expect(page.getByPlaceholder('Deadline')).toBeVisible();
    await expect(page.getByPlaceholder('Creation Date')).toBeVisible();

    // Entweder Empty-State ODER mindestens ein Projekt
    const emptyState = page.getByText('Keine Projekte geladen');
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    if (!hasEmptyState) {
        const firstCard = page.locator('li.card').first();
        await expect(firstCard).toBeVisible();
    }
});

// 2) Positive Case Test: 
test('can create a new project and see it in the list', async ({ page }) => {
    
    //Successful Login first 
    await page.goto('/login');
    await expect(page).toHaveURL(url=>url.pathname == "/login")
    await page.locator('#username').fill('mustafa')
    await page.locator('#password').fill('mustafa')
    await page.locator('input[type=submit]').click()
    await expect(page).toHaveURL(url=>url.pathname == "/")

    const projectName = `firstProject-${Date.now()}`;
    const deadline = '12';
    const creationDate = '22';

    //Go to /projects and create a project
    await page.locator('.navbar .drawer-content label[for="navigation-drawer"]').click();
    await page.locator('a[href="/projects"]').click();
    await expect(page).toHaveURL(url => url.pathname === '/projects');
    
    const overlay = page.locator('label.drawer-overlay[for="navigation-drawer"]');
    if (await overlay.isVisible()) {
        await overlay.click({ force: true }); // schließt den Drawer
        await expect(overlay).toBeHidden();   // sicherstellen, dass er weg ist
    }

        
    await page.getByPlaceholder('Name').fill(projectName);
    await page.getByPlaceholder('Deadline').fill(deadline);
    await page.getByPlaceholder('Creation Date').fill(creationDate);

    await page.locator('#project-submit input[type=submit]').click();

    const projectCard = page.locator('li.card').filter({ hasText: projectName });
    await expect(projectCard).toBeVisible();

});

// 3) TODO: Negative Case: 
