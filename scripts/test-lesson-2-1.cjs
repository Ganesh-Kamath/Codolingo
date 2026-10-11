const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3030/#/app');

  // Complete all 10 lessons of Unit 1
  await page.evaluate(() => {
    localStorage.clear();
    const progress = {
      version: 3,
      userId: 'test_learner',
      xp: 1200,
      streak: 5,
      bestStreak: 5,
      activityHistory: [{ date: new Date().toISOString().split('T')[0], xp: 120, lessonsCount: 5 }],
      currentSkillId: 'py_skill_2_1',
      completedSkillIds: [
        'py_skill_1_1', 'py_skill_1_2', 'py_skill_1_3', 'py_skill_1_4', 'py_skill_1_5',
        'py_skill_1_6', 'py_skill_1_7', 'py_skill_1_8', 'py_skill_1_9', 'py_skill_1_10'
      ],
      completedLessonIds: [
        '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10'
      ],
      skillMastery: {
        py_skill_1_1: 5, py_skill_1_2: 5, py_skill_1_3: 5, py_skill_1_4: 5, py_skill_1_5: 5,
        py_skill_1_6: 5, py_skill_1_7: 5, py_skill_1_8: 5, py_skill_1_9: 5, py_skill_1_10: 5
      },
      mistakes: [],
      hearts: 5,
      gems: 300
    };
    localStorage.setItem('codolingo_progress_v3', JSON.stringify(progress));
  });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  console.log('Navigating to /app/lesson/2.1 with Unit 1 completed...');
  const start = Date.now();
  await page.goto('http://localhost:3030/#/app/lesson/2.1', { waitUntil: 'networkidle' });
  const loadDuration = Date.now() - start;
  console.log(`Page loaded in ${loadDuration}ms`);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text:\n', bodyText.slice(0, 400));
  console.log('Console logs:', consoleLogs);

  await page.screenshot({ path: 'test-results/repro/screenshots/lesson_2.1_unlocked.png' });
  console.log('Saved lesson_2.1_unlocked.png');

  await browser.close();
})();
