const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3030/#/app');

  const lessonCheck = await page.evaluate(async () => {
    const { courseService } = await import('/src/services/courseService.ts');
    const { PYTHON_COURSE } = await import('/src/data/pathCurriculum.ts');

    const results = [];
    for (const unit of PYTHON_COURSE.units) {
      for (const skill of unit.skills) {
        for (const les of skill.lessons) {
          try {
            const start = performance.now();
            const blocks = await courseService.getLessonBlocks('python', les.id);
            const duration = Math.round(performance.now() - start);
            results.push({
              unitId: unit.id,
              unitNumber: unit.unitNumber,
              skillId: skill.id,
              lessonId: les.id,
              title: les.title,
              blockCount: blocks ? blocks.length : 0,
              durationMs: duration,
              types: blocks ? Array.from(new Set(blocks.map(b => b.type))) : []
            });
          } catch (err) {
            results.push({
              unitId: unit.id,
              lessonId: les.id,
              error: err.message
            });
          }
        }
      }
    }
    return results;
  });

  console.log(`Evaluated ${lessonCheck.length} lessons.`);
  const zeroBlocks = lessonCheck.filter(l => l.blockCount === 0 || l.error);
  console.log(`Lessons with 0 blocks: ${zeroBlocks.length}`);
  console.log('Sample 0 blocks:', zeroBlocks.slice(0, 10));

  const validBlocks = lessonCheck.filter(l => l.blockCount > 0);
  console.log(`Lessons with >0 blocks: ${validBlocks.length}`);
  console.log('Sample valid blocks:', validBlocks.slice(0, 10));

  await browser.close();
})();
