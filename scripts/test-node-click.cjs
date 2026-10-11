const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3030/#/app');
  await page.waitForTimeout(500);

  const btn12 = await page.$('button[aria-label*="Your First Python Program"]');
  console.log('btn12 found:', Boolean(btn12));
  await btn12.click();
  await page.waitForTimeout(500);

  const modal = await page.$('.card-plate.animate-pop-in');
  console.log('modal text:', modal ? await modal.innerText() : 'none');

  const startBtn = await page.$('button:has-text("Start Lesson"), button:has-text("Continue"), button:has-text("Practice again")');
  console.log('startBtn text:', startBtn ? await startBtn.innerText() : 'none');

  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(2000);
    console.log('URL after start:', page.url());
    console.log('h1 text:', await page.$eval('h1', el => el.innerText).catch(e => e.message));
  }

  await browser.close();
})();
