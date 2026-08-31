# SPPU Exam Intelligence — Design System & UI/UX

## 1. Design Goal

Build a premium, modern, student-first exam platform.

The product should feel closer to a polished SaaS product than a traditional college/PDF website.

Core UX promise:

> **Don't study everything. Study what matters.**

Primary UX outcomes:
- Find the correct subject quickly.
- Understand what matters most.
- Move from topic → notes → PYQs → practice without friction.
- Know what to study next.
- Work extremely well on mobile.

---

## 2. Design Principles

1. **Clarity over decoration**
2. **Information hierarchy over visual noise**
3. **Fast paths to exam preparation**
4. **Mobile-first**
5. **Consistent components**
6. **Accessible by default**
7. **Subtle motion, not distracting motion**
8. **Premium feel without excessive gradients**
9. **Trust and source visibility**
10. **Every major screen should have a clear next action**

---

## 3. Visual Direction

### Personality

- Modern
- Premium
- Academic
- Confident
- Focused
- Friendly
- Minimal

### Avoid

- Outdated college-website aesthetics
- Excessive gradients
- Huge decorative illustrations
- Too many colors
- Cluttered card grids
- Tiny text
- Intrusive popups
- Aggressive sales UI
- Animation everywhere

---

## 4. Color System

Use a restrained semantic palette.

### Core

- Background
- Surface
- Elevated surface
- Primary text
- Secondary text
- Border
- Primary action

### Semantic

- Success
- Warning
- Danger
- Information

### Priority colors

Use semantic priority consistently:

- 🔴 Must Study / Very High
- 🟠 High Priority
- 🟡 Medium
- ⚪ Low

Do not use priority colors purely for decoration.

Keep exact color values in the implementation's theme/token file rather than scattering hex values through components.

---

## 5. Typography

Use a modern sans-serif typeface.

Hierarchy:

- Display / Hero
- H1
- H2
- H3
- Body
- Small
- Caption
- Label

Rules:
- Strong contrast between headings and body text.
- Comfortable line height.
- Avoid overly narrow text.
- Do not use more than 2 font families.
- Exam content should prioritize readability over stylistic typography.

---

## 6. Spacing

Use a consistent spacing scale.

Recommended base:

```text
4
8
12
16
20
24
32
40
48
64
80
```

Avoid arbitrary one-off spacing values unless needed for a specific visual composition.

---

## 7. Radius / Shape

Use moderate rounding.

Suggested:
- Small controls: 8px
- Cards: 12–16px
- Larger panels: 16–20px
- Pills/tags: full radius

Avoid making every element extremely rounded.

---

## 8. Elevation

Prefer:
- subtle borders
- soft shadows
- layered surfaces

Avoid:
- heavy shadows
- glowing elements everywhere
- excessive glassmorphism

---

## 9. Core Components

Create a reusable component system.

### Global

- Button
- IconButton
- Input
- SearchInput
- Select
- Tabs
- Badge
- Tag
- Tooltip
- Modal
- Drawer
- Toast
- Dropdown
- Avatar
- Skeleton
- EmptyState
- ErrorState
- Breadcrumbs
- Pagination

### Academic

- BranchCard
- SemesterCard
- SubjectCard
- UnitCard
- TopicRow
- QuestionCard
- PYQCard
- AnswerCard
- NoteCard
- QuizCard
- ProgressCard
- PriorityBadge
- FrequencyIndicator
- ExamCountdown

### Intelligence

- TopicPriorityCard
- PYQFrequencyChart
- RepeatedQuestionCluster
- MarksTrend
- UnitWeightage
- StudyRecommendation
- ExamModePlan

---

## 10. Navigation

### Desktop

Top navigation:

```text
Logo | Explore | PYQs | Study | Premium | Search | Notifications | Profile
```

### Mobile

Use a bottom navigation for the most important actions:

```text
Home | Subjects | PYQs | Study | Profile
```

Secondary actions can live inside a menu/drawer.

---

## 11. Homepage UX

### Hero

```text
SPPU EXAM INTELLIGENCE

Study smarter.
Score better.

SPPU exam preparation powered by
PYQ intelligence, exam-ready notes,
and personalized study plans.

[ Start Preparing ] [ Explore PYQs ]
```

Immediately below:
- PYQ Intelligence
- Exam Mode
- Exam-ready Notes
- Smart Practice

Then:
- popular subjects
- supported patterns
- trust/source message
- premium preview
- final CTA

---

## 12. Onboarding

Ask only what is needed:

1. Branch
2. Year
3. Semester
4. Pattern
5. Subjects
6. Exam dates, when available

Do not force unnecessary profile fields.

