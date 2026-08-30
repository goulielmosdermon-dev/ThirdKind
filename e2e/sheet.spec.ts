import { expect, test } from '@playwright/test';

test.describe('sheet routing', () => {
  test('open from canvas, deep-link, back, and close', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Third', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Rap Therapy/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/work\/rap-therapy$/);
    await expect(
      dialog.getByRole('heading', { name: /Will It Ever Stop/ }),
    ).toBeVisible();

    await page.goto('/work/scania');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Third', { exact: true })).toBeVisible();
    await expect(page.getByText('Kind', { exact: true })).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: /Rap Therapy/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: /Rap Therapy/ }).click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 8000 });
    await expect(page).toHaveURL('/');
  });

  test('escape and backdrop dismiss the sheet', async ({ page }) => {
    await page.goto('/thoughts/from-idea-to-impact-our-approach-to-production');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 8000 });
    await expect(page).toHaveURL('/');

    await page.goto('/about/team');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close overlay' }).click({
      position: { x: 16, y: 16 },
    });
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 8000 });
    await expect(page).toHaveURL('/');
  });
});
