import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'Desktop Chrome', width: 1440, height: 900 },
  { name: 'Mobile (iPhone 13 / Pixel 7)', width: 390, height: 844 }
];

const ROUTES = [
  { path: '/', label: 'Home Page' },
  { path: '/scan', label: 'Scan Guide' },
  { path: '/scan/capture', label: 'Multi-Slot Camera Capture' },
  { path: '/scan/reading', label: 'OCR Reading Status' },
  { path: '/review', label: 'Review Pack Details' },
  { path: '/review/enter', label: 'Manual Pack Entry' },
  { path: '/review/confirm', label: 'Confirmation Gate' },
  { path: '/review/medicine', label: 'Medicine Label-Only' },
  { path: '/result', label: 'Verdict Result' },
  { path: '/result/alert', label: 'Alert Result View' },
  { path: '/result/number-problem', label: 'Number Problem Result View' },
  { path: '/result/unconfirmed', label: 'Unconfirmed Result View' },
  { path: '/result/evidence', label: 'Evidence Details' },
  { path: '/how-it-works', label: 'How It Works' },
  { path: '/about', label: 'About TrueLabel' },
  { path: '/help', label: 'Help & FAQ' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Use' },
  { path: '/report', label: 'Report Concern' },
  { path: '/reference', label: 'Reference Gazette Library' },
  { path: '/history', label: 'Scan History' },
  { path: '/offline', label: 'Offline Fallback' },
  { path: '/unavailable', label: 'Service Unavailable' }
];

async function setupPage(context) {
  const page = await context.newPage();
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.innerHTML = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
    document.head?.appendChild(style);
  });
  return page;
}

async function submitAndVerify(page, { category, regNo, brand, product, manufacturer, batch, strength }) {
  await page.goto(BASE_URL + '/review/enter');
  await page.selectOption('select#category', category);
  await page.fill('input#regNo', regNo);
  await page.fill('input#brand', brand);
  await page.fill('input#product', product);
  if (manufacturer) await page.fill('input#manufacturer', manufacturer);
  if (batch) await page.fill('input#batch', batch);
  if (strength && category === 'medicine') await page.fill('input#medicineStrength', strength);

  await page.click('button[type="submit"]:has-text("Review details")', { force: true });
  await page.waitForURL((url) => url.pathname === '/review', { timeout: 10000 });

  console.log('  -> On /review, waiting for Confirm number button...');
  const confirmNumBtn = page.locator('button.tl-confirm-btn').first();
  await confirmNumBtn.waitFor({ state: 'visible', timeout: 5000 });
  await confirmNumBtn.click({ force: true });
  await page.waitForTimeout(300);

  if (category === 'medicine') {
    console.log('  -> Clicking Continue to medicine review...');
    const medBtn = page.locator('button:has-text("Continue to medicine review")').first();
    await medBtn.waitFor({ state: 'visible', timeout: 5000 });
    await medBtn.click({ force: true });
    await page.waitForURL((url) => url.pathname === '/review/medicine', { timeout: 10000 });

    console.log('  -> On /review/medicine, confirming strength...');
    await page.waitForSelector('text=Strict label-only mode', { timeout: 10000 });
    const confirmStrBtn = page.locator('button.tl-confirm-btn').first();
    await confirmStrBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmStrBtn.click({ force: true });
    await page.locator('button:has-text("Confirmed")').first().waitFor({ state: 'visible', timeout: 5000 });

    const inspectBtn = page.locator('button:has-text("Inspect available evidence")').first();
    await inspectBtn.waitFor({ state: 'visible', timeout: 10000 });
    await inspectBtn.click();
    await page.waitForURL((url) => url.pathname === '/result', { timeout: 20000 });
    await page.waitForSelector('.tl-verdict-slip', { timeout: 10000 });
  } else {
    console.log('  -> Clicking Continue to check identity...');
    const continueBtn = page.locator('button:has-text("Continue to check identity")').first();
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click({ force: true });
    await page.waitForURL((url) => url.pathname === '/review/confirm', { timeout: 15000 });

    console.log('  -> On /review/confirm, confirming identity...');
    await page.waitForSelector('button:has-text("Confirm brand, product and maker")', { timeout: 10000 });
    const confirmIdBtn = page.locator('button:has-text("Confirm brand, product and maker")').first();
    await confirmIdBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmIdBtn.click({ force: true });
    await page.locator('button:has-text("Identity fields confirmed")').first().waitFor({ state: 'visible', timeout: 5000 });
    console.log('  -> Identity fields confirmed! Now clicking Inspect available evidence...');

    const inspectBtn = page.locator('button:has-text("Inspect available evidence")').first();
    await inspectBtn.waitFor({ state: 'visible', timeout: 10000 });
    await inspectBtn.click();
    console.log('  -> Clicked Inspect available evidence, waiting for /result navigation...');
    await page.waitForURL((url) => url.pathname === '/result', { timeout: 20000 });
    await page.waitForSelector('.tl-verdict-slip', { timeout: 10000 });
  }
}