After onboarding, generate a personalized dashboard.

---

## 13. Dashboard UX

Example:

```text
Good evening 👋

SE Computer Engineering
Semester 3

DBMS exam
3 days 14 hours

Today's Focus
[ Normalization ]
[ Transactions ]
[ 2025 PYQ ]
[ Quiz ]

Preparation
78%

Weakest area
Transactions

[ Continue studying ]
```

The dashboard should emphasize action over analytics.

---

## 14. Subject Page

Structure:

```text
Subject Header
├── Pattern / semester metadata
├── Progress
├── Exam countdown
└── Primary action

Tabs
├── Overview
├── Notes
├── PYQs
├── Important
├── Repeated
├── Analysis
├── Quiz
└── Exam Mode
```

Overview should summarize:
- number of units
- number of PYQs
- high-priority topics
- preparation score
- recommended next step

---

## 15. Topic Page

A topic page should connect all relevant information.

```text
Normalization

Priority: MUST STUDY
Appeared: 4/5 papers
Typical marks: 5–10
Last asked: 2025

[ Study Notes ]
[ Practice PYQs ]

Definition
Explanation
Diagram
Example
Exam Answer
Related PYQs
Related Questions
```

---

## 16. PYQ Page

Make paper browsing fast.

Filters:
- Pattern
- Branch
- Year
- Semester
- Subject
- Exam session
- Marks

Show:
- official/source metadata
- paper preview
- download/view action where legally permitted
- parsed questions if available

---

## 17. Question Page

Every question should show:

- Question text
- Marks
- Year
- Exam
- Pattern
- Unit
- Topic
- Frequency
- Similar/repeated cluster
- Priority
- Solution/answer
- Report issue

Primary CTA:

> **Practice this question**

---

## 18. PYQ Analysis UX

Example:

```text
DBMS — PYQ Intelligence

Unit 1     ████████
Unit 2     █████
Unit 3     ████████
Unit 4     ████
Unit 5     ███████

Top priorities

1. Normalization     4/5 🔴
2. Transactions      4/5 🔴
3. Deadlock          3/5 🟠
```

Every chart needs a text interpretation.

Never make students decode charts without meaning.

---

## 19. Exam Mode UX

Exam Mode should feel focused.

Header:

```text
🚨 EXAM MODE
DBMS
Exam in 1 day
```

Ask:

```text
How much time do you have?
[ 2 hours ]
[ 5 hours ]
[ 1 day ]
[ 3 days ]
[ 7 days ]
```

Then generate:

```text
Priority 1
Must Study
6 topics — 2h

Priority 2
High Priority
5 topics — 1.5h

Final Revision
15 PYQs + quiz — 1.5h
```

Provide checkboxes and progress.

---

## 20. Premium UX

Premium should communicate value before payment.

Use preview cards:

```text
PREMIUM

Complete DBMS Exam Pack

✓ Full notes
✓ Solved PYQs
✓ Repeated questions
✓ PYQ analysis
✓ Exam Mode
✓ Advanced quizzes

₹49

[ Unlock Subject ]
```

Do not hide the entire product behind a payment wall.

---

## 21. Search UX

Search should support:
- exact question
- topic
- subject
- unit
- note
- PYQ
- natural-language query later

Search result sections:

```text
Topics
Questions
PYQs
Notes
Answers
```

---

## 22. States

Every page should have:

- Loading state
- Empty state
- Error state
- No-results state
- Locked/premium state
- Success state

Never leave blank screens.

---

## 23. Responsive Rules

Breakpoints should be based on layout needs, not device names.

Test:
- small phone
- large phone
- tablet
- laptop
- large desktop

Important:
- tap targets should be comfortable
- tables should scroll or transform
- analysis charts should remain readable
- PDF/notes reader should work on mobile
- bottom navigation should not cover content

---

## 24. Accessibility

Target WCAG-friendly implementation.

Minimum expectations:
- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient contrast
- alt text where needed
- error messages linked to fields
- do not use color as the only signal

---

## 25. Motion

Use motion only when it improves understanding.

Good:
- page transitions
- subtle hover
- progress updates
- drawer transitions
- skeleton loading

Avoid:
- constant floating elements
- bouncing CTAs
- long loading animations

---

## 26. Design Quality Checklist

Before declaring a screen done:

- Is the primary action obvious?
- Can a student understand the screen in 5 seconds?
- Is important information visually prioritized?
- Is the mobile version equally good?
- Are loading/error/empty states handled?
- Is the screen accessible?
- Is the design consistent with the system?
- Is there unnecessary decoration?
- Can the student reach their next action quickly?
