const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots/phase1');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4173...');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    stdio: 'pipe'
  });

  // Give server 3 seconds to spin up
  await new Promise(r => setTimeout(r, 3000));

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'mobile_375px', width: 375, height: 812 },
    { name: 'tablet_768px', width: 768, height: 1024 },
    { name: 'desktop_1440px', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });

    console.log(`Navigating to http://localhost:4173 at ${vp.width}x${vp.height}...`);
    await page.goto('http://localhost:4173/#/app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Capture Light Mode
    const lightPath = path.join(SCREENSHOTS_DIR, `phase1_${vp.name}_light.png`);
    await page.screenshot({ path: lightPath });
    console.log(`Saved: ${lightPath}`);

    // Switch to Dark Mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('codolingo_theme', 'dark');
    });
    await page.waitForTimeout(500);

    // Capture Dark Mode
    const darkPath = path.join(SCREENSHOTS_DIR, `phase1_${vp.name}_dark.png`);
    await page.screenshot({ path: darkPath });
    console.log(`Saved: ${darkPath}`);

    await page.close();
  }

  await browser.close();
  preview.kill();
  console.log('Phase 1 screenshots captured successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
