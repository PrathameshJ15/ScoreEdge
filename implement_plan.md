# SPPU Exam Intelligence — Implementation Plan

## 1. Objective

Build the platform incrementally using VS Code + an AI coding CLI.

Primary rule:

> **Build → run → test → review → commit → continue.**

Do not ask the coding agent to implement the entire product in one prompt.

---

# 2. Phase 0 — Repository Setup

### Goal

Create the foundation.

### Tasks

- Initialize Git repository.
- Create Next.js + TypeScript project.
- Configure Tailwind CSS.
- Configure linting and formatting.
- Add environment variable structure.
- Create base folders.
- Add README and project docs.
- Add `.gitignore`.
- Add CI check if useful.

### Definition of done

- App runs locally.
- Build succeeds.
- Lint succeeds.
- First Git commit exists.

---

# 3. Phase 1 — Design System

### Goal

Create reusable visual primitives before building many pages.

### Build

- Theme tokens
- Typography
- Spacing
- Buttons
- Inputs
- Cards
- Tabs
- Badges
- Modals
- Toasts
- Skeletons
- Empty states
- Error states

### Do not

- Create one-off styles for every page.
- Hard-code colors everywhere.
- Build dozens of components before validating the design.

### Done when

Homepage-quality components look consistent on desktop and mobile.

---

# 4. Phase 2 — Landing Page

### Build

- Navbar
- Hero
- Feature sections
- PYQ Intelligence preview
- Exam Mode preview
- Premium preview
- Footer

### Success criteria

A new user understands within 5 seconds:

1. What the platform is.
2. Who it is for.
3. Why it is different.
4. What to click next.

---

# 5. Phase 3 — Academic Structure

### Goal

Create the SPPU navigation hierarchy.

Implement:

```text
Pattern
→ Branch
→ Year
→ Semester
→ Subject
→ Unit
→ Topic
```

### Build

- database schema
- seed data
- API/server functions
- browse pages
- breadcrumbs
- filters

### Start with

SE Computer Engineering + a small set of subjects.

Do not start with every SPPU branch.

---

# 6. Phase 4 — Authentication

### Build

- signup
- login
- logout
- session handling
- password reset
- protected dashboard
- profile basics

### Onboarding

Collect:

- branch
- year
- semester
- pattern
- subjects
- exam dates if available

### Security

All authorization must be server-side.

---

# 7. Phase 5 — PYQ System

### Database

Implement:
- pyq_papers
- questions
- question_occurrences

### UI

- PYQ library
- filters
- paper view
- question view
- metadata
- source
- verification

### Import workflow

Do not directly publish raw imports.

Use:

```text
imported
→ processing
→ needs_review
→ verified
→ published
```

---

# 8. Phase 6 — Notes & Answers

### Build

- Notes reader
- Topic content
- Solved answers
- 2-mark answers
- 5-mark answers
- 10-mark answers
- diagrams
- related PYQs

### Content rule

Premium notes/answers should be original, commissioned, or properly licensed.

---

# 9. Phase 7 — Quiz System

### Build

- quiz creation in admin
- quiz page
- question answering
- timer where appropriate
- score
- explanations
- weak areas
- attempt history

### Database

```text
quizzes
quiz_questions
quiz_attempts
quiz_attempt_answers
```

---

# 10. Phase 8 — Admin Panel

Admin should be usable before advanced analytics.

### Build CRUD for

- Patterns
- Branches
- Semesters
- Subjects
- Units
- Topics
- PYQs
- Questions
- Notes
- Answers
- Quizzes

### Workflow

```text
Create
→ Edit
→ Review
→ Publish
→ Archive
```

---

# 11. Phase 9 — Premium & Entitlements

### Build

- premium resource flags
- product catalog
- orders
- subscriptions/entitlements
- payment integration
- webhook verification
- access middleware

### Test

- successful payment
- failed payment
- duplicate webhook
- expired entitlement
- unauthorized premium access

---

# 12. Phase 10 — PYQ Intelligence

This is the major product milestone.

### Build

- frequency counts
- topic-wise counts
- unit distribution
- recentness
- marks patterns
- priority score

### UI

```text
Topic
Frequency
Typical Marks
Last Asked
Priority
```

### Rule

Do not call a result an "official prediction."

Use evidence-based language.

---

# 13. Phase 11 — Question Clustering

### Pipeline

```text
Question
→ normalize
→ similarity
→ cluster suggestion
→ reviewer approval
→ publish
```

### Start simple

First implement:
- normalized text
- manual cluster assignment
- basic similarity

Then introduce embeddings/LLM assistance.

---

