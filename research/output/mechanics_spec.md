# Duolingo Learning Experience & Retention Mechanics Specification

**Investigation Context:** Clean-room behavioral and architecture extraction of Duolingo's retention, engagement, and progression mechanics.  
**Approved Sources:**
- Empirical observation & DOM inspection: `codolingoREA/duolingo_research/07_gamification.md`, `08_review_and_personalization.md`, `18_duolingo_ux_research.md`
- Screen inspection & flow states: `codolingoREA/scratch/*.png`, `onboarding_step_*.png`, `linguapace_practice.png`
- Public scientific literature: Settles & Meeder (2016), *"A Trainable Spaced Repetition Model for Language Learning"* (ACL 2016)
- Engineering disclosures: Duolingo Engineering Blog (*"How Duolingo uses AI to power notifications"*, *"Designing the Streak Freeze"*, *"Birdbrain Adaptive Engine"*)

---

## 1. Streak, Streak Freeze & "At-Risk" Nudge

### Trigger
- Completion of at least 1 qualified learning session before local midnight (`23:59:59 local time`).

### User Action
- Completing a standard lesson, practice session, story, or mistake drill.

### Reward / Feedback
- **Timing:** Immediately on lesson completion summary screen (Screen 2 of end-of-lesson flow).
- **Intensity:** High visual & auditory fanfare. Animated flame icon ignites, streak counter increments (+1), flame color pulses (orange/amber gradient with particle bursts), and a motivational banner displays (e.g., *"You're on fire! 7 day streak achieved"*). Audio trigger: rising celebratory pitch.

### Return Hook
- **Loss Aversion:** The psychological threat of forfeiting an accumulated streak. Once a streak reaches >= 3 days, retention increases exponentially as the perceived sunk cost escalates.
- **"At-Risk" Nudge:** At 18:00–21:00 local time, if no session has been recorded, a high-priority push notification / in-app modal triggers with urgent urgency cue (*"Keep your 7-day streak alive! Complete a quick 3-minute lesson before midnight"*).

### Failure Handling
- **Streak Freeze (Item):** If a user misses a calendar day, an active Streak Freeze is consumed automatically at midnight. The streak counter is frozen without resetting to 0.
- **Visual State:** The streak flame renders as an icy blue crystal, notifying the learner: *"Your streak freeze saved your streak! You have 1 day to practice"*.
- **Recovery Offer:** If no freeze was owned and the streak broke, an emergency "Streak Repair" challenge or gem purchase is offered during the first login after the break.

### State Stored
```typescript
interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // ISO YYYY-MM-DD
  freezeInventory: number; // Max capacity 2
  freezeUsedDates: string[]; // History of days protected by freezes
  streakAtRisk: boolean; // Computed: !practicedToday && localHour >= 18
  repairAvailableUntil?: string; // Expiration window for streak recovery
}
```

---

## 2. XP, Daily Goal & Levels

### Trigger
- Evaluation of answers and successful completion of any interactive lesson or practice drill.

### User Action
- Answering questions accurately, maintaining combo streaks (consecutive correct answers), and finishing sessions.

### Reward / Feedback
- **Base XP:** Standard lesson grants 10 XP.
- **Accuracy / Combo Bonus:** +1 to +5 XP scaled by unbroken correct answer runs within the session.
- **Timing:** Immediate animated counter tallying on the lesson summary screen. A circular daily goal ring fills progressively with spring physics; when 100% is reached, confetti explodes and an audio chime triggers.

### Return Hook
- **Goal Gradient Effect:** Visual progress rings (e.g., 35/50 XP) push learners to complete "just one more lesson" to close their daily circle before midnight.
- **Level Tier Escalation:** Total XP maps to learner levels, giving lifetime achievement standing.

### Failure Handling
- XP is strictly additive. Learners never lose XP on wrong answers. An aborted lesson yields partial XP (if configured) or 0 XP, but never penalizes existing accumulated XP.

### State Stored
```typescript
interface XPAndGoalModel {
  totalXp: number;
  level: number;
  dailyGoal: {
    xpTarget: number; // e.g., 20, 30, 50 XP
    xpEarned: number;
    lessonsTarget: number;
    lessonsCompleted: number;
    date: string; // YYYY-MM-DD
  };
  comboHistory: {
    maxSessionCombo: number;
    currentCombo: number;
  };
}
```

