const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase5');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to Landing Page...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/#/landing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Landing Page Desktop (1440px)
  await page.screenshot({ path: path.join(OUT_DIR, 'landing_page_1440.png'), fullPage: true });
  console.log('Saved landing_page_1440.png');

  // 2. Interactive Code Runner Output
  const runBtn = page.locator('button:has-text("Run Code")');
  if (await runBtn.isVisible()) {
    await runBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'landing_code_runner_1440.png') });
    console.log('Saved landing_code_runner_1440.png');
  }

  // 3. Landing Dark Mode
  const themeToggle = page.locator('button[aria-label="Toggle Theme"]').first();
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, 'landing_dark_1440.png') });
    console.log('Saved landing_dark_1440.png');
    // Toggle back to light
    await themeToggle.click();
    await page.waitForTimeout(300);
  }

  // 4. Landing Tablet (768px)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/#/landing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'landing_page_768.png'), fullPage: true });
  console.log('Saved landing_page_768.png');

  // 5. Landing Mobile (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/#/landing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'landing_page_375.png'), fullPage: true });
  console.log('Saved landing_page_375.png');

  // 6. 404 Not Found Screen (1440px, 768px, 375px)
  console.log('Navigating to Unmapped Route (404)...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/#/unmapped/secret-chamber`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'not_found_1440.png') });
  console.log('Saved not_found_1440.png');

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/#/unmapped/secret-chamber`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'not_found_768.png') });
  console.log('Saved not_found_768.png');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/#/unmapped/secret-chamber`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'not_found_375.png') });
  console.log('Saved not_found_375.png');

  // 7. Full Learning Path in Light & Dark (1440px)
  console.log('Navigating to Learning Path...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/#/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'path_light_1440.png') });
  console.log('Saved path_light_1440.png');

  // Switch to dark mode via HUD toggle
  const hudThemeToggle = page.locator('button[aria-label="Switch to dark mode"]');
  if (await hudThemeToggle.isVisible()) {
    await hudThemeToggle.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'path_dark_1440.png') });
    console.log('Saved path_dark_1440.png');
  }

  // 8. Dashboard (1440px, 768px, 375px)
  console.log('Navigating to Dashboard...');
  await page.goto(`${BASE_URL}/#/app/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard_1440.png') });
  console.log('Saved dashboard_1440.png');

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/#/app/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard_768.png') });
  console.log('Saved dashboard_768.png');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/#/app/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard_375.png') });
  console.log('Saved dashboard_375.png');

  await browser.close();
  console.log('Phase 5 screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
