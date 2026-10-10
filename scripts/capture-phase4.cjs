const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const outDir = path.join(__dirname, '..', 'screenshots', 'phase4');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch();

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
      await page.waitForTimeout(500);
    }

    const filePath = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${name}.png (${width}x${height})`);
    await context.close();
  }

  // 1. Practice Arena - Playground View
  await take('practice_playground_1440', 1440, 900, '/app/practice');
  await take('practice_playground_768', 768, 1024, '/app/practice');
  await take('practice_playground_375', 375, 812, '/app/practice');

  // 2. Practice Arena - Challenges View (with Topic Chips & Solved Filter)
  await take('practice_challenges_1440', 1440, 900, '/app/practice', async (page) => {
    const challengesTabBtn = await page.getByRole('button', { name: /Challenges/i });
    if (challengesTabBtn) await challengesTabBtn.click();
  });
  await take('practice_challenges_768', 768, 1024, '/app/practice', async (page) => {
    const challengesTabBtn = await page.getByRole('button', { name: /Challenges/i });
    if (challengesTabBtn) await challengesTabBtn.click();
  });
  await take('practice_challenges_375', 375, 812, '/app/practice', async (page) => {
    const challengesTabBtn = await page.getByRole('button', { name: /Challenges/i });
    if (challengesTabBtn) await challengesTabBtn.click();
  });

  // 3. Challenge Workspace IDE (Description vs Solution Tabs)
  await take('challenge_workspace_description_1440', 1440, 900, '/app/practice', async (page) => {
    const challengesTabBtn = await page.getByRole('button', { name: /Challenges/i });
    if (challengesTabBtn) await challengesTabBtn.click();
    await page.waitForTimeout(300);
    const firstChallenge = await page.getByText(/Open Challenge/i).first();
    if (firstChallenge) await firstChallenge.click();
  });

  await take('challenge_workspace_solution_1440', 1440, 900, '/app/practice', async (page) => {
    const challengesTabBtn = await page.getByRole('button', { name: /Challenges/i });
    if (challengesTabBtn) await challengesTabBtn.click();
    await page.waitForTimeout(300);
    const firstChallenge = await page.getByText(/Open Challenge/i).first();
    if (firstChallenge) await firstChallenge.click();
    await page.waitForTimeout(400);
    const solutionTab = await page.getByRole('button', { name: /Solution/i });
    if (solutionTab) await solutionTab.click();
    await page.waitForTimeout(300);
    const revealBtn = await page.getByRole('button', { name: /Reveal Reference Solution/i });
    if (revealBtn) await revealBtn.click();
  });

  // 4. Project Workspace (Expanded & Collapsed Requirements)
  await take('project_workspace_1440', 1440, 900, '/app/practice', async (page) => {
    const projectsTab = await page.getByRole('button', { name: /Projects/i });
    if (projectsTab) await projectsTab.click();
    await page.waitForTimeout(300);
    const firstProject = await page.getByRole('button', { name: /Build Project/i }).first();
    if (firstProject) await firstProject.click();
  });

  await take('project_workspace_collapsed_1440', 1440, 900, '/app/practice', async (page) => {
    const projectsTab = await page.getByRole('button', { name: /Projects/i });
    if (projectsTab) await projectsTab.click();
    await page.waitForTimeout(300);
    const firstProject = await page.getByRole('button', { name: /Build Project/i }).first();
    if (firstProject) await firstProject.click();
    await page.waitForTimeout(400);
    const hideBtn = await page.getByRole('button', { name: /Hide Requirements/i });
    if (hideBtn) await hideBtn.click();
  });

  // 5. Mistake Review View (Grouped by Concept)
  await take('mistakes_review_1440', 1440, 900, '/app/mistakes');
  await take('mistakes_review_768', 768, 1024, '/app/mistakes');
  await take('mistakes_review_375', 375, 812, '/app/mistakes');

  // 6. Profile View (Stats, Achievements, Settings)
  await take('profile_view_1440', 1440, 900, '/app/profile');
  await take('profile_view_768', 768, 1024, '/app/profile');
  await take('profile_view_375', 375, 812, '/app/profile');

  // 7. Profile Edit Modal Open
  await take('profile_edit_modal_1440', 1440, 900, '/app/profile', async (page) => {
    const editBtn = await page.getByRole('button', { name: /Edit Profile/i });
    if (editBtn) await editBtn.click();
  });

  // 8. Dark Mode Profile View
  await take('profile_dark_1440', 1440, 900, '/app/profile', async (page) => {
    const themeBtn = await page.$('button[aria-label="Switch to dark mode"]');
    if (themeBtn) await themeBtn.click();
  });

  await browser.close();
  console.log('Phase 4 screenshot capture complete!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
