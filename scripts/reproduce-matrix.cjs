const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Extract all lesson IDs from pythonCourse.ts + foundations
const pathCourse = fs.readFileSync('src/curriculum/python/pythonCourse.ts', 'utf8');
const regex = /"lessons":\s*\[\s*\{\s*"id":\s*"([^"]+)"/g;
const allIds = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10'];
let m;
while ((m = regex.exec(pathCourse)) !== null) {
  const id = m[1];
  if (!id.startsWith('1.') && !allIds.includes(id)) {
    allIds.push(id);
  }
}

console.log(`Loaded ${allIds.length} lesson IDs for testing.`);

const results = [];
fs.mkdirSync('test-results/repro/screenshots', { recursive: true });

async function runTestMatrix() {
  const browser = await chromium.launch({ headless: true });

  const configurations = [
    { name: 'light-1280-fresh', theme: 'light', width: 1280, height: 800, storage: 'fresh' },
    { name: 'dark-1280-fresh', theme: 'dark', width: 1280, height: 800, storage: 'fresh' },
    { name: 'light-390-fresh', theme: 'light', width: 390, height: 844, storage: 'fresh' },
    { name: 'dark-390-fresh', theme: 'dark', width: 390, height: 844, storage: 'fresh' },
    { name: 'light-1280-progress', theme: 'light', width: 1280, height: 800, storage: 'progress' },
    { name: 'dark-390-progress', theme: 'dark', width: 390, height: 844, storage: 'progress' }
  ];

  for (const config of configurations) {
    console.log(`\n=== Running Config: ${config.name} (${config.theme}, ${config.width}px, ${config.storage}) ===`);

    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height }
    });

    const page = await context.newPage();

    // Prepare localStorage
    await page.goto('http://localhost:3030/#/app');
    await page.evaluate(({ theme, storage }) => {
      localStorage.clear();
      localStorage.setItem('codolingo_theme', theme);
      if (storage === 'progress') {
        const progress = {
          version: 3,
          userId: 'test_learner',
          xp: 450,
          streak: 4,
          bestStreak: 4,
          activityHistory: [{ date: new Date().toISOString().split('T')[0], xp: 50, lessonsCount: 2 }],
          currentSkillId: 'py_skill_1_3',
          completedSkillIds: ['py_skill_1_1', 'py_skill_1_2'],
          completedLessonIds: ['1.1', '1.2'],
          skillMastery: { py_skill_1_1: 4, py_skill_1_2: 3 },
          mistakes: [],
          hearts: 5,
          gems: 200
        };
        localStorage.setItem('codolingo_progress_v3', JSON.stringify(progress));
      }
    }, { theme: config.theme, storage: config.storage });

    // 1. Test clicking from Learning Path first
    console.log('Testing click from Learning Path...');
    const lpConsole = [];
    const lpNetwork = [];
    page.on('console', msg => lpConsole.push(`[${msg.type()}] ${msg.text()}`));
    page.on('requestfailed', req => lpNetwork.push(`${req.url()} (${req.failure()?.errorText})`));

    await page.goto('http://localhost:3030/#/app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Let's test clicking the node tile
    // Find first active/unlocked node button
    const nodeBtn = await page.$('button[aria-label*="What Is Programming"], button[aria-label*="Data Types"], button:has-text("CONTINUE"), button:has-text("START")');
    if (nodeBtn) {
      await nodeBtn.click();
      await page.waitForTimeout(500);
      const screenshotPath = `test-results/repro/screenshots/lp_preview_${config.name}.png`;
      await page.screenshot({ path: screenshotPath });

      // In the preview modal, check if modal backdrop is visible
      const modal = await page.$('[role="dialog"], div[style*="backdrop-filter"], div[style*="backdropFilter"]');
      console.log('Modal visible on node click:', Boolean(modal));

      // Click Start / Continue in preview modal
      const startBtn = await page.$('button:has-text("Start Lesson"), button:has-text("Continue"), button:has-text("Practice again")');
      if (startBtn) {
        console.log('Found Start button in preview modal, clicking it...');
        await startBtn.click();
        await page.waitForTimeout(1500);
        const afterClickScreenshot = `test-results/repro/screenshots/lp_after_start_${config.name}.png`;
        await page.screenshot({ path: afterClickScreenshot });
        console.log('URL after start:', page.url());
      }
    }

    // Now test every lesson in pathCurriculum (all Unit 1 lessons 1.1-1.10, plus representative sample from units 2-43)
    // To be thorough, test ALL 10 Unit 1 playable lessons + first lessons of other units (2.1, 3.1, 4.1, 5.1, 10.1, 20.1, etc.)
    const lessonsToTest = [
      '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10',
      '2.1', '3.1', '4.1', '5.1', '10.1', '43.1'
    ];

    for (const lid of lessonsToTest) {
      const consoleMsgs = [];
      const netErrors = [];
      const onConsole = msg => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
      const onReqFail = req => netErrors.push(`${req.url()} (${req.failure()?.errorText})`);

      page.on('console', onConsole);
      page.on('requestfailed', onReqFail);

      const targetUrl = `http://localhost:3030/#/app/lesson/${lid}`;
      await page.goto(targetUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const screenshotName = `lesson_${lid}_${config.name}.png`;
      const screenshotPath = path.join('test-results/repro/screenshots', screenshotName);
      await page.screenshot({ path: screenshotPath });

      // Analyze page state
      const state = await page.evaluate(() => {
        const text = document.body.innerText || '';
        const html = document.body.innerHTML || '';
        const isLocked = text.includes('Lesson Locked') || text.includes('You have not unlocked this lesson yet');
        const isUncharted = text.includes('Challenge Uncharted') || text.includes('We could not load curriculum items');
        const isForging = text.includes('Forging Micro-Lesson...');
        const hasQuestion = Boolean(document.querySelector('h1') && (document.querySelector('pre') || document.querySelector('button.hover-elevate') || document.querySelector('.monaco-editor')));
        const dialogs = Array.from(document.querySelectorAll('[role="dialog"]')).filter(d => d.offsetParent !== null || window.getComputedStyle(d).display !== 'none');
        const hasBlurredOverlay = Array.from(document.querySelectorAll('*')).some(el => {
          const s = window.getComputedStyle(el);
          return (s.backdropFilter.includes('blur') || s.filter.includes('blur')) && s.display !== 'none' && s.visibility !== 'hidden';
        });

        // Check if colors are washed out (e.g. dark text on dark bg or white text on white bg)
        const h1 = document.querySelector('h1');
        let h1Color = '';
        let h1Bg = '';
        if (h1) {
          h1Color = window.getComputedStyle(h1).color;
          h1Bg = window.getComputedStyle(document.body).backgroundColor;
        }

        return {
          textSnippet: text.slice(0, 150).replace(/\n/g, ' '),
          isLocked,
          isUncharted,
          isForging,
          hasQuestion,
          dialogCount: dialogs.length,
          hasBlurredOverlay,
          h1Color,
          h1Bg,
          htmlLength: html.length
        };
      });

      let outcome = 'OK';
      let errorDesc = '';

      if (state.isLocked) {
        outcome = 'LOCKED';
        errorDesc = 'Prerequisite not met (progressionService.isLessonAvailable)';
      } else if (state.isUncharted) {
        outcome = 'Challenge Uncharted';
        errorDesc = 'courseService.getLessonBlocks returned []';
      } else if (state.isForging) {
        outcome = 'loading forever';
        errorDesc = 'Stuck on Forging Micro-Lesson spinner';
      } else if (state.hasBlurredOverlay && !state.hasQuestion) {
        outcome = 'translucent overlay';
        errorDesc = 'Modal or blur overlay blocking screen without question';
      } else if (!state.hasQuestion) {
        outcome = 'blank';
        errorDesc = 'No question rendered';
      } else {
        outcome = 'OK';
      }

      const errLogs = consoleMsgs.filter(m => m.includes('[error]'));
      if (errLogs.length > 0 && outcome === 'OK') {
        errorDesc = errLogs.join('; ');
      }

      results.push({
        lessonId: lid,
        config: config.name,
        theme: config.theme,
        viewport: `${config.width}x${config.height}`,
        storage: config.storage,
        result: outcome,
        error: errorDesc || 'None',
        hasBlurredOverlay: state.hasBlurredOverlay,
        dialogCount: state.dialogCount,
        h1Color: state.h1Color,
        h1Bg: state.h1Bg,
        screenshot: screenshotName
      });

      page.off('console', onConsole);
      page.off('requestfailed', onReqFail);
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync('test-results/repro/results.json', JSON.stringify(results, null, 2));
  console.log('\nFinished test matrix! Results saved to test-results/repro/results.json');
}

runTestMatrix().catch(console.error);
