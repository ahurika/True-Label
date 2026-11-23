import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

async function runProdSmokeTest() {
  console.log('Testing production build on port 3001...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1440x900)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL + '/');

    // Header check: ONLY logo and theme toggle, NO nav links
    const headerLogo = await page.locator('header .tl-header-logo').isVisible();
    const headerThemeToggle = await page.locator('header button[aria-label*="theme" i], header button.tl-theme-toggle').isVisible();
    const headerNavLinks = await page.locator('header nav, header .tl-desktop-nav').count();

    console.log('✓ Desktop header logo visible:', headerLogo);
    console.log('✓ Desktop header theme toggle visible:', headerThemeToggle);
    console.log('✓ Desktop header extra nav count (must be 0):', headerNavLinks);

    if (headerNavLinks > 0) {
      throw new Error(`Desktop header must NOT contain navigation links. Found ${headerNavLinks}`);
    }

    // Unified bottom dock visible on desktop
    const desktopDock = await page.locator('.tl-bottom-nav').isVisible();
    console.log('✓ Unified navigation dock visible on desktop:', desktopDock);

    // Primary CTA links directly to /scan/capture
    const scanCtaHref = await page.locator('a:has-text("Scan a product")').getAttribute('href');
    console.log('✓ Primary Scan CTA href:', scanCtaHref);
    if (scanCtaHref !== '/scan/capture') {
      throw new Error(`Expected primary CTA to link to /scan/capture, got ${scanCtaHref}`);
    }

    // Check headings have no numeric prefixes
    const homeHeadings = await page.locator('.tl-label-bold').allInnerTexts();
    console.log('✓ Home headings:', homeHeadings);
    for (const h of homeHeadings) {
      if (/^0\d\s*\//.test(h) || /^\d+\.\s*/.test(h)) {
        throw new Error(`Heading has decorative numeric prefix: "${h}"`);
      }
    }

    // Theme Toggle functional test
    const htmlThemeInitial = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log('✓ Initial HTML theme:', htmlThemeInitial);
    const themeBtn = page.locator('header button.tl-theme-toggle, header button[aria-label*="theme" i]').first();
    await themeBtn.click();
    await page.waitForTimeout(200);
    const htmlThemeToggled = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log('✓ Toggled HTML theme:', htmlThemeToggled);
    if (htmlThemeInitial === htmlThemeToggled) {
      throw new Error('Theme toggle did not switch data-theme on html element');
    }

    await page.close();
  }

  // 2. Mobile Test (390x844) & End-to-End Verification
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(BASE_URL + '/');

    // Bottom nav visible on mobile
    const bottomNav = await page.locator('.tl-bottom-nav').isVisible();
    console.log('✓ Mobile bottom nav visible:', bottomNav);

    // Execute complete scan & review flow
    await page.goto(BASE_URL + '/review/enter');
    await page.selectOption('select#category', 'food');
    await page.fill('input#regNo', '01-0812');
    await page.fill('input#brand', 'Golden Penny');
    await page.fill('input#product', 'Semovita 1kg Pack');
    await page.fill('input#manufacturer', 'Flour Mills of Nigeria Plc');
    await page.click('button[type="submit"]:has-text("Review details")');
    await page.waitForURL('**/review', { timeout: 10000 });

    // Confirm on single screen
    await page.locator('button.tl-confirm-btn').first().click();
    await page.locator('button.tl-confirm-btn:has-text("Confirm brand, product and maker")').first().click();
    await page.locator('button:has-text("Inspect available evidence")').first().click();

    await page.waitForURL('**/result', { timeout: 15000 });
    console.log('✓ Navigated to /result on production build:', page.url());

    await page.waitForSelector('.tl-verdict-slip', { timeout: 5000 });
    const hasCaveat = (await page.evaluate(() => document.body.innerText)).includes(
      'A registered number can appear on a copied or counterfeit pack'
    );
    console.log('✓ Mandatory copied-number caveat visible on production build:', hasCaveat);
    if (!hasCaveat) {
      throw new Error('Mandatory copied-number caveat missing on production result!');
    }

    await page.close();
  }

  // 3. Check How It Works and About for numeric prefixes
  {
    const page = await browser.newPage();
    await page.goto(BASE_URL + '/how-it-works');
    const hiwHeadings = await page.locator('.tl-label-bold').allInnerTexts();
    console.log('✓ How it works headings:', hiwHeadings);
    for (const h of hiwHeadings) {
      if (/^0\d\s*\//.test(h) || /^Priority\s*\d+:/.test(h)) {
        throw new Error(`How-it-works heading has numeric prefix: "${h}"`);
      }
    }

    await page.goto(BASE_URL + '/about');
    const aboutHeadings = await page.locator('.tl-label-bold').allInnerTexts();
    console.log('✓ About headings:', aboutHeadings);
    for (const h of aboutHeadings) {
      if (/^\d+\.\s*/.test(h)) {
        throw new Error(`About heading has numeric prefix: "${h}"`);
      }
    }

    await page.close();
  }

  await browser.close();
  console.log('ALL PRODUCTION AUDIT CHECKS PASSED SUCCESSFULLY!');
}

runProdSmokeTest().catch((err) => {
  console.error('Prod smoke test error:', err);
  process.exit(1);
});
