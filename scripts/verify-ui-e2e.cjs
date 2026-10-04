const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- CODOLINGO E2E VISUAL & FUNCTIONAL AUDIT ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const screenshotsDir = path.resolve(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 1. Home / Pathway
    console.log('Navigating to http://localhost:3030/app ...');
    await page.goto('http://localhost:3030/app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '1_pathway_desktop.png'), fullPage: false });
    console.log('Captured 1_pathway_desktop.png');

    // Check key elements
    const brandText = await page.textContent('body');
    if (!brandText.includes('Codolingo')) {
      throw new Error('Codolingo branding not found on page');
    }
    console.log('✅ Branding found on Pathway');

    // Check nodes
    const nodes = await page.$$('button');
    console.log(`✅ Found ${nodes.length} interactive elements/buttons`);

    // 2. Mobile Viewport test on Pathway
    console.log('Testing mobile viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '2_pathway_mobile.png'), fullPage: false });
    console.log('Captured 2_pathway_mobile.png');

    // Check overflow on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);
    if (scrollWidth > clientWidth + 2) {
      console.warn(`⚠️ Warning: Slight horizontal overflow detected: ${scrollWidth} > ${clientWidth}`);
    } else {
      console.log('✅ Mobile layout has no horizontal overflow');
    }

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // 3. Practice View
    console.log('Navigating to /app/practice ...');
    await page.goto('http://localhost:3030/app/practice', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '3_practice_desktop.png'), fullPage: false });
    console.log('Captured 3_practice_desktop.png');

    // 4. Project Workspace
    console.log('Navigating to /app/projects/beginner-1 ...');
    await page.goto('http://localhost:3030/app/projects/beginner-1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '4_project_workspace.png'), fullPage: false });
    console.log('Captured 4_project_workspace.png');

    // 5. Review View
    console.log('Navigating to /app/review ...');
    await page.goto('http://localhost:3030/app/review', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '5_review_desktop.png'), fullPage: false });
    console.log('Captured 5_review_desktop.png');

    // 6. Profile View
    console.log('Navigating to /app/profile ...');
    await page.goto('http://localhost:3030/app/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '6_profile_desktop.png'), fullPage: false });
    console.log('Captured 6_profile_desktop.png');

    // 7. Lesson View
    console.log('Navigating to /app/lesson/1.1 ...');
    await page.goto('http://localhost:3030/app/lesson/1.1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '7_lesson_desktop.png'), fullPage: false });
    console.log('Captured 7_lesson_desktop.png');

    if (consoleErrors.length > 0) {
      console.log('Console Errors caught during session:');
      consoleErrors.forEach(err => console.log('  -', err));
    } else {
      console.log('✅ ZERO console errors encountered across all main routes!');
    }

    console.log('E2E visual verification completed successfully.');
  } catch (err) {
    console.error('Error during E2E verification:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
