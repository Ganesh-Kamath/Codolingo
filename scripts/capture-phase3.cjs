const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase3');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const routes = [
  { name: 'landing', path: '/#/landing' },
  { name: 'path', path: '/#/app' },
  { name: 'dashboard', path: '/#/app/dashboard' },
  { name: 'practice', path: '/#/app/practice' },
  { name: 'review', path: '/#/app/review' },
  { name: 'profile', path: '/#/app/profile' },
  { name: 'lesson', path: '/#/app/lesson/1.1' }
];

const viewports = [
  { label: '1440', width: 1440, height: 900 },
  { label: '768', width: 768, height: 1024 },
  { label: '375', width: 375, height: 812 }
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const theme of ['light', 'dark']) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      // Set localStorage theme
      await page.addInitScript(({ themeName }) => {
        localStorage.setItem('codolingo_theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
      }, { themeName: theme });

      for (const r of routes) {
        try {
          await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle', timeout: 15000 });
          // Ensure lazy route chunk renders and replaces skeleton
          await page.waitForSelector('.card-plate, h1, h2, .codon-bottom-nav', { timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(1000);
          const filename = `${r.name}_${theme}_${vp.label}.png`;
          await page.screenshot({ path: path.join(OUT_DIR, filename) });
          console.log(`Saved: ${filename}`);
        } catch (err) {
          console.error(`Failed ${r.name} (${theme}, ${vp.label}):`, err.message);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log('Phase 3 screenshot capture complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
