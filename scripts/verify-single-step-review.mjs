import { chromium } from '@playwright/test';

async function verifySingleStepReview() {
  console.log('Testing Single-Step Review and Confirmation on /review...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // Populate session via manual entry form
  await page.goto('http://localhost:3000/review/enter');
  await page.selectOption('select#category', 'food');
  await page.fill('input#regNo', '01-0812');
  await page.fill('input#brand', 'Golden Penny');
  await page.fill('input#product', 'Semovita 1kg Pack');
  await page.fill('input#manufacturer', 'Flour Mills of Nigeria Plc');
  await page.click('button[type="submit"]:has-text("Review details")');
  await page.waitForURL('**/review', { timeout: 10000 });

  console.log('Current URL:', page.url());
  // On /review, confirm number
  const confirmNumBtn = page.locator('button.tl-confirm-btn').first();
  await confirmNumBtn.click();
  console.log('✓ Number confirmed on /review');

  // On /review, confirm identity details
  const confirmIdBtn = page.locator('button.tl-confirm-btn:has-text("Confirm brand, product and maker")').first();
  await confirmIdBtn.click();
  console.log('✓ Identity confirmed on /review');

  // Verify primary CTA is now active and clickable
  const inspectBtn = page.locator('button:has-text("Inspect available evidence")').first();
  const isDisabled = await inspectBtn.isDisabled();
  console.log('Inspect button enabled:', !isDisabled);

  if (isDisabled) {
    throw new Error('Inspect available evidence button should be enabled after confirming both fields');
  }

  // Click Inspect available evidence directly on /review
  await inspectBtn.click();
  await page.waitForURL('**/result', { timeout: 15000 });
  console.log('✓ Successfully navigated directly from /review to /result:', page.url());

  await page.waitForSelector('.tl-verdict-slip', { timeout: 5000 });
  const hasVerdict = await page.locator('.tl-verdict-slip').isVisible();
  console.log('✓ Verdict slip visible on /result:', hasVerdict);

  await browser.close();
  console.log('Single-step verification test passed with 100% success!');
}

verifySingleStepReview().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
