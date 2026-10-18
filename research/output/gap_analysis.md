# Codolingo Learning Loop Gap Analysis

**Analysis Scope:** Comparative evaluation of Codolingo's existing architecture, services, and views against the reverse-engineered Duolingo retention mechanics.  
**Evaluated Codebase Files:**
- `src/services/masteryService.ts`
- `src/services/progressionService.ts`
- `src/services/storageService.ts`
- `src/services/practiceChallengeService.ts`
- `src/services/migrationService.ts`
- `src/context/AppContext.tsx`
- `src/constants/mastery.ts`
- `src/data/pathCurriculum.ts`
- `src/views/MultiStepLessonView.tsx`
- `src/views/MistakeReviewView.tsx`
- `src/views/DashboardView.tsx`
- `src/views/OnboardingView.tsx`
- `src/views/PracticeView.tsx`

---

## 1. Summary Matrix

| # | Retention Mechanic | Codolingo Status | Primary File References | Severity of Gap |
|:---:|:---|:---:|:---|:---:|
| **1** | **Streak, Streak Freeze & "At-Risk" Nudge** | **Partial** | `progressionService.ts:63-92`<br>`types/index.ts:160-163`<br>`DashboardView.tsx:320-360` | **High** |
| **2** | **XP, Daily Goal & Leveling** | **Already Present** | `progressionService.ts:43-61, 184-192`<br>`DashboardView.tsx:10-56`<br>`types/index.ts:183-195` | **Low** |
| **3** | **Skill Strength with Temporal Decay** | **Partial (Frozen)** | `masteryService.ts:123-128`<br>`constants/mastery.ts:6-33`<br>`types/index.ts:175-180` | **Critical** |
| **4** | **Spaced Review of Weak Skills (Mistake Bank)** | **Partial** | `MistakeReviewView.tsx:1-711`<br>`storageService.ts:182-219`<br>`curriculum/python/repair/index.ts` | **Medium** |
| **5** | **Lesson Pacing & In-Session Retry** | **Already Present** | `MultiStepLessonView.tsx:1-550`<br>`components/common/ProgressBar.tsx` | **Low** |
| **6** | **Onboarding (30s First Win) & Diagnostic Placement** | **Partial** | `OnboardingView.tsx:1-525`<br>`curriculum/python/foundations/` | **High** |
| **7** | **Contextual Notifications & Reminders** | **Missing** | *No notification service exists* | **Medium** |
| **8** | **Social Leagues & Leaderboards** | **Missing** | *Single-player local schema only* | *Deferred* |

---

## 2. In-Depth Mechanic Diagnostics

### 1. Streak, Streak Freeze & "At-Risk" Nudge
- **Current State:**
  - `progressionService.updateStreak()` tracks `streak` and `bestStreak` based on calendar day string (`YYYY-MM-DD`). If user completes a lesson today, streak holds; if yesterday had activity, streak increments; if yesterday had no activity, streak drops to 1.
- **What is Weak / Missing:**
  - **No Freeze Safety Net:** Missing a single day completely wipes a 30-day streak. This is the single biggest cause of permanent learner churn in habit-forming educational apps.
  - **No Freeze Inventory in Schema:** `UserProgressState` has no `freezeInventory` or `freezeUsedDates` fields.
  - **No "At-Risk" Indicator:** The Dashboard displays the streak flame, but does not differentiate between "active and protected" vs "at-risk of breaking tonight if you do not practice".
  - **No Earnable Freezes:** There is no loop rewarding learners with a freeze for diligent behavior (such as clearing mistake drills).

---

### 2. XP, Daily Goal & Levels
- **Current State:**
  - `progressionService.calculateLevel()` implements a quadratic XP progression ($level \times 100$).
  - `DashboardView.tsx` features a circular SVG `DailyGoalRing` displaying real-time daily progress ($0-100\%$) against target XP.
- **What is Weak / Missing:**
  - XP rewards are purely static (25 XP for normal lessons, 50 XP for projects). There is no accuracy bonus or combo reward for running error-free Python code strings.
  - In-lesson milestone celebration when the daily goal is crossed mid-lesson is absent.

