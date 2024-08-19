import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/application');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Chomp/);
  await expect(page.locator('#expiring')).toHaveText("Expiring soon!")
});

