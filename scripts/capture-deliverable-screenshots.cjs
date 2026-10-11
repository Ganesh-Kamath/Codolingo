const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = 3030;
const BASE_URL = `http://localhost:${PORT}`;

const outDir = path.join(__dirname, '../test-results/deliverable-screenshots');
fs.mkdirSync(outDir, { recursive: true });

async function captureDeliverables() {
  console.log('[SCREENSHOTS] Launching Chromium to capture deliverable screenshots...');
  const browser = await chromium.launch();

  const userProgress = {
    version: 3,
    currentLessonId: '1.1',
    completedLessonIds: [],
    currentSkillId: 'py_skill_1_1',
    completedSkillIds: [],
    xp: 250,
    streak: 3,
    energy: 5,
    skillMastery: { 'py_skill_1_1': 2 },
    mistakes: []
  };

  // 1. Lesson open in light at 1280
  console.log('1. Capturing lesson open in light at 1280...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      localStorage.setItem('codolingo_theme', 'light');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_open_light_1280.png') });
    await ctx.close();
  }

  // 2. Lesson open in dark at 1280
  console.log('2. Capturing lesson open in dark at 1280...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_open_dark_1280.png') });
    await ctx.close();
  }

  // 3. Lesson open in light at 390
  console.log('3. Capturing lesson open in light at 390...');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      localStorage.setItem('codolingo_theme', 'light');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_open_light_390.png') });
    await ctx.close();
  }

  // 4. Lesson open in dark at 390
  console.log('4. Capturing lesson open in dark at 390...');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_open_dark_390.png') });
    await ctx.close();
  }

  // 5. Loading state
  console.log('5. Capturing loading state...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.route('**/*selectedLessons*.json', async route => {
      await new Promise(r => setTimeout(r, 4000));
      await route.continue();
    });
    await page.addInitScript(({ prog }) => {
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/2.1`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, 'lesson_state_loading.png') });
    await ctx.close();
  }

  // 6. Not-found state
  console.log('6. Capturing not-found state...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/nonexistent-99`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_state_not_found.png') });
    await ctx.close();
  }

  // 7. Load error state
  console.log('7. Capturing load-error state...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      window.__SIMULATE_LOAD_ERROR = true;
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_state_load_error.png') });
    await ctx.close();
  }

  // 8. Unsupported type state
  console.log('8. Capturing unsupported-type state...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ prog }) => {
      window.__SIMULATE_UNSUPPORTED_TYPE = true;
      localStorage.setItem('codolingo_theme', 'dark');
      localStorage.setItem('codolingo_progress_v3', JSON.stringify(prog));
    }, { prog: userProgress });
    await page.goto(`${BASE_URL}/#/app/lesson/1.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'lesson_state_unsupported_type.png') });
    await ctx.close();
  }

  await browser.close();
  console.log('[SCREENSHOTS] All 8 deliverable screenshots captured successfully in test-results/deliverable-screenshots!');
}

captureDeliverables().catch(err => {
  console.error('Failed to capture deliverable screenshots:', err);
  process.exit(1);
});
