const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  // Set localStorage via addInitScript BEFORE loading page!
  await context.addInitScript(() => {
    const progress = {
      _version: 3,
      userId: 'usr_test',
      completedLessonIds: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10']
    };
    localStorage.setItem('codolingo_progress_v3', JSON.stringify(progress));
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3030/#/app/lesson/2.1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('URL:', page.url());
  const h1 = await page.$eval('h1, h2', el => el.innerText).catch(e => e.message);
  console.log('Heading:', h1);
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body Text snippet:', text.slice(0, 300));
  await browser.close();
})();
