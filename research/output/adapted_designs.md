# Codolingo Learning Experience & Retention Design Specification

**Design Objective:** Adapt Duolingo's proven habit-forming retention mechanics into original, pedagogy-first systems tailored specifically for programming education.  
**Core Thesis:** In language learning, rote memory and vocabulary recall dominate; in code learning, **active mental models, compiler diagnostics, and deliberate debugging** dominate. We do not clone Duolingo's punitive mechanisms (such as Hearts); we improve retention through mastery, loss prevention, and rapid interactive wins.

---

## 1. Architectural Philosophy: How Codolingo Differs from Duolingo

| Dimension | Duolingo Approach | Codolingo Adapted Design | Pedagogical Justification |
|:---|:---|:---|:---|
| **Failure Penalty (Hearts)** | Deducts 1 of 5 hearts on error; zeroes out session upon exhaustion; monetizes refills. | **Zero Lockout.** Errors are captured into the **Mistake Bank**; compiler execution provides instant truthful feedback. | Programming requires experimentation. Punishing compilation errors makes learners afraid to write code. |
| **Streak Protection (Freezes)** | Purchased in virtual shop using gems or real money. | **Earned via Fix-It Lab.** Successfully resolving 3 diagnosed code misconceptions earns 1 Streak Freeze. | Links loss-aversion directly to pedagogical redemption: *"To protect your streak, master your bugs."* |
| **Decay Model** | Binary cracked skill nodes based on opaque server weights. | **Continuous 0–5 Pip Decay** based on an explicit Half-Life Regression schedule. | Provides nuanced strength feedback ($5 \rightarrow 4 \rightarrow 3$ pips) and visual "Needs Review" prompts without locking forward progress. |
| **Review Sessions** | Random flashcard re-shuffling. | **Targeted Misconception Drills** targeting compiler errors (`OFF_BY_ONE`, `STRING_VS_NUMBER`, etc.). | Fixes the root mental model causing the bug rather than memorizing a specific syntax quiz. |
| **First-Minute Experience** | 3 to 5 demographic and motivation survey screens before any learning. | **30-Second First Win:** Instant runnable `print("Hello, World!")` terminal challenge *before* any survey. | Proves the product's core value proposition (real Python in the browser) within 30 seconds. |
| **Notification Strategy** | Generic reminders or guilt-inducing mascot copy. | **Contextual Educational Nudges** that name the learner's weakest misconception or at-risk streak. | Delivers immediate intellectual curiosity rather than annoying generic spam. |

---

## 2. Detailed Mechanic Specifications

### Mechanic 1: Streak Freeze Earned by Clearing Mistake Bank Drills

#### Concept & Loop
Instead of treating streak protection as an arbitrary financial microtransaction, Codolingo turns the Streak Freeze into an earned reward for deep learning:
1. When a learner makes an error during a lesson, the error is cataloged in `mistakes[]`.
2. The learner visits the **Fix-It Lab** and completes targeted 4-step diagnostic drills (Prediction $\rightarrow$ Contrast $\rightarrow$ Repair $\rightarrow$ Verify).
3. For every **3 resolved misconceptions**, the learner earns **+1 Streak Freeze** (capped at an inventory of 2).
4. If a learner misses a calendar day, an owned freeze is automatically consumed at the next login, preserving their streak and displaying an encouraging recovery modal.

#### State Schema
```typescript
interface StreakModelV4 {
  streak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezeInventory: number; // 0, 1, or 2
  freezeRepairsProgress: number; // 0 to 3 (increments on mistake resolve; resets on freeze earn)
  freezeUsedDates: string[]; // History of saved dates
  streakAtRisk: boolean; // Computed: !activeToday && currentHour >= 18
}
```

#### User Experience
- **Dashboard Widget:** Displays the streak counter with a small snowflake icon badge: `🔥 7  ❄️ 1/2`.
- **Progress Indicator in Fix-It Lab:** A subtle progress card: *"Fix 2 more mistakes to earn a Streak Freeze ❄️ (1/3)"*.
- **Emergency Rescue Modal:** Upon opening the app after an absent day:
  > *"❄️ Streak Freeze Activated! Your 14-day streak was saved from yesterday's absence. You have 1 freeze remaining. Head to Fix-It Lab to recharge your protection."*

---

### Mechanic 2: Temporal Mastery Pip Decay & "Needs Review" Path State

#### Mathematical Half-Life Regression Decay Model
Adapted from Settles & Meeder (2016). Every skill node on the learning path tracks a calibrated half-life $h$ (in days) based on mastery pips:
- **1–2 Pips (Beginner/Developing):** $h = 7\text{ days}$
- **3–4 Pips (Competent/Proficient):** $h = 14\text{ days}$
- **5 Pips (Mastered):** $h = 30\text{ days}$

For elapsed time $\Delta t = \text{currentDate} - \text{lastPracticedAt}$ (in days):
$$\text{decayFactor} = 2^{-\frac{\Delta t}{h}}$$
$$\text{currentPips} = \max\left(1, \operatorname{round}(\text{initialPips} \times \text{decayFactor})\right)$$

A skill enters the **"Needs Review"** state when $\text{currentPips} < \text{initialPips}$ or $\text{decayFactor} < 0.70$.

#### Visual Design on the Learning Path
- **Solid Node:** Full theme color, bright border, glowing pip count (e.g., `5/5`).
- **Needs Review Node:**
  - An amber-pulsing outer halo: `box-shadow: 0 0 12px rgba(245, 158, 11, 0.45)`.
  - An amber badge overlay in place of the star crown: `⚠️ Needs Review`.
  - Pip display shows decayed level with faded ghost pips: `● ● ● ○ ○` (3/5).
