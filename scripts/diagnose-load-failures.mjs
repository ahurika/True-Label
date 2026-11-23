import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const ROUTES = [
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

async function diagnose() {
  console.log('Testing all routes and asset loading on', BASE_URL);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const failures = [];
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Console Error] [${page.url()}]:`, msg.text());
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Page Error] [${page.url()}]:`, err.message);
    failures.push({ url: page.url(), error: err.message, stack: err.stack });
  });

  page.on('requestfailed', (req) => {
    // Ignore harmless aborted requests if navigating away
    if (req.failure()?.errorText !== 'net::ERR_ABORTED') {
      console.warn(`[Request Failed] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
      failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
    }
  });

  for (const route of ROUTES) {
    const fullUrl = BASE_URL + route;
    try {
      const res = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
      const status = res?.status();
      const title = await page.title();
      const contentLen = (await page.evaluate(() => document.body.innerText)).length;
      console.log(`✓ [${status}] ${route} | Title: "${title}" | Body: ${contentLen} chars`);

      if (status !== 200) {
        failures.push({ route, status, error: `HTTP ${status}` });
      }
    } catch (err) {
      console.error(`✗ Route failed to load: ${route} - ${err.message}`);
      failures.push({ route, error: err.message });
    }
  }

  await browser.close();

  console.log('\n--- DIAGNOSTIC SUMMARY ---');
  console.log('Total Routes Tested:', ROUTES.length);
  console.log('Page Load Failures:', failures.length);
  console.log('Console Errors:', consoleErrors.length);
  console.log('Failed Requests:', failedRequests.length);

  if (failures.length > 0 || consoleErrors.length > 0 || failedRequests.length > 0) {
    console.log('\nDETAILS OF FAILURES:');
    console.log(JSON.stringify({ failures, consoleErrors, failedRequests }, null, 2));
    process.exit(1);
  } else {
    console.log('\nALL ROUTES, CHUNKS, AND ASSETS LOADED WITH 100% SUCCESS!');
  }
}

diagnose().catch((err) => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
