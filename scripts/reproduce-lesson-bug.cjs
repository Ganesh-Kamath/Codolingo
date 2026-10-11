const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLearningPathClick() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('requestfailed', req => {
    networkErrors.push({ url: req.url(), failure: req.failure() });
  });

  // Test 1: Fresh state, go to #/app
  console.log('Navigating to http://localhost:3030/#/app...');
  await page.goto('http://localhost:3030/#/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  fs.mkdirSync('test-results/repro', { recursive: true });
  await page.screenshot({ path: 'test-results/repro/01-learning-path.png' });
  console.log('Saved 01-learning-path.png');

  // Check Continue Lesson button
  const continueBtn = await page.$('button:has-text("Continue Lesson")');
  console.log('Continue Lesson button present:', Boolean(continueBtn));

  if (continueBtn) {
    console.log('Clicking Continue Lesson button...');
    await continueBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/repro/02-after-continue-click.png' });
    console.log('Current URL after click:', page.url());
  }

  // Check what's in the DOM
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('Body length:', bodyHtml.length);
  const modals = await page.$$('[role="dialog"]');
  console.log('Number of dialogs in DOM:', modals.length);
  for (let i = 0; i < modals.length; i++) {
    const isVisible = await modals[i].isVisible();
    const text = await modals[i].innerText();
    console.log(`Dialog ${i} visible:`, isVisible, 'Text snippet:', text.slice(0, 100));
  }

  // Also check if any element has blur or fixed overlay
  const overlays = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.backdropFilter.includes('blur') || style.filter.includes('blur');
    }).map(el => ({
      tag: el.tagName,
      className: el.className,
      style: el.getAttribute('style'),
      outerHTML: el.outerHTML.slice(0, 200)
    }));
  });
  console.log('Elements with blur backdropFilter/filter:', overlays);

  console.log('Console logs during test:', consoleLogs);
  console.log('Network errors during test:', networkErrors);

  await browser.close();
}

testLearningPathClick().catch(console.error);
