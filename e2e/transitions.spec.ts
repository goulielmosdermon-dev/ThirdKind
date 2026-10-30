import { expect, test } from '@playwright/test';

for (const prefix of ['', '/mobile']) {
  test(`project navigation keeps one reading surface ${prefix || 'desktop'}`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/work`);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await page.locator(`a[href="${prefix}/work/scania"]`).first().click();
    await expect(page).toHaveURL(`${prefix}/work/scania`);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Vehicle E-Wallet',
    );
    await page.goBack();
    await expect(page).toHaveURL(`${prefix}/work`);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Work',
    );
    await page.goForward();
    await expect(page.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Vehicle E-Wallet',
    );
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page).toHaveURL(prefix || '/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

test('DOMO enters after trailing-slash redirects and preserves navigation handoff', async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.dataset.transitionEntry = String(
        document.documentElement.classList.contains('page-entering'),
      );
      document.documentElement.dataset.navHandoff = String(
        [...document.querySelectorAll('style')].some((style) =>
          style.textContent?.includes('.site-header{padding:'),
        ),
      );
    });
  });
  await page.goto('/DOMO');
  await page.locator('.header-nav a[href="/DOMO/about/"]').click();
  await expect(page).toHaveURL('/DOMO/about');
  await expect(page.locator('html')).toHaveAttribute(
    'data-transition-entry',
    'true',
  );
  await expect(page.locator('html')).toHaveAttribute(
    'data-nav-handoff',
    'true',
  );
  await expect(page.locator('html')).toHaveClass(/page-revealing/);
  await page.goBack();
  await expect(page).toHaveURL('/DOMO');
  await expect(page.locator('html')).not.toHaveClass(
    /page-leaving|page-entering/,
  );
});

test('DOMO reduced motion navigates without a transition overlay', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/DOMO');
  await page.locator('.header-nav a[href="/DOMO/about/"]').click();
  await expect(page).toHaveURL('/DOMO/about');
  await expect(page.locator('html')).not.toHaveClass(
    /page-leaving|page-entering|page-revealing/,
  );
});