---

## 3. Skill Strength with Decay Over Time (Half-Life Regression)

### Trigger
- Natural passage of elapsed time since the learner last practiced a given concept or skill node.

### User Action
- Practicing, reviewing, or successfully utilizing words/syntax associated with that skill node in subsequent exercises.

### Reward / Feedback
- **Decay State:** Visual degradation on the learning path. When skill memory strength falls below a threshold ($p < 0.65$), the skill node transitions from full solid color to a cracked, faded, or "Needs Review" state with an amber alert pip.
- **Restoration Reward:** Completing a targeted review restores the node to pristine solid state (+20 XP, full visual crown / pips).

### Return Hook
- Visual decay triggers order-maintenance and completionist psychology. Learners dislike seeing their "mastered" skills cracked or downgraded and return to polish their pathway.

### Failure Handling
- Decay affects *strength/readiness*, not unlocked progression. A cracked or decayed skill **never locks future downstream skills** that the user has already unlocked.

### Underpinning Model: Settles & Meeder (2016) Half-Life Regression (HLR)
The probability $p$ of recalling an item at elapsed time $\Delta t$ follows an exponential decay:
$$p = 2^{-\frac{\Delta t}{h}}$$
where $h$ is the predicted memory half-life (in hours or days), parameterized by learner history:
$$h = 2^{\mathbf{\theta} \cdot \mathbf{x}}$$
where $\mathbf{x}$ encodes features: total practice count, total correct attempts, total mistakes, and time since last seen.

### State Stored
```typescript
interface SkillDecayState {
  skillId: string;
  lastPracticedAt: string; // ISO 8601 timestamp
  halfLifeHours: number; // Predicted half-life
  estimatedStrength: number; // 0.0 to 1.0 (computed at read time)
  needsReview: boolean; // true when strength < 0.60
  consecutiveSuccessCount: number;
  totalMistakeCount: number;
}
```

---

## 4. Spaced Review & Practice of Weak Skills (Mistake Bank)

### Trigger
- User commits an error on any question during a standard lesson or test.

### User Action
- Accessing the dedicated Practice Hub (dumbbell tab) and launching a targeted 10-question Mistake Drill.

### Reward / Feedback
- **Session Queue Loop:** The missed question is immediately re-queued at the end of the current lesson until answered correctly.
- **Persistent Mistake Bank:** In addition to the session retry, the mistake is logged permanently in the Mistake Bank with its concept category and user code/answer.
- **Clearing Feedback:** In the Practice Hub, answering a banked item correctly increments its recovery counter. When it reaches 2 consecutive correct answers, it is formally archived with a satisfying "Cleared from Mistakes" green stamp.

### Return Hook
- A prominent badge indicator on the Practice tab showing unresolved mistake count (e.g., `"3 Mistakes to Fix"`). Learners are motivated to achieve an "inbox zero" state.

### Failure Handling
- Practicing mistakes costs no hearts/energy; wrong answers in the practice hub simply keep the item in the queue for future drills.

### State Stored
```typescript
interface MistakeBankModel {
  mistakes: Array<{
    id: string;
    challengeId: string;
    skillId: string;
    conceptTag: string;
    prompt: string;
    userSubmission: string;
    expectedSolution: string;
    timestamp: string;
    recoveryRepetitions: number; // Target: 2 to clear
    resolved: boolean;
  }>;
  lastReviewSessionAt?: string;
}
```

---

## 5. Lesson Pacing & Progress Feedback

### Trigger
- Launching an active lesson node from the learning path.

### User Action
- Progressing step-by-step through 12 to 15 bite-sized interactive challenges.

### Reward / Feedback
- **Target Session Duration:** 3.5 to 5.0 minutes.
- **Top Progress Bar:** Fixed horizontal progress bar at the top of the viewport. Increments dynamically on each completed challenge ($+1/N$).
- **Micro-Milestones:** At 50% (`"Halfway there!"`) and at 80% (`"Almost done!"`), supportive micro-banners motivate the learner.
- **Combo Puffs:** Answering 3, 5, and 10 questions correct in a row triggers increasing visual celebration tags (`"3 in a row!"`, `"5 in a row! You're unstoppable"`).