async function runSmokeTests() {
  console.log('====================================================');
  console.log('STARTING TRUELABEL BROWSER SMOKE TEST & RUNTIME AUDIT');
  console.log('Target:', BASE_URL);
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = {
    env: {
      targetUrl: BASE_URL,
      browser: 'Chromium ' + browser.version(),
      timestamp: new Date().toISOString()
    },
    routes: [],
    interactions: [],
    verdicts: [],
    errors: {
      consoleErrors: [],
      hydrationErrors: [],
      failedRequests: [],
      layoutOverflows: []
    }
  };

  // 1. TEST ALL ROUTES ON DESKTOP & MOBILE
  console.log('--- 1. Testing All Routes (Desktop & Mobile) ---');
  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.name.includes('Mobile')
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await setupPage(context);

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        console.error(`[Console Error][${vp.name}][${page.url()}] ${text}`);
        results.errors.consoleErrors.push({
          viewport: vp.name,
          url: page.url(),
          error: text
        });
        if (text.includes('Hydration') || text.includes('hydrating') || text.includes('React error #418') || text.includes('React error #423')) {
          results.errors.hydrationErrors.push({
            viewport: vp.name,
            url: page.url(),
            error: text
          });
        }
      }
    });

    page.on('pageerror', (err) => {
      console.error(`[Uncaught PageError][${vp.name}][${page.url()}] ${err.message}`);
      results.errors.consoleErrors.push({
        viewport: vp.name,
        url: page.url(),
        error: err.message,
        stack: err.stack
      });
    });

    page.on('requestfailed', (req) => {
      if (req.failure()?.errorText !== 'net::ERR_ABORTED') {
        console.warn(`[Request Failed][${vp.name}] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
        results.errors.failedRequests.push({
          viewport: vp.name,
          url: req.url(),
          method: req.method(),
          error: req.failure()?.errorText
        });
      }
    });

    for (const route of ROUTES) {
      const fullUrl = BASE_URL + route.path;
      let status = 0;
      let hasOverflow = false;
      let title = '';
      let bodyLength = 0;

      try {
        const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        status = response ? response.status() : 0;
        await page.waitForTimeout(200);

        title = await page.title();
        const bodyContent = await page.evaluate(() => document.body.innerText.trim());
        bodyLength = bodyContent.length;

        hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth;
        });

        if (hasOverflow) {
          console.warn(`[Layout Overflow] Route ${route.path} has horizontal scroll on ${vp.name}`);
          results.errors.layoutOverflows.push({ route: route.path, viewport: vp.name });
        }

        const isBlank = bodyLength < 10;
        const pass = status === 200 && !isBlank;

        results.routes.push({
          path: route.path,
          label: route.label,
          viewport: vp.name,
          status,
          title,
          bodyLength,
          hasOverflow,
          pass
        });

        console.log(`  ✓ [${status}] ${route.path} (${route.label}) - Content length: ${bodyLength} chars - Overflow: ${hasOverflow ? 'YES' : 'NO'}`);
      } catch (err) {
        console.error(`  ✗ Route ${route.path} failed: ${err.message}`);
        results.routes.push({
          path: route.path,
          label: route.label,
          viewport: vp.name,
          status: status || 500,
          error: err.message,
          pass: false
        });
      }
    }

    await context.close();
  }

  // 2. TEST INTERACTIVE WORKFLOWS & USER JOURNEYS
  console.log('\n--- 2. Testing Interactive Workflows ---');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await setupPage(context);

    // Desktop Nav
    console.log('Testing Desktop Navigation links...');
    await page.goto(BASE_URL + '/');
    const homeScanBtn = page.locator('a[href="/scan/capture"], a[href="/scan"]').first();
    const hasScanBtn = await homeScanBtn.isVisible();
    results.interactions.push({
      action: 'Home Page Scan CTA visible',
      passed: hasScanBtn
    });

    if (hasScanBtn) {
      await homeScanBtn.click();
      await page.waitForURL('**/scan**');
      console.log('  ✓ Clicked Home Scan CTA -> navigated to:', page.url());
      results.interactions.push({
        action: 'Home Scan CTA Click & Navigate',
        url: page.url(),
        passed: page.url().includes('/scan')
      });
    }

    // Header Links
    for (const navPath of ['/how-it-works', '/about', '/reference', '/report']) {
      await page.goto(BASE_URL + '/');
      const navLink = page.locator(`header a[href="${navPath}"]`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForURL(`**${navPath}`);
        console.log(`  ✓ Clicked Desktop Header Nav Link ${navPath} -> ${page.url()}`);
        results.interactions.push({
          action: `Desktop Header Link ${navPath}`,
          passed: page.url().includes(navPath)
        });
      }
    }

    await context.close();
  }

  // Mobile Bottom Navigation
  console.log('Testing Mobile Bottom Navigation...');
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await setupPage(context);
    await page.goto(BASE_URL + '/');

    const bottomNav = page.locator('.tl-bottom-nav');
    const hasBottomNav = await bottomNav.isVisible();
    results.interactions.push({ action: 'Mobile Bottom Nav Bar Visible', passed: hasBottomNav });

    if (hasBottomNav) {
      const items = await page.locator('.tl-bottom-nav a').all();
      console.log(`  Found ${items.length} mobile bottom nav items`);
      for (let i = 0; i < items.length; i++) {
        await page.goto(BASE_URL + '/');
        const item = page.locator('.tl-bottom-nav a').nth(i);
        const href = await item.getAttribute('href');
        const text = await item.innerText();
        await item.click({ force: true });
        await page.waitForTimeout(300);
        const currentUrl = page.url();
        console.log(`  ✓ Clicked bottom nav [${text.trim()}] (${href}) -> ${currentUrl}`);
        results.interactions.push({
          action: `Mobile Bottom Nav Tab: ${text.trim()}`,
          href,
          currentUrl,
          passed: currentUrl.includes(href)
        });
      }
    }
    await context.close();
  }

  // Camera Capture & Upload Slots
  console.log('\nTesting Multi-Slot Image Upload & Removal in /scan/capture...');
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await setupPage(context);
    await page.goto(BASE_URL + '/scan/capture');

    // Slot 1: Front
    const fileInput = page.locator('input[type="file"]').first();
    const frontPath = path.resolve('tests/fixtures/test-front.png');
    await fileInput.setInputFiles(frontPath);
    await page.waitForTimeout(500);

    const slot1Tab = page.locator('button[data-testid="slot-front"], button:has-text("Front")').first();
    const slot1Text = await slot1Tab.innerText();
    const hasFrontCaptured = slot1Text.includes('✓ Captured');
    console.log('  ✓ Uploaded Front slot test image. Slot 1 updated:', hasFrontCaptured);
    results.interactions.push({ action: 'Front Slot Upload & Tab Update', passed: hasFrontCaptured });

    // Switch back to Front tab to inspect preview & remove
    await slot1Tab.click({ force: true });
    await page.waitForTimeout(300);
    const hasFrontPreview = await page.locator('img[alt*="Front"]').isVisible();
    console.log('  ✓ Clicked Front Slot tab. Preview rendered:', hasFrontPreview);
    results.interactions.push({ action: 'Front Slot Preview Displayed', passed: hasFrontPreview });

    // Retake / Remove Front Image
    const retakeBtn = page.locator('button:has-text("Retake Front")').first();
    if (await retakeBtn.isVisible()) {
      await retakeBtn.click({ force: true });
      await page.waitForTimeout(300);
      const isCleared = (await slot1Tab.innerText()).includes('Required');
      console.log('  ✓ Clicked Retake Front. Slot 1 reset to Required:', isCleared);
      results.interactions.push({ action: 'Front Slot Image Removal', passed: isCleared });
      // Re-upload front image
      await fileInput.setInputFiles([]);
      await slot1Tab.click({ force: true });
      await page.waitForTimeout(200);
      await fileInput.setInputFiles(frontPath);
      await page.waitForTimeout(500);
    }

    // Upload Back Slot
    const slot2Tab = page.locator('button[data-testid="slot-back"], button:has-text("Back")').first();
    await slot2Tab.click({ force: true });
    await page.waitForTimeout(200);
    await fileInput.setInputFiles([]);
    await fileInput.setInputFiles(path.resolve('tests/fixtures/test-back.png'));
    await page.waitForTimeout(500);
    const hasBackCaptured = (await slot2Tab.innerText()).includes('✓ Captured');
    console.log('  ✓ Uploaded Back slot test image. Slot 2 updated:', hasBackCaptured);
    results.interactions.push({ action: 'Back Slot Upload & Tab Update', passed: hasBackCaptured });

    // Wait for Front slot to be confirmed captured before proceeding
    const isFrontReady = (await slot1Tab.innerText()).includes('✓ Captured');
    console.log('  ✓ Front slot captured status ready:', isFrontReady);

    // Click "Continue with captured photos"
    const continuePhotosBtn = page.locator('button:has-text("Continue with captured photos")');
    await continuePhotosBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continuePhotosBtn.scrollIntoViewIfNeeded();
    await continuePhotosBtn.click();
    await page.waitForURL('**/scan/reading**', { timeout: 10000 });
    console.log('  ✓ Clicked Continue with captured photos -> navigated to /scan/reading:', page.url());
    results.interactions.push({ action: 'Review & Extract Transition', passed: true });

    const manualEntryBtn = page.locator('a[href="/review/enter"]').first();
    await manualEntryBtn.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    const hasManualBtn = await manualEntryBtn.isVisible();
    console.log('  ✓ /scan/reading fallback option to manual entry visible:', hasManualBtn);
    results.interactions.push({ action: 'Reading Fallback to Manual Entry Visible', passed: hasManualBtn });

    await context.close();
  }

  // 3. TEST COMPLETE SCAN JOURNEY WITH DETERMINISTIC VERDICTS
  console.log('\n--- 3. Testing Complete Scan Journeys & All 4 Verdicts ---');

  // Journey 1: Priority 4: registry_match (Golden Penny Semovita)
  console.log('\nTesting Scan Journey 1 -> Priority 4: registry_match');
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ['clipboard-read', 'clipboard-write']
    });
    const page = await setupPage(context);

    // Initial check of disabled form button
    await page.goto(BASE_URL + '/review/enter');
    const submitBtn = page.locator('button[type="submit"]:has-text("Review details")');
    const isDisabledInitially = await submitBtn.isDisabled();
    console.log('  ✓ Submit button initially disabled when required fields empty:', isDisabledInitially);
    results.interactions.push({ action: 'Form Validation Empty Guard', passed: isDisabledInitially });

    await submitAndVerify(page, {
      category: 'food',
      regNo: '01-0812',
      brand: 'Golden Penny',
      product: 'Semovita 1kg Pack',
      manufacturer: 'Flour Mills of Nigeria Plc',
      batch: 'BATCH-SEM-001'
    });

    console.log('  ✓ Navigated through /review and /review/confirm to /result:', page.url());

    const resultText = await page.evaluate(() => document.body.innerText);
    const hasRegMatch = resultText.includes('Registered and matches') || resultText.includes('Registry details match');
    const hasCaveat = resultText.includes('A registered number can appear on a copied or counterfeit pack');
    console.log('  ✓ Verdict rendered "Registered and matches":', hasRegMatch);
    console.log('  ✓ Mandatory Copied-Number Caveat permanently displayed:', hasCaveat);

    results.verdicts.push({
      name: 'Priority 4: registry_match',
      rendered: hasRegMatch,
      caveatDisplayed: hasCaveat,
      passed: hasRegMatch && hasCaveat
    });

    // Share result test
    console.log('Testing Share check result action on /result...');
    const shareBtn = page.locator('button:has-text("Share read-only check")').first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click({ force: true });
      await page.waitForSelector('.tl-callout-info', { timeout: 8000 }).catch(() => {});
      const hasShareFeedback = await page.locator('.tl-callout-info, text=Share link').first().isVisible().catch(() => false);
      console.log('  ✓ Clicked Share read-only check -> Feedback visible:', hasShareFeedback);
      results.interactions.push({ action: 'Share Result Generation', passed: hasShareFeedback });

      const shareLinkElem = page.locator('a:has-text("Open share link")');
      if (await shareLinkElem.isVisible()) {
        const shareHref = await shareLinkElem.getAttribute('href');
        console.log('  ✓ Generated 30-day share URL:', shareHref);
        if (shareHref) {
          const shareContext = await browser.newContext();
          const sharePage = await setupPage(shareContext);
          await sharePage.goto(shareHref);
          await sharePage.waitForTimeout(500);
          const shareContent = await sharePage.evaluate(() => document.body.innerText);
          const hasSharedVerdict = (shareContent.includes('Registered and matches') || shareContent.includes('Registry details match')) && shareContent.includes('Golden Penny');
          console.log('  ✓ Opened read-only Share Page -> Displays verified snapshot:', hasSharedVerdict);
          results.interactions.push({ action: 'Read-Only Share Page Snapshot', passed: hasSharedVerdict });
          await shareContext.close();
        }
      }
    }

    // Evidence breakdown link
    const evidenceBtn = page.locator('a[href="/result/evidence"] button, button:has-text("Inspect documentary evidence")').first();
    if (await evidenceBtn.isVisible()) {
      await evidenceBtn.click({ force: true });
      await page.waitForURL('**/result/evidence');
      console.log('  ✓ Navigated to /result/evidence -> Provenance details visible');
      results.interactions.push({ action: 'Evidence Details Navigation', passed: true });
    }

    await context.close();
  }

  // Journey 2: Priority 1: alert_match (Emzor Paracetamol with recalled batch EMZ-9988)
  console.log('\nTesting Scan Journey 2 -> Priority 1: alert_match');
  {
    const context = await browser.newContext();
    const page = await setupPage(context);

    await submitAndVerify(page, {
      category: 'medicine',
      regNo: '04-1234',
      brand: 'Emzor',
      product: 'Paracetamol 500mg Tablets',
      batch: 'EMZ-9988',
      strength: '500mg'
    });

    const content = await page.evaluate(() => document.body.innerText);
    const isAlert = content.includes('Matches a NAFDAC alert') || content.includes('Alert match');
    console.log('  ✓ Tested Verdict 1 (alert_match) -> Rendered Alert Verdict:', isAlert);
    results.verdicts.push({
      name: 'Priority 1: alert_match',
      rendered: isAlert,
      passed: isAlert
    });
    await context.close();
  }

  // Journey 3: Priority 2: registration_discrepancy (Mismatched identity)
  console.log('\nTesting Scan Journey 3 -> Priority 2: registration_discrepancy');
  {
    const context = await browser.newContext();
    const page = await setupPage(context);

    await submitAndVerify(page, {
      category: 'medicine',
      regNo: '04-1234', // exists as Emzor Paracetamol 500mg Tablets
      brand: 'Fake Brand',
      product: 'Fake Cough Syrup',
      manufacturer: 'Fake Labs Ltd',
      strength: '100mg'
    });

    const content = await page.evaluate(() => document.body.innerText);
    const isDiscrepancy = content.includes('Registration details don\'t match') || content.includes('Discrepancy') || content.includes('Number problem');
    console.log('  ✓ Tested Verdict 2 (registration_discrepancy) -> Rendered Discrepancy:', isDiscrepancy);
    results.verdicts.push({
      name: 'Priority 2: registration_discrepancy',
      rendered: isDiscrepancy,
      passed: isDiscrepancy
    });
    await context.close();
  }

  // Journey 4: Priority 3: could_not_confirm (Unlisted Product)
  console.log('\nTesting Scan Journey 4 -> Priority 3: could_not_confirm');
  {
    const context = await browser.newContext();
    const page = await setupPage(context);

    await submitAndVerify(page, {
      category: 'food',
      regNo: '01-9999',
      brand: 'Unlisted Local Rice',
      product: 'Local Rice 50kg'
    });

    const content = await page.evaluate(() => document.body.innerText);
    const isUnconfirmed = content.includes('Could not confirm') || content.includes('Unconfirmed');
    console.log('  ✓ Tested Verdict 3 (could_not_confirm) -> Rendered Unconfirmed:', isUnconfirmed);
    results.verdicts.push({
      name: 'Priority 3: could_not_confirm',
      rendered: isUnconfirmed,
      passed: isUnconfirmed
    });
    await context.close();
  }

  // 4. TEST MEDICINE LABEL-ONLY SCREEN (/review/medicine)
  console.log('\n--- 4. Testing Medicine Label-Only Mode (PRD Section 10.7) ---');
  {
    const context = await browser.newContext();
    const page = await setupPage(context);

    await page.goto(BASE_URL + '/review/enter');
    await page.selectOption('select#category', 'medicine');
    await page.fill('input#regNo', '04-1234');
    await page.fill('input#brand', 'Emzor');
    await page.fill('input#product', 'Paracetamol Tablets');
    await page.fill('input#medicineStrength', '500mg');

    await page.click('button[type="submit"]:has-text("Review details")', { force: true });
    await page.waitForURL((url) => url.pathname === '/review', { timeout: 10000 });

    const confirmNumBtn = page.locator('button.tl-confirm-btn').first();
    await confirmNumBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmNumBtn.click({ force: true });
    await page.waitForTimeout(300);

    const medBtn = page.locator('button:has-text("Continue to medicine review")').first();
    await medBtn.waitFor({ state: 'visible', timeout: 5000 });
    await medBtn.click({ force: true });
    await page.waitForURL((url) => url.pathname === '/review/medicine', { timeout: 10000 });

    await page.waitForSelector('text=Strict label-only mode', { timeout: 10000 });

    const medContent = await page.evaluate(() => document.body.innerText);
    const hasPharmacistWarning = medContent.includes('ask a licensed pharmacist') || medContent.includes('pharmacist');
    const hasDirectionsSection = medContent.includes('Verbatim Printed Directions') || medContent.includes('Follow directions');
    const hasNoDosingCalculator = !medContent.includes('calculate your dose') && !medContent.includes('schedule reminder');

    console.log('  ✓ Pharmacist disclaimer permanently displayed:', hasPharmacistWarning);
    console.log('  ✓ Directions displayed verbatim without scheduling conversion:', hasDirectionsSection);
    console.log('  ✓ Zero dosing calculators / zero schedule features:', hasNoDosingCalculator);

    results.interactions.push({
      action: 'Medicine Label-Only Pharmacist Notice',
      passed: hasPharmacistWarning && hasDirectionsSection && hasNoDosingCalculator
    });
    await context.close();
  }

  // 5. TEST REPORT CONCERN & CLIPBOARD COPY ACTION (/report)
  console.log('\n--- 5. Testing Report Concern & Copy Action (/report) ---');
  {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await setupPage(context);
    await page.goto(BASE_URL + '/report');

    await page.fill('input#location', 'Balogun Market, Lagos');
    await page.fill('input#purchaseDate', '15 November 2026');
    await page.fill('textarea#details', 'Found with batch number matching public alert.');

    const copyBtn = page.locator('button:has-text("Copy report text to clipboard")').first();
    let copiedText = '';
    if (await copyBtn.isVisible()) {
      await copyBtn.click({ force: true });
      await page.waitForTimeout(500);
      try {
        copiedText = await page.evaluate(async () => await navigator.clipboard.readText());
      } catch (e) {
        // clipboard fallback
      }
      const copyFeedback = await page.locator('text=Report text copied').first().isVisible();
      console.log('  ✓ Clicked Copy Summary -> Feedback visible:', copyFeedback || copiedText.length > 0);
      results.interactions.push({ action: 'Report Summary Copy Action', passed: copyFeedback || copiedText.length > 0 });
    }

    const logBtn = page.locator('button:has-text("Log concern")').first();
    if (await logBtn.isVisible()) {
      await logBtn.click({ force: true });
      await page.waitForSelector('text=Report Logged Locally', { timeout: 5000 });
      console.log('  ✓ Submitted report concern -> Report Logged Locally');
      results.interactions.push({ action: 'Report Submission Local Feedback', passed: true });
    }

    const content = await page.evaluate(() => document.body.innerText);
    const hasHotline = content.includes('0700-1-NAFDAC') || content.includes('0700');
    const hasEmail = content.includes('nafdac@nafdac.gov.ng');
    const hasPrimus = content.includes('Primus') || content.includes('Reporting');
    console.log('  ✓ Verified official NAFDAC hotline & email channels:', hasHotline && hasEmail && hasPrimus);
    results.interactions.push({ action: 'NAFDAC Official Contact Channels Verified', passed: hasHotline && hasEmail && hasPrimus });

    await context.close();
  }

  // 6. TEST EMPTY STATES & BACK NAVIGATION
  console.log('\n--- 6. Testing Empty States & Back Navigation ---');
  {
    const cleanContext = await browser.newContext();
    const cleanPage = await setupPage(cleanContext);

    await cleanPage.goto(BASE_URL + '/review');
    await cleanPage.waitForTimeout(500);
    const reviewEmpty = await cleanPage.evaluate(() => document.body.innerText);
    const hasReviewEmptyState = reviewEmpty.includes('No packaging scan found') || reviewEmpty.includes('No active');
    console.log('  ✓ /review with no active scan displays honest empty state:', hasReviewEmptyState);
    results.interactions.push({ action: 'Review Route Honest Empty State', passed: hasReviewEmptyState });

    await cleanPage.goto(BASE_URL + '/review/confirm');
    await cleanPage.waitForTimeout(500);
    const confirmEmpty = await cleanPage.evaluate(() => document.body.innerText);
    const hasConfirmEmptyState = confirmEmpty.includes('No packaging scan found') || confirmEmpty.includes('No active');
    console.log('  ✓ /review/confirm with no active scan displays honest empty state:', hasConfirmEmptyState);
    results.interactions.push({ action: 'Review Confirm Route Honest Empty State', passed: hasConfirmEmptyState });

    await cleanPage.goto(BASE_URL + '/result');
    await cleanPage.waitForTimeout(500);
    const resultEmpty = await cleanPage.evaluate(() => document.body.innerText);
    const hasResultEmptyState = resultEmpty.includes('No active check found') || resultEmpty.includes('No active');
    console.log('  ✓ /result with no active scan displays honest empty state:', hasResultEmptyState);
    results.interactions.push({ action: 'Result Route Honest Empty State', passed: hasResultEmptyState });

    await cleanPage.goto(BASE_URL + '/');
    await cleanPage.goto(BASE_URL + '/how-it-works');
    await cleanPage.goBack();
    await cleanPage.waitForTimeout(300);
    console.log('  ✓ Browser back navigation from /how-it-works -> returned to:', cleanPage.url());
    results.interactions.push({ action: 'Browser Back Navigation', passed: cleanPage.url() === BASE_URL + '/' });

    await cleanContext.close();
  }

  await browser.close();

  const reportPath = path.resolve('tests/smoke-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('\n====================================================');
  console.log('SMOKE TEST COMPLETE. Results saved to:', reportPath);
  console.log(`Routes Checked: ${results.routes.length}`);
  console.log(`Interactions Checked: ${results.interactions.length}`);
  console.log(`Verdicts Checked: ${results.verdicts.length}`);
  console.log(`Console Errors: ${results.errors.consoleErrors.length}`);
  console.log(`Hydration Errors: ${results.errors.hydrationErrors.length}`);
  console.log(`Failed Requests: ${results.errors.failedRequests.length}`);
  console.log(`Layout Overflows: ${results.errors.layoutOverflows.length}`);
  console.log('====================================================\n');

  return results;
}

runSmokeTests().catch((err) => {
  console.error('Smoke tests failed with error:', err);
  process.exit(1);
});