# 14. Phase 12 — Exam Mode

### Inputs

- subject
- exam date
- time available
- student progress
- topic priorities

### Outputs

- study plan
- estimated duration
- priority
- checklist
- revision block
- quiz block

### Must handle

- impossible time constraints
- already-completed topics
- missing exam dates
- incomplete data

---

# 15. Phase 13 — Student Progress

### Track

- topics studied
- notes completed
- PYQs practiced
- quizzes attempted
- quiz performance
- study plan completion

### Dashboard

Show:
- preparation score
- weak topics
- next action
- upcoming exams

Keep analytics actionable.

---

# 16. Phase 14 — AI Assistant

Only start after verified structured data exists.

### V1 AI tasks

- explain a topic
- simplify content
- convert to 5/10-mark answer
- create mini quiz
- create revision plan

### Grounding

Retrieve platform content first for SPPU-specific responses.

### Safety/quality

- never claim certainty about future exam questions
- label generated content appropriately
- allow reporting incorrect AI answers

---

# 17. Phase 15 — Search

### V1

PostgreSQL full-text/filtered search.

### V2

Semantic search.

### V3

Natural language:

> "Show repeated DBMS questions on transactions."

---

# 18. Phase 16 — SEO

Create high-quality landing pages for actual search intent:

- subject + PYQ
- subject + notes
- subject + important questions
- pattern + branch + subject
- semester + subject

Do not mass-generate thin content.

---

# 19. Phase 17 — Performance

Before launch:

- optimize images
- lazy-load heavy components
- paginate long lists
- cache stable academic data
- optimize database queries
- avoid unnecessary client-side fetching
- keep PDF/reader experience responsive

---

# 20. Phase 18 — Security Review

Check:

- authorization
- RLS/policies if used
- private file access
- API validation
- rate limiting
- admin permissions
- payment webhooks
- environment secrets
- XSS/injection
- upload handling

---

# 21. Phase 19 — Testing

### Unit tests

- priority scoring
- entitlement checks
- study-plan logic
- quiz scoring

### Integration tests

- login
- content access
- payment flow
- PYQ retrieval
- admin publishing

### E2E

Critical student journey:

```text
Home
→ Select branch
→ Select subject
→ View PYQ
→ View notes
→ Analyze topic
→ Start quiz
→ See progress
→ Upgrade
```

---

# 22. Phase 20 — Launch

### Launch only when

- core pages work on mobile
- no critical auth issues
- payment flow verified
- content verified
- premium access tested
- error states exist
- analytics installed
- legal pages exist

### Launch scope

One branch.

One pattern.

A limited number of subjects.

Real student feedback.

---

# 23. Development Rule for AI CLI

Every coding prompt should specify:

```text
Context
Goal
Files to inspect
What to change
What not to change
Acceptance criteria
How to test
```

Example:

```text
Context:
We have a Next.js + TypeScript project.

Goal:
Build the Subject page.

Inspect:
Existing routing, design system, academic types.

Change:
Create the Subject page and reusable subject components.

Do not:
Change database schema.

Acceptance:
Responsive desktop/mobile UI, loading/error states, accessible tabs.

Test:
Run lint, typecheck and build.
```

---

# 24. Commit Strategy

Make small commits:

```text
feat: add design tokens
feat: add landing page
feat: add academic hierarchy
feat: add authentication
feat: add PYQ library
feat: add notes reader
feat: add quiz system
feat: add admin publishing
feat: add premium access
feat: add PYQ analytics
```

Avoid giant commits with unrelated changes.

---

# 25. Milestones

### M0
Project foundation

### M1
Premium landing page

### M2
Academic navigation

### M3
Authentication

### M4
PYQ library

### M5
Notes + answers

### M6
Quiz

### M7
Admin

### M8
Premium payments

### M9
PYQ Intelligence

### M10
Exam Mode

### M11
Progress

### M12
AI assistant

### M13
Production hardening

---

# 26. Definition of Done

A feature is done only when:

- UI implemented
- Mobile tested
- Loading state implemented
- Empty state implemented
- Error state implemented
- Accessibility considered
- Server authorization handled
- Database validation exists
- Tests/verification run
- No obvious console errors
- Documentation updated

---

# 27. Recommended Build Order

```text
Design
 ↓
Academic DB
 ↓
Navigation
 ↓
Auth
 ↓
PYQs
 ↓
Notes
 ↓
Quiz
 ↓
Admin
 ↓
Premium
 ↓
PYQ Intelligence
 ↓
Exam Mode
 ↓
Progress
 ↓
AI
```

Do not reverse this order without a strong reason.
