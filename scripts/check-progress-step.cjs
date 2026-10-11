const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3030/#/app');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('codolingo_theme', 'light');
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
  });

  // Replicate what reproduce-matrix did:
  await page.goto('http://localhost:3030/#/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('On /app page. Finding node button...');
  const nodeBtn = await page.$('button[aria-label*="What Is Programming"], button[aria-label*="Data Types"], button:has-text("CONTINUE"), button:has-text("START")');
  console.log('nodeBtn found:', Boolean(nodeBtn));
  if (nodeBtn) {
    console.log('Clicking nodeBtn...');
    await nodeBtn.click();
    await page.waitForTimeout(1000);
    const startBtn = await page.$('button:has-text("Start Lesson"), button:has-text("Continue"), button:has-text("Practice again")');
    console.log('startBtn found in modal:', Boolean(startBtn));
    if (startBtn) {
      console.log('Clicking startBtn...');
      await startBtn.click();
      await page.waitForTimeout(2000);
      console.log('URL after clicking start in modal:', page.url());
      console.log('Text on screen:', (await page.evaluate(() => document.body.innerText)).slice(0, 300));
    }
  }

  // Now test navigating directly:
  console.log('\nNavigating to /app/lesson/1.1...');
  await page.goto('http://localhost:3030/#/app/lesson/1.1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Direct 1.1 URL:', page.url());
  console.log('Direct 1.1 Text:', (await page.evaluate(() => document.body.innerText)).slice(0, 300));
  console.log('h1:', await page.$eval('h1', el => el.innerText).catch(e => e.message));

  await browser.close();
})();
