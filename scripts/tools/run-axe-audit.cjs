const { chromium } = require('playwright');
const axe = require('axe-core');

const BASE_URL = 'http://localhost:5173';

const routes = [
  { name: 'Landing Page', url: '/#/landing' },
  { name: 'Learning Path', url: '/#/app' },
  { name: 'Dashboard', url: '/#/app/dashboard' },
  { name: 'Practice Arena', url: '/#/app/practice' },
  { name: 'Mistake Review', url: '/#/app/review' },
  { name: 'Profile & Settings', url: '/#/app/profile' },
  { name: 'Lesson Runner', url: '/#/app/lesson/1.1' },
  { name: 'Privacy Policy', url: '/#/privacy' },
  { name: 'Terms of Service', url: '/#/terms' },
  { name: 'Changelog', url: '/#/changelog' }
];

async function run() {
  console.log('=== CODOLINGO ACCESSIBILITY AUDIT (AXE-CORE) ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let totalViolations = 0;

  for (const r of routes) {
    try {
      await page.goto(`${BASE_URL}${r.url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      // Inject axe-core
      await page.evaluate(axe.source);

      // Run axe evaluation
      const results = await page.evaluate(async () => {
        // @ts-ignore
        return await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'best-practice']
          }
        });
      });

      const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      console.log(`[${r.name}] Violations: ${violations.length} critical/serious, ${results.violations.length} total.`);

      if (violations.length > 0) {
        totalViolations += violations.length;
        violations.forEach(v => {
          console.log(`   ❌ [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
          v.nodes.slice(0, 3).forEach(n => {
            console.log(`      Node: ${n.target.join(', ')}`);
            console.log(`      HTML: ${n.html}`);
            console.log(`      Summary: ${n.failureSummary}`);
          });
        });
      } else {
        console.log(`   ✅ PASS: 0 critical or serious accessibility issues.`);
      }
    } catch (e) {
      console.error(`Error auditing ${r.name}:`, e.message);
    }
  }

  await browser.close();
  console.log(`\n=== AUDIT COMPLETE: ${totalViolations} critical/serious violations found ===`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
