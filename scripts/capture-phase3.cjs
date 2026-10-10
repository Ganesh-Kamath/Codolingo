const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const outDir = path.join(__dirname, '..', 'screenshots', 'phase3');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch();

  // Helper function to capture a view
  async function take(name, width, height, hashRoute, actions = null) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    await page.goto(`http://localhost:5173/#${hashRoute}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    if (actions) {
      await actions(page);
      await page.waitForTimeout(400);
    }

    const filePath = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${name}.png (${width}x${height})`);
    await context.close();
  }

  // 1. Learning Path - Desktop, Tablet, Mobile
  await take('learning_path_1440', 1440, 900, '/app');
  await take('learning_path_768', 768, 1024, '/app');
  await take('learning_path_375', 375, 812, '/app');

  // 2. Dynamic Unit Capstone Modal open on Desktop
  await take('capstone_modal_1440', 1440, 900, '/app', async (page) => {
    const capstoneBtn = await page.$('button[aria-label*="Capstone Challenge"]');
    if (capstoneBtn) {
      await capstoneBtn.click();
    }
  });

  // 3. Command Dashboard - Desktop, Tablet, Mobile
  await take('dashboard_1440', 1440, 900, '/app/dashboard');
  await take('dashboard_768', 768, 1024, '/app/dashboard');
  await take('dashboard_375', 375, 812, '/app/dashboard');

  // 4. Command Palette (Cmd+K) Modal open
  await take('command_palette_1440', 1440, 900, '/app', async (page) => {
    await page.keyboard.down('Control');
    await page.keyboard.press('k');
    await page.keyboard.up('Control');
  });

  // 5. Header HUD Popover (Streak)
  await take('hud_streak_popover_1440', 1440, 900, '/app', async (page) => {
    const streakBtn = await page.$('button[aria-label="View streak details"]');
    if (streakBtn) {
      await streakBtn.click();
    }
  });

  // 6. Header HUD Popover (XP & Daily Goals)
  await take('hud_xp_popover_1440', 1440, 900, '/app', async (page) => {
    const xpBtn = await page.$('button[aria-label="View XP and level details"]');
    if (xpBtn) {
      await xpBtn.click();
    }
  });

  // 7. Dark Mode Dashboard
  await take('dashboard_dark_1440', 1440, 900, '/app/dashboard', async (page) => {
    const themeBtn = await page.$('button[aria-label="Switch to dark mode"]');
    if (themeBtn) {
      await themeBtn.click();
    }
  });

  await browser.close();
  console.log('Phase 3 screenshot capture complete!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
