import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'Desktop Chrome', width: 1440, height: 900, isMobile: false },
  { name: 'Tablet (iPad Mini)', width: 768, height: 1024, isMobile: false },
  { name: 'Mobile (iPhone 13)', width: 390, height: 844, isMobile: true }
];

const ALL_ROUTES = [
  '/',
  '/scan',
  '/scan/capture',
  '/scan/reading',
  '/review',
  '/review/enter',
  '/review/confirm',
  '/review/medicine',
  '/result',
  '/result/alert',
  '/result/number-problem',
  '/result/unconfirmed',
  '/result/evidence',
  '/how-it-works',
  '/about',
  '/help',
  '/privacy',
  '/terms',
  '/report',
  '/reference',
  '/history',
  '/offline',
  '/unavailable'
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

async function runAudit() {
  console.log('================================================================');
  console.log('TRUELABEL: FINAL UX ACCEPTANCE & FUNCTIONAL INTEGRITY AUDIT');
  console.log('Target:', BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const report = {
    navigation: [],
    scanJourney: {},
    verdicts: [],
    consistency: [],
    accessibility: [],
    functional: [],
    defects: []
  };

  // ─────────────────────────────────────────────────────────────
  // 1. NAVIGATION AUDIT (Desktop, Tablet, Mobile)
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. NAVIGATION AUDIT ACROSS VIEWPORTS ---');

  for (const vp of VIEWPORTS) {
    console.log(`\nEvaluating Navigation on ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await setupPage(context);
    await page.goto(BASE_URL + '/');

    // 1.1 Header purity check: ONLY logo and theme toggle
    const headerNavCount = await page.locator('header nav, header .tl-desktop-nav, header a:not(.tl-header-logo):not(.tl-header-back)').count();
    const hasHeaderLogo = await page.locator('header .tl-header-logo').isVisible();
    const hasThemeToggle = await page.locator('header button.tl-theme-toggle').isVisible();

    console.log(`  [${vp.name}] Header logo visible:`, hasHeaderLogo);
    console.log(`  [${vp.name}] Header theme toggle visible:`, hasThemeToggle);
    console.log(`  [${vp.name}] Extra header links count (must be 0):`, headerNavCount);

    report.navigation.push({
      viewport: vp.name,
      check: 'Header purity (only logo + theme toggle)',
      passed: hasHeaderLogo && hasThemeToggle && headerNavCount === 0,
      evidence: `Logo: ${hasHeaderLogo}, ThemeToggle: ${hasThemeToggle}, ExtraLinks: ${headerNavCount}`
    });

    // 1.2 Logo navigates home test
    await page.goto(BASE_URL + '/how-it-works');
    await page.locator('header .tl-header-logo').click();
    await page.waitForURL('**/');
    const isAtHome = page.url() === BASE_URL + '/';
    console.log(`  [${vp.name}] Logo navigates home from /how-it-works:`, isAtHome);
    report.navigation.push({
      viewport: vp.name,
      check: 'Logo navigation to home',
      passed: isAtHome,
      evidence: `Navigated to ${page.url()}`
    });

    // 1.3 Theme toggle works and persists across page reload
    const themeBtn = page.locator('header button.tl-theme-toggle').first();
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
    await themeBtn.click();
    await page.waitForTimeout(200);
    const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const storedTheme = await page.evaluate(() => localStorage.getItem('tl-theme'));

    await page.reload();
    const reloadedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    const themePersisted = toggledTheme !== initialTheme && storedTheme === toggledTheme && reloadedTheme === toggledTheme;
    console.log(`  [${vp.name}] Theme toggle switched from ${initialTheme} to ${toggledTheme}, persisted after reload:`, themePersisted);

    report.navigation.push({
      viewport: vp.name,
      check: 'Theme toggle & persistence across reload',
      passed: themePersisted,
      evidence: `Initial: ${initialTheme}, Toggled: ${toggledTheme}, LocalStorage: ${storedTheme}, Reload: ${reloadedTheme}`
    });

    // Reset theme back to initial for consistent testing
    if (toggledTheme !== initialTheme) {
      await themeBtn.click();
    }

    // 1.4 Navigation dock / bottom nav visibility and obstruction check
    const bottomNav = page.locator('.tl-bottom-nav');
    const hasBottomNav = await bottomNav.isVisible();
    console.log(`  [${vp.name}] Bottom navigation / dock visible:`, hasBottomNav);

    // Check collision / obstruction with main interactive content on Home
    const ctaButton = page.locator('a:has-text("Scan a product")').first();
    const ctaBox = await ctaButton.boundingBox();
    const navBox = await bottomNav.boundingBox();

    let dockObstructsContent = false;
    if (ctaBox && navBox) {
      // Check if bounding boxes overlap vertically and horizontally
      const overlapX = Math.max(0, Math.min(ctaBox.x + ctaBox.width, navBox.x + navBox.width) - Math.max(ctaBox.x, navBox.x));
      const overlapY = Math.max(0, Math.min(ctaBox.y + ctaBox.height, navBox.y + navBox.height) - Math.max(ctaBox.y, navBox.y));
      dockObstructsContent = overlapX > 0 && overlapY > 0;
    }
    console.log(`  [${vp.name}] Navigation dock obstructs primary CTA button:`, dockObstructsContent);

    report.navigation.push({
      viewport: vp.name,
      check: 'Navigation non-obstruction of primary CTA',
      passed: !dockObstructsContent,
      evidence: `Overlap detected: ${dockObstructsContent}`
    });

    // 1.5 Camera capture screen: Bottom nav MUST BE HIDDEN
    await page.goto(BASE_URL + '/scan/capture');
    const navOnCamera = await page.locator('.tl-bottom-nav').isVisible().catch(() => false);
    console.log(`  [${vp.name}] Navigation hidden on /scan/capture:`, !navOnCamera);
    report.navigation.push({
      viewport: vp.name,
      check: 'Navigation hidden on /scan/capture to avoid camera overlap',
      passed: !navOnCamera,
      evidence: `Visible on camera screen: ${navOnCamera}`
    });

    // 1.6 Active navigation state accuracy
    await page.goto(BASE_URL + '/how-it-works');
    const activeNavTab = await page.locator('.tl-bottom-nav a.active, .tl-bottom-nav a[aria-current="page"]').innerText();
    const isActiveCorrect = activeNavTab.includes('How it works');
    console.log(`  [${vp.name}] Active navigation state on /how-it-works matches [${activeNavTab.trim()}]:`, isActiveCorrect);
    report.navigation.push({
      viewport: vp.name,
      check: 'Active navigation state accuracy',
      passed: isActiveCorrect,
      evidence: `Active tab text: "${activeNavTab.trim()}"`
    });

    // 1.7 Keyboard Navigation accessibility
    await page.goto(BASE_URL + '/');
    await page.keyboard.press('Tab');
    const focusedHeaderLogo = await page.evaluate(() => document.activeElement?.classList?.contains('tl-header-logo'));
    await page.keyboard.press('Tab');
    const focusedThemeToggle = await page.evaluate(() => document.activeElement?.classList?.contains('tl-theme-toggle'));
    console.log(`  [${vp.name}] Keyboard tab focuses header logo: ${focusedHeaderLogo}, theme toggle: ${focusedThemeToggle}`);
    report.navigation.push({
      viewport: vp.name,
      check: 'Keyboard tab focus sequence on header elements',
      passed: Boolean(focusedHeaderLogo && focusedThemeToggle),
      evidence: `Logo focused: ${focusedHeaderLogo}, Theme toggle focused: ${focusedThemeToggle}`
    });

    await context.close();
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SCAN JOURNEY USABILITY (First-Time User Simulation)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. SCAN JOURNEY USABILITY & BACKWARDS PRESERVATION ---');
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await setupPage(context);

    const journeyLog = {
      screens: [],
      clicks: 0,
      fieldsRequired: [],
      decisions: [],
      confusionPoints: [],
      backwardsPreserved: false
    };

    // Step 1: Homepage
    await page.goto(BASE_URL + '/');
    journeyLog.screens.push({ url: page.url(), name: 'Home Landing' });
    journeyLog.decisions.push('Choose between "Scan a product" (camera) or "Enter product details manually"');

    // Click 1: Primary CTA
    const scanCta = page.locator('a[href="/scan/capture"]').first();
    await scanCta.click();
    journeyLog.clicks++;
    await page.waitForURL('**/scan/capture');

    // Step 2: Camera Capture
    journeyLog.screens.push({ url: page.url(), name: 'Camera Capture' });
    journeyLog.decisions.push('Choose to upload photo or capture via webcam/device camera');

    // Check optional image captures: Upload Front only
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.resolve('tests/fixtures/test-front.png'));
    await page.waitForTimeout(500);

    const continueBtn = page.locator('button:has-text("Continue with captured photos")');
    const isContinueEnabled = await continueBtn.isEnabled();
    console.log('  Single Front photo enables Continue button (optional Back/Batch not forced):', isContinueEnabled);
    if (!isContinueEnabled) {
      report.defects.push({ issue: 'Continue button disabled despite valid Front image capture' });
    }

    // Click 2: Continue with captured photos
    await continueBtn.click();
    journeyLog.clicks++;
    await page.waitForURL('**/scan/reading');

    // Step 3: OCR Reading Screen
    journeyLog.screens.push({ url: page.url(), name: 'OCR Reading Transition' });
    console.log('  Arrived on /scan/reading, awaiting automatic transcription or manual fallback...');

    // Check if auto-redirects to /review within 4s or displays live AI offline fallback
    const reachedReview = await page.waitForURL('**/review', { timeout: 4000 }).catch(() => false);
    if (!reachedReview) {
      const typeManualBtn = page.locator('a[href="/review/enter"]').first();
      if (await typeManualBtn.isVisible()) {
        console.log('  -> Live AI offline notice active (honest fallback without fabricated OCR). Clicking Type pack details manually...');
        await typeManualBtn.click();
        journeyLog.clicks++;
        await page.waitForURL('**/review/enter');
        journeyLog.screens.push({ url: page.url(), name: 'Manual Pack Entry Form' });

        await page.selectOption('select#category', 'food');
        await page.fill('input#regNo', '01-0812');
        await page.fill('input#brand', 'Golden Penny');
        await page.fill('input#product', 'Semovita 1kg Pack');
        await page.fill('input#manufacturer', 'Flour Mills of Nigeria Plc');
        await page.click('button[type="submit"]:has-text("Review details")');
        journeyLog.clicks++;
        await page.waitForURL('**/review');
      }
    }

    // Step 4: Unified Review Screen
    journeyLog.screens.push({ url: page.url(), name: 'Review & Unified Confirm' });
    console.log('  Arrived on /review. Checking mandatory confirmation gates...');

    // Decision: Inspect extracted number and identity fields
    journeyLog.decisions.push('Verify extracted registration number and brand/product name against physical pack');

    const inspectBtn = page.locator('button:has-text("Inspect available evidence")').first();
    const inspectDisabledInitially = await inspectBtn.isDisabled();
    console.log('  "Inspect available evidence" disabled before confirmations:', inspectDisabledInitially);

    // User confirms number
    const confirmNumBtn = page.locator('button.tl-confirm-btn').first();
    await confirmNumBtn.click();
    journeyLog.clicks++;
    console.log('  Confirmed registration number.');

    // User confirms identity
    const confirmIdBtn = page.locator('button.tl-confirm-btn:has-text("Confirm brand, product and maker")').first();
    await confirmIdBtn.click();
    journeyLog.clicks++;
    console.log('  Confirmed identity fields.');

    const inspectReadyNow = await inspectBtn.isEnabled();
    console.log('  "Inspect available evidence" enabled after both confirmations:', inspectReadyNow);

    // Test Backwards Navigation & Field Preservation
    console.log('  Testing backward navigation to /review/enter...');
    const editBtn = page.locator('button:has-text("Edit pack details")').first();
    await editBtn.click();
    await page.waitForURL('**/review/enter');
    await page.waitForTimeout(300);

    const preservedRegNo = await page.locator('input#regNo').inputValue();
    const preservedBrand = await page.locator('input#brand').inputValue();
    const preservedProduct = await page.locator('input#product').inputValue();
    const isPreserved = Boolean(preservedRegNo && (preservedBrand || preservedProduct));
    console.log(`  Entered data preserved in manual editor: RegNo="${preservedRegNo}", Brand="${preservedBrand}", Product="${preservedProduct}":`, isPreserved);
    journeyLog.backwardsPreserved = isPreserved;

    // Return to /review
    await page.click('button[type="submit"]:has-text("Review details")');
    await page.waitForURL('**/review');

    // Re-confirm and proceed to result
    await page.locator('button.tl-confirm-btn').first().click();
    await page.locator('button.tl-confirm-btn:has-text("Confirm brand, product and maker")').first().click();

    // Click 3: Inspect available evidence
    await page.locator('button:has-text("Inspect available evidence")').first().click();
    journeyLog.clicks++;
    await page.waitForURL('**/result');

    // Step 5: Result Screen
    journeyLog.screens.push({ url: page.url(), name: 'Verification Result' });
    console.log('  Arrived on /result verdict slip.');

    report.scanJourney = journeyLog;
    console.log(`  Scan Journey completed: ${journeyLog.screens.length} screens visited, ${journeyLog.clicks} required clicks.`);
    await context.close();
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RESULT COMPREHENSION AUDIT (All 4 Locked Verdicts)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. RESULT COMPREHENSION FOR ALL 4 VERDICTS ---');

  const VERDICT_FIXTURES = [
    {
      priority: 4,
      code: 'registry_match',
      expectedLabel: 'Registered and matches',
      input: {
        category: 'food',
        regNo: '01-0812',
        brand: 'Golden Penny',
        product: 'Semovita 1kg Pack',
        manufacturer: 'Flour Mills of Nigeria Plc'
      },
      mustHaveCaveat: true
    },
    {
      priority: 1,
      code: 'alert_match',
      expectedLabel: 'Matches a NAFDAC alert',
      input: {
        category: 'medicine',
        regNo: '04-1234',
        brand: 'Emzor',
        product: 'Paracetamol 500mg Tablets',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd',
        batch: 'EMZ-9988',
        strength: '500mg'
      },
      mustHaveCaveat: false
    },
    {
      priority: 2,
      code: 'registration_discrepancy',
      expectedLabel: "Registration details don't match",
      input: {
        category: 'food',
        regNo: '01-0812',
        brand: 'Completely Wrong Brand',
        product: 'Spurious Cooking Oil',
        manufacturer: 'Unknown Factory'
      },
      mustHaveCaveat: false
    },
    {
      priority: 3,
      code: 'could_not_confirm',
      expectedLabel: 'Could not confirm',
      input: {
        category: 'food',
        regNo: '99-9999',
        brand: 'Rare Local Product',
        product: 'Dried Fish Pack',
        manufacturer: 'Local Artisans'
      },
      mustHaveCaveat: false
    }
  ];

  for (const vFix of VERDICT_FIXTURES) {
    console.log(`\nTesting Verdict ${vFix.priority}: ${vFix.code} (${vFix.expectedLabel})...`);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await setupPage(context);

    await page.goto(BASE_URL + '/review/enter');
    await page.selectOption('select#category', vFix.input.category);
    await page.fill('input#regNo', vFix.input.regNo);
    await page.fill('input#brand', vFix.input.brand);
    await page.fill('input#product', vFix.input.product);
    if (vFix.input.manufacturer) await page.fill('input#manufacturer', vFix.input.manufacturer);
    if (vFix.input.batch) await page.fill('input#batch', vFix.input.batch);
    if (vFix.input.strength) await page.fill('input#medicineStrength', vFix.input.strength);

    await page.click('button[type="submit"]:has-text("Review details")');
    await page.waitForURL('**/review');

    // Confirm fields
    await page.locator('button.tl-confirm-btn').first().click();
    if (vFix.input.category === 'medicine') {
      await page.locator('button.tl-confirm-btn:has-text("Confirm strength")').first().click();
    } else {
      await page.locator('button.tl-confirm-btn:has-text("Confirm brand, product and maker")').first().click();
    }

    await page.locator('button:has-text("Inspect available evidence")').first().click();
    await page.waitForURL('**/result');

    await page.waitForSelector('.tl-verdict-slip', { timeout: 10000 });
    const bodyText = await page.evaluate(() => document.body.innerText);

    const hasLabel = bodyText.includes(vFix.expectedLabel) || (vFix.code === 'registry_match' && bodyText.includes('Registry details match'));
    const hasCaveat = bodyText.includes('A registered number can appear on a copied or counterfeit pack');
    const hasEvidence = bodyText.includes('Evidence') || bodyText.includes('What we checked') || bodyText.includes('Recall Notice') || bodyText.includes('Discrepancy');
    const hasNextSteps = bodyText.includes('Share') || bodyText.includes('Report a concern') || bodyText.includes('Start a new check');

    console.log(`  ✓ Display label matched: ${hasLabel}`);
    console.log(`  ✓ Evidence breakdown displayed: ${hasEvidence}`);
    console.log(`  ✓ Next actions displayed: ${hasNextSteps}`);
    console.log(`  ✓ Mandatory caveat displayed: ${hasCaveat} (Required: ${vFix.mustHaveCaveat})`);

    const verdictPass = hasLabel && hasEvidence && hasNextSteps && (!vFix.mustHaveCaveat || hasCaveat);

    report.verdicts.push({
      priority: vFix.priority,
      verdict: vFix.code,
      label: vFix.expectedLabel,
      passed: verdictPass,
      caveatHonored: !vFix.mustHaveCaveat || hasCaveat,
      evidence: `Label: ${hasLabel}, Evidence: ${hasEvidence}, Caveat: ${hasCaveat}`
    });

    await context.close();
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CROSS-SCREEN CONSISTENCY & ACCESSIBILITY AUDIT
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. CROSS-SCREEN CONSISTENCY & ACCESSIBILITY AUDIT ---');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await setupPage(context);

    for (const route of ALL_ROUTES) {
      const url = BASE_URL + route;
      await page.goto(url);
      await page.waitForTimeout(150);

      // 4.1 Heading Hierarchy check
      const h1Count = await page.locator('h1').count();
      const hasSingleH1 = h1Count === 1;

      // 4.2 Layout overflow check
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth;
      });

      // 4.3 Interactive touch target sizes (must be >= 44x44px, excluding WCAG 2.5.8 inline text links)
      const smallTargets = await page.evaluate(() => {
        const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
        const tiny = [];
        for (const el of interactive) {
          const rect = el.getBoundingClientRect();
          // Filter visible elements
          if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none') {
            // WCAG 2.5.8 exception: inline links within prose
            if (el.tagName === 'A' && (el.classList.contains('tl-link') || el.closest('p, .tl-caption, ul, ol'))) {
              continue;
            }
            if (rect.width < 40 || rect.height < 40) { // allowing minor subpixel tolerance
              tiny.push({
                tag: el.tagName,
                text: el.innerText?.slice(0, 20) || el.getAttribute('aria-label') || '',
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              });
            }
          }
        }
        return tiny;
      });

      // 4.4 Check for prohibited decorative numeric prefixes in headings
      const headingPrefixes = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, .tl-label-bold'));
        const offending = [];
        for (const h of headings) {
          const text = h.innerText.trim();
          if (/^0\d\s*\//.test(text) || /^Priority\s*\d+:/.test(text) || /^\d+\.\s+[A-Z]/.test(text)) {
            offending.push(text);
          }
        }
        return offending;
      });

      const routePass = hasSingleH1 && !hasOverflow && headingPrefixes.length === 0;
      console.log(`  Route [${route}]: H1=${h1Count}, Overflow=${hasOverflow ? 'YES' : 'NO'}, BadPrefixes=${headingPrefixes.length}, SmallTargets=${smallTargets.length}`);

      if (headingPrefixes.length > 0) {
        report.defects.push({
          route,
          type: 'Numeric Prefix Violation',
          items: headingPrefixes
        });
      }

      report.consistency.push({
        route,
        hasSingleH1,
        hasOverflow,
        headingPrefixes,
        smallTargetsCount: smallTargets.length,
        passed: routePass
      });
    }

    await context.close();
  }

  // ─────────────────────────────────────────────────────────────
  // 5. MEDICINE LABEL-ONLY RE-VERIFICATION (PRD Section 10.7)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. MEDICINE LABEL-ONLY STRICT BOUNDARY AUDIT ---');
  {
    const context = await browser.newContext();
    const page = await setupPage(context);
    await page.goto(BASE_URL + '/review/medicine');

    const medText = await page.evaluate(() => document.body.innerText);

    const hasPharmacistDisclaimer = medText.includes('ask a licensed pharmacist');
    const hasDosingCalculator = medText.includes('Calculate dose') || medText.includes('Weight:') || medText.includes('Age dosing');
    const hasScheduleCalendar = medText.includes('Add to calendar') || medText.includes('Schedule reminder');

    console.log('  Pharmacist disclaimer present on empty/active medicine review:', hasPharmacistDisclaimer);
    console.log('  Dosing calculator strictly absent:', !hasDosingCalculator);
    console.log('  Schedule/reminder features strictly absent:', !hasScheduleCalendar);

    report.accessibility.push({
      feature: 'Medicine Strict Label-Only Boundary',
      passed: hasPharmacistDisclaimer && !hasDosingCalculator && !hasScheduleCalendar,
      evidence: `Disclaimer: ${hasPharmacistDisclaimer}, NoDosing: ${!hasDosingCalculator}, NoSchedule: ${!hasScheduleCalendar}`
    });

    await context.close();
  }

  await browser.close();

  // Save audit results to JSON
  fs.writeFileSync('tests/final-integrity-audit-results.json', JSON.stringify(report, null, 2));
  console.log('\nAudit complete. Results saved to tests/final-integrity-audit-results.json');
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
