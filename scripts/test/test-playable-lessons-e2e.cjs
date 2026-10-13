const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = 3030;
const BASE_URL = `http://localhost:${PORT}`;

const PLAYABLE_LESSONS = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7'
];

const TEST_CONFIGS = [
  { theme: 'light', viewport: { width: 1280, height: 800 }, name: 'Desktop Light' },
  { theme: 'dark', viewport: { width: 1280, height: 800 }, name: 'Desktop Dark' },
  { theme: 'light', viewport: { width: 390, height: 844 }, name: 'Mobile Light' },
  { theme: 'dark', viewport: { width: 390, height: 844 }, name: 'Mobile Dark' },
];

async function runPlaywrightSuite() {
  console.log('[PLAYWRIGHT E2E] Running lesson runner regression suite...');
  const browser = await chromium.launch();
  let totalTests = 0;
  let failures = 0;

  const outDir = path.join(__dirname, '../../test-results/e2e');
  fs.mkdirSync(outDir, { recursive: true });

  for (const config of TEST_CONFIGS) {
    console.log(`\n--- Running Configuration: ${config.name} (${config.viewport.width}x${config.viewport.height}) ---`);

    for (const lessonId of PLAYABLE_LESSONS) {
      totalTests++;
      const context = await browser.newContext({
        viewport: config.viewport,
        colorScheme: config.theme
      });
      const page = await context.newPage();

      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          // Ignore harmless favicon or worker CDN logs if any
          const text = msg.text();
          if (!text.includes('favicon') && !text.includes('Failed to load resource: net::ERR_FILE_NOT_FOUND')) {
            consoleErrors.push(text);
          }
        }
      });

      // Prepare userProgress with unlocked status
      await page.addInitScript(({ themeVal }) => {
        localStorage.setItem('codolingo_theme', themeVal);
        const progress = {
          version: 3,
          currentLessonId: '1.1',
          completedLessonIds: [
            '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10',
            '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7'
          ],
          currentSkillId: 'skill-01',
          completedSkillIds: ['skill-01'],
          xp: 250,
          streak: 3,
          energy: 5,
          skillMastery: { 'skill-01': 5 },
          mistakes: []
        };
        localStorage.setItem('codolingo_progress_v3', JSON.stringify(progress));
      }, { themeVal: config.theme });

      try {
        await page.goto(`${BASE_URL}/#/app/lesson/${lessonId}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);

        // 1. Assert visible lesson header
        const header = await page.locator('header').first();
        const headerVisible = await header.isVisible().catch(() => false);
        if (!headerVisible) {
          throw new Error('Lesson header is not visible');
        }

        // 2. Assert visible first block with non-empty text
        const titleElement = await page.locator('h1').first();
        const titleText = (await titleElement.textContent().catch(() => '')).trim();
        if (!titleText) {
          throw new Error('First block title is empty or missing');
        }

        // 3. Assert no element with modal role is unexpectedly mounted / blocking
        const modalDialogs = await page.locator('[role="dialog"]').all();
        for (const dialog of modalDialogs) {
          const isVisible = await dialog.isVisible().catch(() => false);
          if (isVisible) {
            throw new Error('Modal dialog unexpectedly blocking lesson content');
          }
        }

        // 4. Assert Check/Continue control present in drawer
        const continueBtn = await page.locator('button:has-text("CONTINUE"), button:has-text("CHECK"), button:has-text("RUN CODE")').first();
        const btnVisible = await continueBtn.isVisible().catch(() => false);
        if (!btnVisible) {
          throw new Error('Check / Continue action button missing');
        }

        // 5. Assert no blocking console errors
        if (consoleErrors.length > 0) {
          throw new Error(`Console errors detected: ${consoleErrors.join(' | ')}`);
        }

        process.stdout.write(`  ✓ Lesson ${lessonId} [${config.name}]: PASS (Title: "${titleText.slice(0, 25)}...")\n`);
      } catch (err) {
        failures++;
        const shotPath = path.join(outDir, `fail_${lessonId}_${config.theme}_${config.viewport.width}.png`);
        await page.screenshot({ path: shotPath }).catch(() => {});
        process.stdout.write(`  ✗ Lesson ${lessonId} [${config.name}]: FAIL (${err.message})\n`);
      } finally {
        await context.close();
      }
    }
  }

  // Also test clicking through from the learning path node preview modal
  console.log('\n--- Testing Click-Through From Learning Path Preview ---');
  {
    totalTests++;
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify({
        version: 3,
        currentLessonId: '1.1',
        completedLessonIds: [],
        currentSkillId: 'skill-01',
        completedSkillIds: [],
        xp: 0,
        streak: 1,
        energy: 5,
        skillMastery: { 'skill-01': 0 },
        mistakes: []
      }));
    });

    try {
      await page.goto(`${BASE_URL}/#/app`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Click on skill node 1.1 (Your First Python Program)
      const skillNode = await page.locator('button[aria-label*="Your First Python Program"], button[title*="Your First Python Program"], button:has-text("START")').first();
      await skillNode.click();
      await page.waitForTimeout(500);

      // Click on the interactive lesson button inside the portal popover dialog
      const lessonButton = await page.locator('[role="dialog"] button:has-text("Continue"), [role="dialog"] button:has-text("Start Lesson"), [role="dialog"] button:has-text("Practice"), [role="dialog"] button[title*="Start lesson"]').first();
      await lessonButton.click();
      await page.waitForTimeout(1000);

      // Verify URL and lesson content loaded
      const currentUrl = page.url();
      if (!currentUrl.includes('/app/lesson/1.1')) {
        throw new Error(`Expected URL to include /app/lesson/1.1, got: ${currentUrl}`);
      }

      const lessonTitle = await page.locator('h1').first();
      const titleText = await lessonTitle.textContent();
      if (!titleText || titleText.trim().length === 0) {
        throw new Error(`Unexpected empty lesson prompt: ${titleText}`);
      }

      console.log('  ✓ Path click-through to lesson 1.1: PASS');
    } catch (err) {
      failures++;
      console.error('  ✗ Path click-through to lesson 1.1: FAIL -', err.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`E2E Playwright Suite: ${totalTests - failures}/${totalTests} Passed (${failures} Failed)`);
  console.log(`========================================\n`);

  if (failures > 0) {
    process.exit(1);
  }
}

runPlaywrightSuite().catch(err => {
  console.error('Fatal Playwright runner error:', err);
  process.exit(1);
});