### Return Hook
- The brief, frictionless session length reduces entry friction: learners know they can accomplish a meaningful learning loop in the spare minutes of a commute or coffee break.

### Failure Handling
- **Immediate Inline Diagnostic:** Upon wrong answer, the bottom feedback drawer slides up in crimson with the exact correction and explanation.
- **End-of-Session Retry:** Missed items are re-presented at the conclusion of the session, guaranteeing that every learner ends their lesson on successful answers.

### State Stored
```typescript
interface ActiveLessonSessionState {
  lessonId: string;
  totalBlocks: number;
  currentIndex: number;
  correctAnswersCount: number;
  hintsUsedCount: number;
  currentCombo: number;
  highestCombo: number;
  requeuedItems: string[]; // Block IDs to replay at end
  startedAt: number; // epoch ms
}
```

---

## 6. Onboarding & Placement / Skip-Ahead Test

### Trigger
- First-time user landing on the application.

### User Action
- Progressing through a low-friction survey (experience level, daily goal target) followed by either an immediate 30-second interactive challenge or a 5-minute placement assessment.

### Reward / Feedback
- **Zero-Friction First Win:** The very first interaction occurs within 30 seconds without requiring email, password, or account setup.
- **Instant Credit:** Completing the placement test unlocks Units 1–N and awards bulk XP + unlocked badges immediately.

### Return Hook
- "Foot-in-the-door" psychological commitment: the user invests effort into learning *before* they are prompted to save their profile.

### Failure Handling
- Placement test adapts difficulty downwards if errors occur; it never displays a "Failed" screen, but instead says: *"We found your ideal starting point! Welcome to Unit 2"*.

### State Stored
```typescript
interface OnboardingPlacementState {
  hasCompletedOnboarding: boolean;
  experienceLevel: 'beginner' | 'some_knowledge' | 'advanced';
  placementScore?: number;
  skippedUnitsCount: number;
  onboardingCompletedAt?: string;
}
```

---

## 7. Notifications & Reminders Timing

### Trigger
- Background schedule evaluating user activity timestamp, local time zone, and historical peak activity hours.

### User Action
- Clicking a push notification / OS prompt to open the application directly to the next playable lesson.

### Reward / Feedback
- Deep-links directly to the pending lesson or weak skill review without splash delay.

### Underpinning Model (Duolingo Bandit Engine)
- Instead of naive fixed-time blasts, Duolingo uses contextual multi-armed bandits to optimize:
  1. **Send Time:** Personalized to the user's historical highest-probability session window (typically 19:00–21:30).
  2. **Copy Tone:** Urgent ("Don't lose your streak!"), Encouraging ("You're only 15 XP from your goal"), or Sarcastic/Guilt-inducing ("These reminders don't seem to be working...").

### Return Hook
- Re-engages fading attention before the 24-hour streak window expires.

### State Stored
```typescript
interface NotificationScheduleState {
  preferredHour: number; // 0 - 23
  notificationsEnabled: boolean;
  lastNotificationSentAt?: string;
  streakExpiryWarningSent: boolean;
  weakTopicMentioned?: string;
}
```

---

## 8. Leagues & Social Competition (Documented for Reference)

### Specification Overview (No Immediate Codolingo Design)
- **Cohort Structure:** Every Monday 00:00 UTC, users are grouped into randomized 30-person leaderboards (Bronze $\rightarrow$ Silver $\rightarrow$ Gold $\rightarrow$ Sapphire $\rightarrow$ Ruby $\rightarrow$ Emerald $\rightarrow$ Amethyst $\rightarrow$ Pearl $\rightarrow$ Obsidian $\rightarrow$ Diamond).
- **Weekly Dynamics:**
  - Top 7: Promoted to next higher tier + Gem reward.
  - Middle 16: Safe (retain tier).
  - Bottom 7: Demoted to lower tier (Loss Aversion).
- **Mechanic Purpose:** Drives weekend XP surges as users fight to stay out of the demotion zone or break into the top 3.
- *Per instruction, this social mechanic is documented here for behavioral reference and not implemented in this phase.*
