# Codolingo Script Tooling

Automated verification, regression testing, curriculum validation, and developer utilities for Codolingo.

---

## Directory Overview

```
scripts/
├── validate/     # Quality gates and curriculum consistency auditors
├── test/         # Unit, integration, state progression, and E2E suites
└── tools/        # Screenshot capturing, accessibility audits, and proxy utilities
```

---

## 1. Validators (`scripts/validate/`)

| Script | Purpose | Command |
|---|---|---|
| `validate-exercises.cjs` | **Authoritative Quality Gate:** Audits all 821 exercises in playable Units 1–6 for correct taxonomy, format, duplicate prompts, and updates `curriculumStatus.json`. | `npm run validate` |
| `validate-content.cjs` | Executes Python solution codes against assertions using headless Python runner. Supports unit filtering via `--unit=unit_06`. | `node scripts/validate/validate-content.cjs` |
| `validate-repair-content.cjs` | Validates complete 4-step contracts across all 13 misconception tags in the Fix-It Lab Mistake Bank. | `node scripts/validate/validate-repair-content.cjs` |

---

## 2. Test Suites (`scripts/test/`)

| Script | Purpose | Command |
|---|---|---|
| `test-multi-unit-flow.cjs` | Simulates multi-unit playthrough across Units 1–3, asserting sequential unlocks, dynamic mastery, XP, achievements, and persistence. | `node scripts/test/test-multi-unit-flow.cjs` |
| `test-regression-suite.cjs` | 26 core regression checks covering Python execution, mistake resolution, XP deduplication, and locked state boundaries. | `node scripts/test/test-regression-suite.cjs` |
| `test-mastery-migration.cjs` | 12 tests verifying pip calibration, historical storage migration (v2 to v3), and replay safety. | `node scripts/test/test-mastery-migration.cjs` |
| `test-lesson-resolution-index.cjs` | Verifies all 244 course lesson IDs resolve cleanly to curriculum content files. | `node scripts/test/test-lesson-resolution-index.cjs` |
| `test-block-type-renderers.cjs` | Verifies that every content block type has an explicit renderer in `MultiStepLessonView`. | `node scripts/test/test-block-type-renderers.cjs` |
| `test-playable-lessons-e2e.cjs` | Playwright E2E runner validating all playable lessons across Light/Dark modes and Desktop/Mobile viewports (requires running preview server). | `node scripts/test/test-playable-lessons-e2e.cjs` |

Run all tests via `npm test`.

---

## 3. Developer Tools (`scripts/tools/`)

| Script | Purpose | Usage |
|---|---|---|
| `capture-deliverable-screenshots.cjs` | Playwright utility that launches Chromium and captures clean screenshots into `test-results/deliverable-screenshots/`. | `node scripts/tools/capture-deliverable-screenshots.cjs` |
| `run-axe-audit.cjs` | Accessibility auditor scanning top views with axe-core for WCAG AA compliance. | `node scripts/tools/run-axe-audit.cjs` |
| `generate-python-course.cjs` | Re-generates `pythonCourse.ts` from manifest and curriculum content definitions. | `node scripts/tools/generate-python-course.cjs` |
| `serve-all.js` | Local development proxy forwarding ports 3000 and 8000 to the Vite dev server on 5173. | `node scripts/tools/serve-all.js` |
