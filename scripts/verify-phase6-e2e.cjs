const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';

async function runAudit() {
  console.log('--- CODOLINGO PHASE 6 E2E AUDIT ---');
  const browser = await chromium.launch({ headless: true });
  
  const consoleErrors = [];
  const consoleWarnings = [];

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warn') {
      consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // 1. Visit Landing Page
  console.log('1. Checking Landing Page...');
  await page.goto(`${BASE_URL}/#/landing`, { waitUntil: 'networkidle' });
  const heroHeading = await page.textContent('h1');
  console.log(`   Heading: "${heroHeading.trim()}"`);
  if (!heroHeading.includes('Learn Python')) {
    throw new Error('Hero heading mismatch');
  }

  // 2. Visit Learning Path
  console.log('2. Checking Learning Path (Path route)...');
  await page.goto(`${BASE_URL}/#/app`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.codon-bottom-nav, .brand-logo-lockup');
  console.log('   Brand logo and layout verified.');

  // 3. Visit Lesson 1.1
  console.log('3. Checking Lesson Runner (Lesson 1.1)...');
  await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const lessonTitle = await page.title();
  console.log(`   Page title: "${lessonTitle}"`);

  // 4. Visit Dashboard
  console.log('4. Checking Dashboard...');
  await page.goto(`${BASE_URL}/#/app/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card-plate');

  // 5. Visit Practice Arena
  console.log('5. Checking Practice Arena...');
  await page.goto(`${BASE_URL}/#/app/practice`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card-plate, h1');

  // 6. Visit Mistake Review
  console.log('6. Checking Mistake Review...');
  await page.goto(`${BASE_URL}/#/app/review`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card-plate, h1, h2');

  // 7. Visit Profile & Settings
  console.log('7. Checking Profile & Settings...');
  await page.goto(`${BASE_URL}/#/app/profile`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card-plate, h1');

  // 8. Visit Static Pages: Privacy, Terms, Changelog
  console.log('8. Checking Static Legal & Info Pages...');
  await page.goto(`${BASE_URL}/#/privacy`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const privacyHeading = await page.textContent('h1');
  console.log(`   Privacy heading: "${privacyHeading.trim()}"`);

  await page.goto(`${BASE_URL}/#/terms`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const termsHeading = await page.textContent('h1');
  console.log(`   Terms heading: "${termsHeading.trim()}"`);

  await page.goto(`${BASE_URL}/#/changelog`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const changelogHeading = await page.textContent('h1');
  console.log(`   Changelog heading: "${changelogHeading.trim()}"`);

  // 9. Mobile Viewport Check (375px)
  console.log('9. Checking Mobile Navigation & Bottom Nav...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/#/app`, { waitUntil: 'networkidle' });
  const bottomNavVisible = await page.isVisible('.codon-bottom-nav');
  console.log(`   Bottom navigation bar visible on mobile: ${bottomNavVisible}`);

  await browser.close();

  console.log('\n--- CONSOLE INTEGRITY ---');
  console.log(`Total Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors encountered:', consoleErrors);
  }
  console.log(`Total Console Warnings: ${consoleWarnings.length}`);

  if (consoleErrors.length === 0) {
    console.log('✅ ZERO CONSOLE ERRORS DETECTED.');
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