- **Targeted Practice:** Clicking a "Needs Review" node offers two buttons in the modal:
  1. **"Quick Refresh (3 Questions)"** $\rightarrow$ Restores skill to 5 pips and awards +15 XP.
  2. **"Replay Full Lesson"** $\rightarrow$ Full 15-question pedagogical walkthrough.

---

### Mechanic 3: Targeted Misconception Review Sessions

#### Concept & Architecture
Rather than random flashcards, Codolingo's Practice Hub generates **Smart Review Sessions** composed of 4 targeted code repair items:
1. Evaluates all unresolved records in `mistakes[]`.
2. Groups mistakes by their canonical `MisconceptionTag` (`OFF_BY_ONE`, `STRING_VS_NUMBER`, `ASSIGNMENT_VS_COMPARISON`, etc.).
3. Pulls a 4-step interactive drill from `curriculum/python/repair/` matching that tag.
4. **Pedagogical Invariant:** The session requires the learner to not only write the correct code, but verify it against the runtime test suite in Pyodide.

#### Feedback & Synergy
- Resolving a misconception drill simultaneously:
  - Marks the mistake `resolved: true`.
  - Increments `freezeRepairsProgress` towards the next Streak Freeze.
  - Re-evaluates and upgrades the mastery pips of any decayed skill covering that concept.

---

### Mechanic 4: Diagnostic Placement Test Built from Misconception Tags

#### Why Generic Multiple-Choice Fails
Traditional placement tests ask questions like *"What is Python?"* or *"What is OOP?"*. This fails because learners often know vocabulary without having accurate mental models of program execution.

#### Codolingo 5-Tier Misconception Placement Matrix
The test consists of 5 progressive code evaluation challenges that pinpoint the learner's exact boundary:

1. **Tier 1 (Unit 1): Syntax & Output Execution**
   - Challenge: Correct the uppercase `Print("Hi")` error.
   - Diagnostic Tag: `SYNTAX_ERROR`
2. **Tier 2 (Unit 2–4): Types & String Concatenation**
   - Challenge: Predict the result of `"10" + 5` and fix it to compute the integer sum `15`.
   - Diagnostic Tag: `STRING_VS_NUMBER` / `WRONG_TYPE`
3. **Tier 3 (Unit 3–5): Conditionals & Equality**
   - Challenge: Detect the bug in `if score = 100:` and explain the difference between assignment and comparison.
   - Diagnostic Tag: `ASSIGNMENT_VS_COMPARISON`
4. **Tier 4 (Unit 6): Loop Boundaries & Indexing**
   - Challenge: Given `for i in range(1, 5):`, how many times does the loop execute and what are the values of `i`?
   - Diagnostic Tag: `OFF_BY_ONE` / `LOOP_EXECUTION_CONFUSION`
5. **Tier 5 (Unit 7–10): Functions & Scope**
   - Challenge: Fix a function that calculates a value but forgets to `return` it (evaluates to `None`).
   - Diagnostic Tag: `VARIABLE_VALUE_CONFUSION` / `FUNCTION_RETURN_NONE`

#### Adaptive Outcome
- Answering all 5 correctly $\rightarrow$ Unlocks Unit 7 (Intermediate Python), awards 250 XP, and marks Units 1–6 as Mastered.
- Failing at Tier 3 $\rightarrow$ Unlocks Units 1–2, places learner at Unit 3 (Operators & Conditionals), and logs `ASSIGNMENT_VS_COMPARISON` directly into their Fix-It Lab for immediate reinforcement.

---

### Mechanic 5: Contextual Notifications Naming Weakest Topics

#### Principles & Tone
Codolingo avoids annoying generic spam. Notifications are educational micro-hooks that trigger curious thinking about real code:

#### Notification Matrix

| Context | Trigger Condition | Notification Title & Copy | Action / Deep Link |
|:---|:---|:---|:---|
| **Weak Concept Recall** | Skill decayed to "Needs Review" after 14 days. | **"Python Brain Check: Loops & Range"**<br>*"Quick question: does `range(0, 5)` include the number 5? Take 2 minutes to refresh your memory."* | Deep links to `/#practice?skill=py_skill_6_5` |
| **At-Risk Streak** | Streak active ($N \ge 1$), no session today, local time 19:30–21:00. | **"Keep your {N}-day streak burning! 🔥"**<br>*"You're 1 quick lesson away from keeping your habit alive before midnight."* | Deep links to next available lesson |
| **Fix-It Lab Rescue** | Unresolved mistake in bank for $> 3$ days. | **"Debug Challenge Waiting 🐛"**<br>*"You have an unresolved Off-by-One bug in Fix-It Lab. Squash it now and earn progress toward a Streak Freeze."* | Deep links to `/#mistakes` |

---

### Mechanic 6: 30-Second First Win: Runnable `print("hello")`

#### Flow Architecture
1. **Landing / Step 0 (0 to 10 seconds):**
   - The user opens Codolingo.
   - Hero header: *"Learn Python by actually running Python."*
   - Immediately visible: An embedded mini-editor preloaded with:
     ```python
     # Your very first Python program
     print("Hello, Codolingo!")
     ```
2. **Action (10 to 15 seconds):**
   - A pulsing green **"▶ Run Code"** button draws the user's attention.
3. **Execution & Payoff (15 to 25 seconds):**
   - Pyodide runs in the background.
   - Output terminal springs open with: `> Hello, Codolingo!`.
   - Micro-confetti triggers with an audio victory sound.
   - Banner: *"🎉 That's it! You just wrote and executed real Python code in your browser."*
4. **Transition to Learning Journey (30+ seconds):**
   - *"Ready to build games, scripts, and real software? Let's calibrate your starting point."*
   - User smoothly transitions into the 5-question misconception placement assessment or Unit 1.
