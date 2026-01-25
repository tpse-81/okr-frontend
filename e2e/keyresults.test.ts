import { expect, test } from '@playwright/test';

//Positive Case Test: 
test('can create a new objective and then a key result and see both in the lists', async ({ page }) => {
  // Login
  await page.goto('/login');
  await expect(page).toHaveURL(url => url.pathname === '/login');
  await page.locator('#username').fill('mustafa');
  await page.locator('#password').fill('mustafa');
  await page.locator('input[type=submit]').click();
  await expect(page).toHaveURL(url => url.pathname === '/');

  // Navigate to projects
  await page.locator('.navbar .drawer-content label[for="navigation-drawer"]').click();
  await page.locator('a[href="/projects"]').click();
  await expect(page).toHaveURL(url => url.pathname === '/projects');

  // Close drawer overlay if visible
  const overlay = page.locator('label.drawer-overlay[for="navigation-drawer"]');
  if (await overlay.isVisible()) {
    await overlay.click({ force: true });
    await expect(overlay).toBeHidden();
  }

  // Create project
  const projectName = `firstProject-${Date.now()}`;
  const deadline = '12';
  const creationDate = '22';

  await page.getByPlaceholder('Name').fill(projectName);
  await page.getByPlaceholder('Deadline').fill(deadline);
  await page.getByPlaceholder('Creation Date').fill(creationDate);

  await page.locator('#project-submit input[type=submit]').click();

  const projectCard = page.locator('li.card').filter({ hasText: projectName });
  await expect(projectCard).toBeVisible();

  // Go into project -> objective creation page
  await projectCard.locator('a').click();

  // Create objective
  const objectiveName = `obj-${Date.now()}`;
  const objectiveDescription = 'my first objective';

  await page.locator('#objective-submit').getByPlaceholder('Name').fill(objectiveName);
  await page.locator('#objective-submit').getByPlaceholder('description').fill(objectiveDescription);
  await page.locator('#objective-submit input[type=submit]').click();

  const objectiveCard = page.locator('li.card').filter({ hasText: objectiveName });
  await expect(objectiveCard).toBeVisible();

  // go into objective -> key results page
  await objectiveCard.locator('a').click();

  // Create key result
  const krDescription = `kr-${Date.now()}`;
  const startValue = '0';
  const endValue = '10';

  await page.locator('#keyResultSubmit').getByPlaceholder('description').fill(krDescription);
  await page.locator('#keyResultSubmit').getByPlaceholder('start value').fill(startValue);
  await page.locator('#keyResultSubmit').getByPlaceholder('end value').fill(endValue);

  await page.locator('#keyResultSubmit input[type=submit]').click();

  // Key Result should appear in list
  const keyResultCard = page.locator('li.card').filter({ hasText: krDescription });
  await expect(keyResultCard).toBeVisible();
});

//TODO: Negative Case Test: 
