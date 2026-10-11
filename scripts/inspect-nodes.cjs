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

  await page.goto('http://localhost:3030/#/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Find all buttons on the learning path
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map((b, i) => ({
      index: i,
      text: b.innerText,
      ariaLabel: b.getAttribute('aria-label'),
      title: b.getAttribute('title'),
      className: b.className
    }));
  });
  console.log('All buttons on /app:');
  console.log(buttons);

  // Find the button for Skill 1 or Skill 2 or Skill 3
  const skillNodes = await page.$$('button[aria-label*="What Is Programming"], button[aria-label*="Data Types"], button[aria-label*="Arithmetic"]');
  console.log('Skill nodes count:', skillNodes.length);

  for (let i = 0; i < skillNodes.length; i++) {
    const label = await skillNodes[i].getAttribute('aria-label');
    console.log(`Clicking skillNode ${i} (${label})...`);
    await skillNodes[i].click();
    await page.waitForTimeout(500);
    const modalText = await page.evaluate(() => {
      const modal = document.querySelector('.card-plate.animate-pop-in, [role="dialog"]');
      return modal ? modal.innerText : 'NO MODAL FOUND';
    });
    console.log(`Modal text for node ${i}:`, modalText.slice(0, 200));

    // Close preview modal by clicking Close button if open
    const closeBtn = await page.$('button:has-text("Close")');
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  await browser.close();
})();
