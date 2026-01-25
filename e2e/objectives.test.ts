import { expect, test } from '@playwright/test';

//1) Positive Case Test:  
test('can create a new objecitve and see it in the list', async ({ page }) => {
    
    //Successful Login first 
    await page.goto('/login');
    await expect(page).toHaveURL(url=>url.pathname == "/login")
    await page.locator('#username').fill('mustafa')
    await page.locator('#password').fill('mustafa')
    await page.locator('input[type=submit]').click()
    await expect(page).toHaveURL(url=>url.pathname == "/")

    //Go to /projects and create a project
    const projectName = `firstProject-${Date.now()}`;
    const deadline = '12';
    const creationDate = '22';
    
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

    //create an objective
    await projectCard.locator('a').click();

    const objectiveName = `obj-${Date.now()}`;
    const objectiveDescription = 'my first objective';

    await page.locator('#objective-submit').getByPlaceholder('Name').fill(objectiveName);
    await page.locator('#objective-submit').getByPlaceholder('description').fill(objectiveDescription);
    await page.locator('#objective-submit input[type=submit]').click();

    // Objective should appear in list
    const objectiveCard = page.locator('li.card').filter({ hasText: objectiveName });
    await expect(objectiveCard).toBeVisible();
    
});

// 2) TODO: Negative Case: 
