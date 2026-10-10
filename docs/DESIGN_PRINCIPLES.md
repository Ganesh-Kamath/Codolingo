# Codolingo Design Principles

Codolingo is built on deliberate practice: focused, disciplined, and calm. The user interface reflects this ethos. We value taste over novelty, borrow the craftsmanship of Linear, Stripe, and Apple’s Human Interface Guidelines, and prefer deleting over decorating. Every element must earn its place.

---

### 1. Restrained Palette & Semantic Color
Color communicates state, never decoration.
* **Indigo (`#4338CA` / `#6366F1`)**: Brand and primary navigation.
* **Emerald (`#047857` / `#10B981`)**: Success only. Completed units, correct answers, and verification.
* **Amber (`#D97706` / `#F59E0B`)**: XP and reward metrics only.
* **Red / Rose (`#E11D48` / `#EF4444`)**: Streaks, mistakes, and destructive actions.
* **Neutrals (`Slate / Stone`)**: All backgrounds, cards, dividers, and typography.
* **Rule**: No screen may use more than one accent for emphasis. If everything calls for attention, nothing gets it.

### 2. Tactile Hierarchy
Tactility is reserved for intent.
* **The 3D Bevel Button (`.tactile-btn`)**: Exclusively reserved for the **single primary action** per screen (`Start`, `Continue`, `Run`, `Check`).
* **Secondary & Tertiary Actions**: Flat, subtle, or outlined. Not every button gets to be a physical toy.
* **Elevation**: Elevation and drop shadows are used sparingly and meaningfully (drawers, modal sheets, and popovers). Gratuitous glows, glassmorphism blur, and neon borders are banned.

### 3. Calm Density & Information Architecture
Every screen answers one question: *What is the one thing the user should do here?*
* **Active Prominence**: On the learning path, the current active unit is highlighted prominently; completed units collapse into quiet headers, and future units remain visually silent.
* **Calm Dashboard**: A single primary next step, a compact weekly streak row, and quick drill shortcuts. No vanity cards or clutter.
* **Five Universal Destinations**: Path, Dashboard, Practice, Mistakes, and Profile. Identical structure and behavior on mobile and desktop.

### 4. Direct Voice & Human Clarity
Text is the signature of a shipped product.
* **Sentence Case Everywhere**: "Start learning", "Review mistakes", "Run code". No random ALL CAPS or CamelCase headers.
* **Direct Instructions**: Tell the user what happened and what to do next. "Type your code below and press Run" — never "Let's unleash your coding powers!".
* **Humanized Misconceptions**: Translate developer telemetry into natural language. `STRING_VS_NUMBER` becomes `"Mixing text and numbers"`.
* **Zero Marketing Filler**: No fake testimonials, inflated vanity metrics, or cringe motivational exclamation marks.

### 5. Motion, Sound & Feedback Restraint
Feedback must inform, never overwhelm.
* **Standardized Motion Tokens**: Fast (120ms), Base (200ms), Slow (320ms), all utilizing `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`).
* **Respect Reduced Motion**: Every animated transition respects `@media (prefers-reduced-motion: reduce)`.
* **Fanfare for Milestones Only**: Confetti and fanfare sound effects trigger only for real achievements (completing a unit or hitting a milestone streak) — never on routine exercise answers.
* **Anti-Overlap Audio**: Audio clips never stack or clip; volume is kept modest with an accessible user mute control.
* **Single Toasts**: Only one notification at a time, strictly auto-dismissing (3.2s) and non-blocking.

### 6. Craft, Accessibility & Local-First Integrity
The final 1% defines the software.
* **WCAG 2 AA Compliance**: Text and badges meet or exceed a 4.5:1 contrast ratio in both light and dark themes. Zero exceptions.
* **Touch-Ready Hit Targets**: Minimum 44×44px interactive bounds for all primary actions on touch viewports.
* **Designed States**: Every control features explicit `:hover`, `:focus-visible`, `:active`, and `:disabled` states.
* **Local-First Transparency**: Codolingo stores 100% of its curriculum progress, mistakes, and preferences locally in the browser (`localStorage`). Clear Privacy and Terms documentation guarantees user data ownership.