---

### 3. Skill Strength with Temporal Decay (Half-Life Regression)
- **Current State:**
  - `masteryService.evaluateAttempt()` calculates accurate 0–5 pips based on first-try accuracy, hint penalties, and unresolved mistakes.
  - `masteryService.updateSkillMastery()` is explicitly non-decreasing:
    ```typescript
    updateSkillMastery(currentPips: number | undefined, newPips: number): number {
      if (currentPips === undefined || currentPips === UNKNOWN_MASTERY_PIPS) return newPips;
      return Math.max(currentPips, newPips);
    }
    ```
- **What is Weak / Missing:**
  - **Zero Temporal Decay:** Once a user achieves 5 pips on Unit 2 (Variables), it stays at 5 pips forever, even 6 months later.
  - **Missing Timestamps:** `skillMastery` is merely `Record<string, number>` (mapping skill ID to pip integer). There is no record of `lastPracticedAt` per skill.
  - **Pathway Stagnation:** Because skills never decay, the Learning Path has no visual "Needs Review" state, eliminating the powerful completionist pull that brings learners back to review foundational topics.

---

### 4. Spaced Review & Weak Skills Practice (Mistake Bank)
- **Current State:**
  - `MistakeReviewView.tsx` (Fix-It Lab) is remarkably well-built with 4-step pedagogical drills (Prediction $\rightarrow$ Contrast $\rightarrow$ Repair $\rightarrow$ Verify) across 13 misconception tags.
  - `storageService.recordMistake()` de-duplicates mistakes and tracks frequency.
- **What is Weak / Missing:**
  - **Disconnection from Lesson Flow:** In `MultiStepLessonView.tsx`, when a learner fails a code test, a mistake is recorded, but the lesson does not re-queue that question at the end of the lesson. Learners can pass the lesson while leaving fundamental syntax broken.
  - **No Spaced Repetition Scheduling:** Fix-It Lab is a passive inbox. It does not calculate an optimal spaced repetition review interval (e.g., review in 1 day, then 3 days, then 7 days).
  - **No Value Exchange:** Resolving mistakes awards base XP, but does not replenish decayed skill pips or earn streak freezes.

---

### 5. Lesson Pacing & In-Session Retry
- **Current State:**
  - 15 questions per lesson pre-indexed through 7 pedagogical stages.
  - Smooth top `ProgressBar`, Pyodide code execution, hint ladder, and mastery evaluation modal upon finish.
- **What is Weak / Missing:**
  - Duolingo's key pedagogical invariant is that **all incorrect items are re-queued at the end of the active session** so the learner always finishes on mastery. `MultiStepLessonView` currently advances monotonically from index 0 to `blocks.length - 1` without a retry loop.

---

### 6. Onboarding & Diagnostic Placement
- **Current State:**
  - `OnboardingView.tsx` asks experience level (`brand_new`, `know_little`, `experienced`) and offers a 5-question placement test.
- **What is Weak / Missing:**
  - **Violation of 30-Second First Win:** A brand-new user must click through 3 multi-choice survey screens before writing or running any code.
  - **Heuristic Placement Questions:** The 5 placement questions test rote multiple-choice trivia rather than diagnosing specific misconceptions (like `ASSIGNMENT_VS_COMPARISON` or `STRING_VS_NUMBER`).
  - **No Live Python Execution in Placement:** The user does not interact with the compiler or run code during placement.

---

### 7. Contextual Notifications & Reminders Timing
- **Current State:**
  - **Completely Missing.** There are no notification dispatchers, Web Notification permissions, or in-app schedule checks.
- **What is Weak / Missing:**
  - Zero re-engagement mechanism when the browser tab is closed.
  - No capability to nudge users at 20:00 about their at-risk streak.
  - No contextual notification referencing their specific struggling misconception (e.g., *"Take 3 minutes to master Python indentation before your streak resets"*).

---

### 8. Leagues & Social
- **Current State:**
  - **Missing by design.** Codolingo is currently a local-first single-player application using `localStorage`.
- **Verdict:**
  - Preserved as future cloud roadmap; not in immediate v4 offline scope.
