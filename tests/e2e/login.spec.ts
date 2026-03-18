import { expect, test } from '@playwright/test';

test('renders the login screen', async ({ page }) => {
	await page.goto('/#/login');

	await expect(page.locator('.login-center-title')).toHaveText('AD域盾防护平台');
	await expect(page.locator('input[name="username"]')).toBeVisible();
	await expect(page.locator('input[name="password"]')).toBeVisible();
	await expect(page.getByRole('button', { name: '登 录' })).toBeVisible();
});
