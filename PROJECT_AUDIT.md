# ScoreEdge Project Audit

**Document Version:** 1.0.0  
**Audit Date:** September 5, 2026  
**Auditor:** Antigravity (Google DeepMind Advanced Agentic Coding)  
**Project:** ScoreEdge — SPPU Exam Intelligence Platform  
**Target Audience:** Engineering Team, Product Stakeholders  

---

## 1. Executive Summary

ScoreEdge is envisioned as a modern, student-first SPPU Exam Intelligence platform whose core promise is:
> *"Don't study everything. Study what matters."*

A thorough, rigorous audit of the entire codebase was conducted across every architectural layer, inspecting files, database models, frontend components, authentication mechanics, APIs, design compliance, and security posture.

### Key Audit Findings

1. **Illusion of Completion vs. Reality:**
   In `todo.md` and git commit history (`d486d88`), Phases 5 through 11 (Academic Database, Authentication, Student Dashboard, PYQ System, Notes & Solved Answers, Quiz System, Admin Panel, and Premium Entitlements) are marked as `[x] Done`. **In reality, none of these features possess backend, database, authentication, or payment implementations.** They are frontend UI mockups bound to a single static TypeScript array (`src/data/sppuData.ts`).

2. **Complete Absence of Database and Backend Infrastructure:**
   - **No Database:** 0 PostgreSQL tables, 0 Supabase clients, 0 ORM/query builders, and 0 migrations exist.
   - **No API Layer:** The `src/app/api` directory does not exist. There are 0 API route handlers and 0 Server Actions (`'use server'`).
   - **No Authentication/Authorization:** The login and signup forms simply execute `window.location.href = '/dashboard'`. Route protection is non-existent; `/admin` and `/dashboard` are completely public.
   - **No Payment Processing:** No Razorpay SDK is installed, and no payment endpoints or webhook verifications exist.

3. **Academic Content Bottleneck:**
   - Out of 5 advertised SE Computer Engineering subjects (`DBMS`, `DSA`, `OOP`, `OS`, `TOC`), **only 1 subject (`DBMS`) has partial mock data**.
   - Exactly **2 questions** exist in the entire question bank.
   - Zero real subject notes exist.
   - When navigating to any other subject (e.g., `/subject/dsa`), the application either displays DBMS data or encounters empty states.

4. **UI/UX & Design System Deviations:**
   - The UI contains excessive AI/crypto-SaaS styling prohibited by `design.md`: 120px/3xl background blur glow blobs, multi-stop gradient text clipping, forced dark mode by default (`ThemeToggle.tsx`), and glassmorphism.
   - The global `Navbar` uses broken in-page hash links (`#pyq-intelligence`, `#exam-mode`, `#pricing`) rather than route navigation, causing broken navigation when invoked from sub-pages (e.g. `/subject/dbms` or `/explore`).
   - The required mobile bottom navigation (`Home | Subjects | PYQs | Study | Profile`) from `design.md` Section 10 is missing.

5. **Linting and Testing Debt:**
   - Zero automated tests exist (0 unit, 0 integration, 0 E2E).
   - `npm run lint` fails immediately because `.eslintrc.json` is missing from the repository root.

---

## 2. Technology Stack

| Layer | Configured / Installed | Actual Codebase Implementation | Health Status |
|---|---|---|---|
| **Framework** | Next.js `14.2.24` (App Router) | Functional App Router structure in `src/app` | 🟢 Operational |
| **Language** | TypeScript `5.7.3` | Strict types in `src/lib/types.ts`; `tsc --noEmit` passes | 🟢 Operational |
| **Frontend UI** | React `18.3.1` | Client components (`'use client'`) across all routes | 🟡 Partial (Over-reliance on CSR) |
| **Styling** | Tailwind CSS `3.4.17` | Extended theme tokens in `tailwind.config.js` | 🟡 Partial (Deviations from design.md) |
| **Icons** | Lucide React `0.475.0` | Widely used across components | 🟢 Operational |
| **Animation** | Framer Motion `11.18.2` | Installed in `package.json`, but unused in source code | 🔴 Dead Dependency |
| **Linting** | ESLint `8.57.1`, `eslint-config-next` | Installed, but `.eslintrc.json` is missing | 🔴 Broken (`npm run lint` fails) |
| **Database** | Supabase / PostgreSQL | Mentioned in `.env.example`, but **0 database code exists** | 🔴 Missing |
| **Authentication** | Supabase Auth | None installed (`@supabase/ssr` or `@supabase/supabase-js` missing) | 🔴 Missing |
| **Payments** | Razorpay | Mentioned in `.env.example`, but `razorpay` package is not installed | 🔴 Missing |
| **AI / RAG** | OpenAI / Embeddings | Mentioned in `.env.example`, but no SDK or vector store installed | 🔴 Missing |
| **Testing** | None | 0 test frameworks installed (No Jest, Vitest, or Playwright) | 🔴 Missing |

---

## 3. Project Structure

```text
ScoreEdge/
├── .env.example              # Template environment variables (Supabase, Razorpay, OpenAI)
├── .gitignore                # Git ignore rules
├── architecture.md           # [Source of Truth] High-level architectural specification
├── design.md                 # [Source of Truth] Design system & UI/UX guidelines
├── implement_plan.md         # [Source of Truth] Phased development roadmap
├── skill.md                  # [Source of Truth] AI coding rules & boundaries
├── todo.md                   # Project tracking document (contains phantom completions)
├── README.md                 # Product vision, pillars, and MVP specifications
├── package.json              # Dependencies and build scripts
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js        # Theme token configuration
├── tsconfig.json             # TypeScript compiler configuration
└── src/
    ├── app/                  # Next.js App Router
    │   ├── layout.tsx        # Root HTML layout with static SEO metadata
    │   ├── globals.css       # Tailwind directives & CSS variables
    │   ├── page.tsx          # Landing page (aggregates 8 landing components)
    │   ├── admin/
    │   │   └── page.tsx      # Unprotected Mock Admin Dashboard
    │   ├── dashboard/
    │   │   └── page.tsx      # Unprotected Mock Student Dashboard
    │   ├── explore/
    │   │   └── page.tsx      # Academic Hierarchy Explorer
    │   ├── login/
    │   │   └── page.tsx      # Mock Login Page (no auth handler)
    │   ├── pricing/
    │   │   └── page.tsx      # Pricing Page
    │   │── pyqs/
    │   │   └── page.tsx      # PYQ Library Filter (filters 2 hardcoded DBMS questions)
    │   ├── signup/
    │   │   └── page.tsx      # Mock Signup Page (no auth handler)
    │   └── subject/
    │       └── [id]/
    │           └── page.tsx  # Dynamic Subject Hub (hardcoded to DBMS data regardless of [id])
    ├── components/
    │   ├── landing/          # Landing Page Feature Modules
    │   │   ├── AcademicHierarchyBrowser.tsx
    │   │   ├── ExamModeSimulator.tsx
    │   │   ├── FAQSection.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Hero.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── NotesAndAnswersPreview.tsx
    │   │   ├── PricingSection.tsx
    │   │   ├── PYQIntelligencePreview.tsx
    │   │   └── QuizPreview.tsx
    │   └── ui/               # Design System Primitives
    │       ├── Badge.tsx
    │       ├── Button.tsx
    │       ├── Card.tsx
    │       ├── Input.tsx
    │       ├── PriorityBadge.tsx
    │       ├── Tabs.tsx
    │       └── ThemeToggle.tsx
    ├── data/
    │   └── sppuData.ts       # Static in-memory mock data (DBMS only)
    └── lib/
        ├── types.ts          # Domain TypeScript interfaces
        └── utils.ts          # Utility functions (cn, formatCurrency)
```

### Layer Separation Analysis
1. **Presentation Layer:** Implemented in `src/app` and `src/components`. However, almost all components are marked `'use client'`, forfeiting SSR benefits.
2. **Application / Business Logic Layer:** **MISSING.** Priority calculations, exam mode time-slicing, and cluster grouping are hardcoded static numbers rather than executable algorithms.
3. **Data Access Layer:** **MISSING.** No repositories, ORM models, or data access objects (DAOs). Everything reads directly from the static array in `sppuData.ts`.
4. **Intelligence Layer:** **MISSING.** The question clustering and repetition frequencies are manual strings entered into a TypeScript file.
5. **AI Layer:** **MISSING.** No integration or grounding pipeline.

---

## 4. Feature Status Matrix

| Feature / Subsystem | Classification | Status & Diagnostic Details |
|---|---|---|
| **Framework** | COMPLETE | Next.js 14.2.24 App Router initialized and compiling cleanly. |
| **Frontend** | PARTIAL | UI layouts exist for landing, subject, explorer, dashboard, and admin; all mock-driven. |
| **Backend** | MISSING | `src/app/api` does not exist; no API routes, no Server Actions. |
| **Database** | MISSING | 0 PostgreSQL/Supabase tables, 0 migrations, 0 schemas. |
| **Authentication** | MISSING | Login/signup submit handlers do `window.location.href = '/dashboard'`. |
| **Google OAuth** | MISSING | No OAuth providers, callbacks, or client libraries configured. |
| **Email/Password Auth** | MISSING | No password hashing, user registration, verification, or session store. |
| **Authorization (RBAC)**| MISSING | `/admin` and `/dashboard` have no middleware or server-side checks. |
| **Academic Structure** | PARTIAL | Types defined in `types.ts`; mock data exists only for SE Computer. |
| **Syllabus** | PARTIAL | 6 units described for DBMS only; no syllabus PDFs or learning objectives. |
| **Subjects** | PARTIAL | 5 subjects defined; 4 subjects (`DSA`, `OOP`, `OS`, `TOC`) are empty stubs. |
| **Units** | PARTIAL | 6 DBMS units hardcoded in `sppuData.ts`. Units for other subjects do not exist. |
| **Topics** | MISSING | No dedicated `Topic` interface or entity; topics are just strings in clusters. |
| **PYQs** | PARTIAL | Only 2 sample questions hardcoded; no full paper entities. |
| **Question Banks** | MISSING | No structured multi-year question repository or paper parser. |
| **Answers** | PARTIAL | Only two 5-mark and one 10-mark mock answers for DBMS in `sppuData.ts`. |
| **Notes** | MISSING | `NoteItem` type exists in `types.ts`, but no actual note content exists. |
| **Quizzes** | PARTIAL | 1 interactive sample question in `QuizPreview.tsx`; subject page quiz is a non-functional stub. |
| **Progress Tracking** | MISSING | Checklists in `dashboard` and `exam-mode` use local React state; resets on reload. |
| **Study Plans** | PARTIAL | Static mock presets (2h, 5h, 1d) for DBMS only in `sppuData.ts`. |
| **Admin CMS** | NEEDS REFACTOR | `/admin` is a static UI shell with fake numbers; no CRUD or database writes. |
| **Premium Flags** | PARTIAL | `price` and `isPremiumOnly` fields in types; no server-side enforcement. |
| **Payments** | MISSING | No payment gateway SDK, order generation, or entitlement grant. |
| **Razorpay** | MISSING | Keys in `.env.example` only; no SDK in `package.json`, no webhook listener. |
| **WhatsApp Integration**| MISSING | No WhatsApp Community links, notification engine, or support webhook. |
| **Search Engine** | NEEDS REFACTOR | Client-side `.filter()` across 2 questions in `/pyqs`; no global search or PostgreSQL FTS. |
| **PYQ Intelligence** | PARTIAL | Frequency percentages are hardcoded in static objects; no calculation engine. |
| **Question Repetition** | PARTIAL | 6 static clusters hardcoded in `sppuData.ts`; no similarity detection algorithm. |
| **Exam Mode** | PARTIAL | Interactive preset switcher on landing and subject hub; data is static DBMS only. |
| **AI Integration** | MISSING | No OpenAI client, no prompt engineering, no generative functions. |
| **RAG Pipeline** | MISSING | No vector database, no chunking, no embedding generation or retrieval. |
| **Storage (PDFs/Assets)**| MISSING | No object storage bucket (Supabase Storage/S3), no signed URL generator. |
| **Environment Config** | PARTIAL | `.env.example` exists; no `.env.local` or environment schema validator. |
| **Security** | MISSING | No server-side auth, no input sanitization (Zod), no rate limiting, no RLS. |
| **Performance** | PARTIAL | Next.js compiler is fast, but excessive `'use client'` disables SSR optimization. |
| **Testing** | MISSING | 0 tests. Neither Jest, Vitest, nor Playwright is installed. |
| **SEO** | PARTIAL | Root `layout.tsx` has basic metadata; no dynamic tags, sitemap, or robots.txt. |
| **Deployment** | PARTIAL | Builds with `next build`, but lacks production database and deployment scripts. |

---

## 5. Database Audit

### Documented Architecture vs. Reality
In `architecture.md` Section 7, the project specifies 22 relational entities:
- **Core Academic:** `branches`, `patterns`, `academic_years`, `semesters`, `subjects`, `units`, `topics`
- **PYQ & Intelligence:** `pyq_papers`, `questions`, `question_occurrences`, `question_clusters`
- **Content:** `notes`, `answers`, `resources`
- **Practice:** `quizzes`, `quiz_questions`, `quiz_attempts`
- **Personalization:** `study_plans`, `study_plan_items`, `progress`, `bookmarks`
- **Monetization & Ops:** `users`, `profiles`, `subscriptions`, `payments`, `reports`, `audit_logs`

**Current State:**
- **Zero Database Tables:** There are no SQL schema files, Prisma schemas, Drizzle schemas, or Supabase migration scripts.
- **Data Persistence:** None. The entire application runs off memory in `src/data/sppuData.ts`.
- **Missing Relationships:**
  - `Topic` is missing as a first-class citizen; questions and clusters map directly to string names instead of a normalized topic table.
  - `PYQPaper` entity is completely missing from `sppuData.ts`. Questions contain raw strings for `examYear` and `examSession` rather than foreign keys to verified examination paper records.
  - Verification lifecycle (`draft`, `processing`, `needs_review`, `verified`, `published`, `archived`) outlined in `architecture.md` Section 20 has no database column or state machine.

**Severity:** **P0** (Blocker)

---

## 6. API Audit

### API & Server Architecture
- **API Directory:** `src/app/api/` does not exist in the repository.
- **Server Actions:** Searched for `'use server'` and `"use server"`. **0 results.**
- **Data Ingestion/Retrieval:** Every page imports data directly using client-side ES6 imports:
  ```typescript
  import { MVP_SUBJECTS, DBMS_UNITS, DBMS_QUESTION_CLUSTERS } from '@/data/sppuData';
  ```
- **Critical Missing Endpoints:**
  1. `GET /api/academic/hierarchy` (Patterns -> Branches -> Years -> Semesters)
  2. `GET /api/subjects/:id` (Dynamic subject data loader)
  3. `GET /api/pyqs` (Filtered question bank retrieval with pagination)
  4. `GET /api/intelligence/:subjectId` (Calculated topic priorities and clusters)
  5. `POST /api/exam-mode/generate` (Dynamic exam plan generation based on available hours)
  6. `POST /api/quizzes/:id/submit` (Quiz scoring and weak-area recording)
  7. `POST /api/payments/create-order` (Razorpay order initialization)
  8. `POST /api/payments/webhook` (HMAC-verified payment fulfillment)
  9. `GET /api/user/progress` and `POST /api/user/progress/toggle` (Persistent user study checklist)
  10. `POST /api/admin/content/publish` (Verification pipeline)

**Severity:** **P0** (Blocker)

---

## 7. Authentication & Authorization Audit

### Inspection of Auth Implementation
- **Login Page (`src/app/login/page.tsx`, Lines 16–20):**
  ```typescript
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };
  ```
  *Analysis:* Form fields (`email`, `password`) are captured in local state and immediately discarded. The user is redirected via `window.location.href`.
- **Signup Page (`src/app/signup/page.tsx`, Lines 18–21):**
  ```typescript
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };
  ```
  *Analysis:* No user account is created; no validation or backend persistence occurs.
- **Session Handling:** Zero cookies, zero JWT tokens, zero local storage tokens, and zero authentication context providers exist.
- **OAuth:** Google OAuth is completely absent (no button, no provider configuration).
- **Route Protection & Authorization:**
  - `/dashboard` contains no authentication barrier. Any unauthenticated web visitor can view mock user preparation data.
  - `/admin` contains no role check. Any web visitor can navigate to `/admin` and view mock financial and subscriber metrics.
  - No Next.js middleware (`middleware.ts`) exists in the repository.

**Severity:** **P0** (Blocker)

---

## 8. Academic Content Audit

### Syllabus & Subject Coverage
- **Pattern Support:** `Pattern` type defined in `lib/types.ts`. Explorer UI displays `2024 Pattern` and `2019 Pattern`. However, data exists only for `2024-pattern`.
- **Branch Support:** 4 branches defined (`COMP`, `IT`, `AI-DS`, `E&TC`). Only Computer Engineering has subjects.
- **Subjects Breakdown:**
  1. `DBMS` (Database Management Systems - 210241): Has 6 units, 6 question clusters, 2 sample PYQs, 3 exam presets.
  2. `DSA` (Data Structures & Algorithms - 210242): 0 units, 0 clusters, 0 PYQs, 0 notes.
  3. `OOP` (Object Oriented Programming - 210243): 0 units, 0 clusters, 0 PYQs, 0 notes.
  4. `OS` (Operating Systems - 210244): 0 units, 0 clusters, 0 PYQs, 0 notes.
  5. `TOC` (Theory of Computation - 210245): 0 units, 0 clusters, 0 PYQs, 0 notes.
- **Subject Dynamic Route (`src/app/subject/[id]/page.tsx`):**
  Lines 36–40:
  ```typescript
  const params = useParams();
  const subjectId = (params?.id as string) || 'dbms';
  const subject = MVP_SUBJECTS.find((s) => s.id === subjectId) || MVP_SUBJECTS[0];
  ```
  *Flaw:* Even if the user visits `/subject/dsa` or `/subject/os`, the page displays the subject header for DSA or OS, but all unit cards, question clusters, solved answers, and exam presets below it are hardcoded imports from `DBMS_UNITS`, `DBMS_QUESTION_CLUSTERS`, and `DBMS_SAMPLE_PYQS`.
- **Notes System:** `NoteItem` interface is defined in `lib/types.ts` (Lines 82–91), but not a single note record exists in `sppuData.ts`, and there is no notes reader UI.
- **Solved Answers:** Exactly two questions have answers:
  - 3NF vs BCNF (5-mark and 10-mark)
  - ACID Properties (5-mark)

**Severity:** **P1** (High)

---

## 9. PYQ & Question Intelligence Audit

### PYQ Data Model vs. Implementation
In `architecture.md` Section 6 & 10:
- A PYQ paper must be distinct from individual questions.
- A question must record `question_number`, `marks`, `topic_id`, `normalized_text`, `cluster_id`, and `verification_status`.

**Current Implementation (`src/data/sppuData.ts`):**
- **PYQ Count:** Exactly **2 questions** in the entire system (`pyq-dbms-2025-q3a` and `pyq-dbms-2024-q4b`).
- **Cluster Count:** Exactly **6 clusters** in `DBMS_QUESTION_CLUSTERS`.
- **Intelligence Engine:**
  - The priority labels (`MUST_STUDY`, `HIGH`, `MEDIUM`) are hardcoded string attributes.
  - The frequency (`appeared in 4 of 5 papers`) is a hardcoded integer.
  - There is no calculation logic computing frequency across papers, trend shifts, or marks weightage.
- **Question Clustering Engine:**
  - In `architecture.md` Section 11, question clustering requires text normalization, similarity detection, and human verification.
  - In code, cluster variations are static hardcoded strings in `PYQIntelligencePreview.tsx` (Lines 167–186).
- **Exam Mode Engine:**
  - Exam Mode does not dynamically select topics. It renders 3 static arrays (`2h`, `5h`, `1d`) defined in `DBMS_EXAM_PRESETS`.

**Severity:** **P1** (High)

---

## 10. Premium & Payment Audit

### Monetization & Entitlement Inspection
- **Pricing Catalog:**
  - Free Explorer: ₹0
  - Single Subject Exam Pack: ₹49
  - Semester Pass: ₹199
- **Client-Side Hiding vs. Server Entitlements:**
  - `architecture.md` Section 14 explicitly warns: *"Never rely only on hiding UI buttons. The server must enforce access."*
  - Currently, there is **zero server entitlement enforcement**.
  - In `dashboard/page.tsx` (Line 201), the banner `<Badge>SEMESTER PASS ACTIVE</Badge>` is hardcoded in the JSX for every visitor.
- **Payment Gateway:**
  - Razorpay credentials exist as placeholders in `.env.example`.
  - The `razorpay` NPM package is not installed.
  - Clicking "Unlock DBMS Pack (₹49)" in `PricingSection.tsx` executes no action or handler.
  - No webhook handler exists to receive Razorpay events (`order.paid`, `payment.captured`), verify signatures (`RAZORPAY_WEBHOOK_SECRET`), or write to a `subscriptions` table.

**Severity:** **P0** (Blocker)

---

## 11. AI & RAG Readiness Audit

### Architectural Prerequisites vs. Codebase State
In `architecture.md` Section 1:
> *"Content first → structured data → intelligence → personalization → AI. Do not build the AI layer before the academic/question data model is reliable."*

**Readiness Assessment:**
- **OpenAI Integration:** Not installed. No API wrapper or prompt templates exist.
- **Grounding Infrastructure:** SPPU-specific questions require grounding against verified syllabus, notes, and PYQs. Because the platform currently has 0 database tables and only 2 verified questions, **any AI integration built today would hallucinate SPPU curriculum details.**
- **RAG / Vector Database:** No vector extension (`pgvector`) or embedding pipeline is designed or scaffolded.
- **Verdict:** Postponing AI until structured academic data is reliably stored in PostgreSQL was the correct architectural instruction, but no grounding pipeline foundation has been laid.

**Severity:** **P2** (Medium)

---

## 12. UI/UX Audit & Design System Compliance

### Analysis Against `design.md`

| Design Guideline (`design.md`) | Codebase Finding | Violation Severity | Specific File & Line Reference |
|---|---|---|---|
| **No excessive gradients** (Sec 3, 4) | Hero headline uses 3-color clipped gradient text; cards use multi-stop gradients; buttons use 3-color gradient. | 🟡 Medium | `src/components/landing/Hero.tsx:30`<br>`src/components/ui/Button.tsx:20` |
| **Avoid glow elements everywhere** (Sec 8) | Exam Mode simulator has a 600px circular blur glow (`blur-[120px]`); Hero has a 256px blur glow (`blur-3xl`). | 🟡 Medium | `src/components/landing/ExamModeSimulator.tsx:30`<br>`src/components/landing/Hero.tsx:135` |
| **Avoid glassmorphism** (Sec 8) | Navbar uses heavy `backdrop-blur-md` with translucent background. | 🟢 Low | `src/components/landing/Navbar.tsx:14` |
| **Color System & Palette** (Sec 4) | Palette relies heavily on purple/indigo (`brand-600: #4f46e5`, `brand-950: #1e1b4b`), giving a generic crypto/AI vibe rather than an academic focus. | 🟡 Medium | `tailwind.config.js:12-24` |
| **Mobile Bottom Navigation** (Sec 10) | `design.md` mandates: *"Mobile: Use a bottom navigation for the most important actions: Home \| Subjects \| PYQs \| Study \| Profile"*. **It is completely missing.** Mobile only has a standard hamburger dropdown. | 🔴 High | `src/components/landing/Navbar.tsx:102-145` |
| **Broken Navigation Links** | Navbar links use anchor hashes (`href="#pyq-intelligence"`). On sub-routes (e.g. `/subject/dbms`, `/explore`), clicking them does nothing or appends `#` to the sub-route. The "Log In" button links to `#pricing`! | 🔴 High | `src/components/landing/Navbar.tsx:55-80` |
| **Component Consistency** (Sec 9) | Checkboxes in Exam Mode simulator use Lucide `CheckSquare`/`Square` buttons; subject page uses native `<input type="checkbox">`; dashboard uses custom div toggles. | 🟡 Medium | `src/components/landing/ExamModeSimulator.tsx:117`<br>`src/app/subject/[id]/page.tsx:298` |
| **Academic Readability** (Sec 5) | Solved answers and schema hints are wrapped in small monospace font (`font-mono text-xs text-slate-700`) rather than high-readability academic serif/sans body typography. | 🟡 Medium | `src/components/landing/NotesAndAnswersPreview.tsx:93`<br>`src/app/subject/[id]/page.tsx:254` |
| **Forced Dark Mode Default** | `ThemeToggle.tsx` forces dark mode by default upon first visit (`document.documentElement.classList.add('dark')`), violating standard academic reading ergonomics. | 🟡 Medium | `src/components/ui/ThemeToggle.tsx:23-25` |
| **Non-Functional Actions** | Cards in `AcademicHierarchyBrowser` are marked `hoverable` with `cursor-pointer`, but have no `Link` or `onClick` handler. Clicking a subject card does nothing. "Launch 15-Question Quiz" on Subject Page has no action. | 🔴 High | `src/components/landing/AcademicHierarchyBrowser.tsx:103`<br>`src/app/subject/[id]/page.tsx:323` |

### Depth & 3D Audit
- **Inappropriate 3D / Pseudo-3D to Remove:**
  1. Remove `blur-[120px]` and `blur-3xl` colored ambient glow circles in `ExamModeSimulator.tsx` and `Hero.tsx`.
  2. Remove 3-color linear gradient backgrounds from buttons (`from-amber-500 via-orange-500 to-red-500`).
  3. Remove clipped gradient text in Hero headline (`from-brand-600 via-indigo-500 to-purple-600`).
- **Areas Where Subtle Depth Should Be Increased:**
  1. Solved answer containers (2-mark, 5-mark, 10-mark) need crisp visual differentiation: distinct 1px slate-200/800 borders and structured header callouts rather than soft colored tints.
  2. The high-yield question cluster cards need clear elevation stepping so primary clusters visually distinguish from sub-variations.

---

## 13. Design Compliance Scorecard

| Category | Target (`design.md`) | Current Status | Score |
|---|---|---|---|
| **Clarity over decoration** | Minimalist, clean, academic | Background blur glows, gradient text clipping | 6 / 10 |
| **Information hierarchy** | Clear visual hierarchy, strong contrast | Cluttered landing page with 8 preview sections | 7 / 10 |
| **Mobile-first** | Responsive, bottom navigation on mobile | Missing bottom navigation, broken drawer links | 5 / 10 |
| **Component consistency** | Reusable design primitives | Inconsistent checkboxes, badges, and button styles | 6 / 10 |
| **Academic readability** | Comfortable line-height, clear body typography | Overuse of `text-xs`, `font-mono` on exam answers | 6 / 10 |
| **Overall Design Compliance** | **Grade: C+** | Requires cleanup of AI styling and mobile navigation | **60%** |

---

## 14. Security Audit

| Security Domain | Vulnerability / Deficiency | Severity |
|---|---|---|
| **Authentication** | Passwords are never hashed, validated, or verified. Form submits unconditionally redirect to dashboard. | **P0** |
| **Authorization** | No RBAC. `/admin` and `/dashboard` can be accessed by any unauthenticated web user. | **P0** |
| **Entitlement Bypass** | No server validation for premium content. Anyone can inspect or query mock data directly. | **P0** |
| **Input Validation** | No Zod schemas or request body parsers exist. | **P1** |
| **Secrets Exposure** | `.env.example` lists `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. If service role key is ever exposed with `NEXT_PUBLIC_`, Supabase RLS is bypassed. | **P1** |
| **Storage Security** | No private object storage buckets or signed URL generators implemented for PDF distribution. | **P1** |
| **Payment Verification**| No server-side Razorpay webhook HMAC-SHA256 signature verification. | **P0** |
| **Rate Limiting** | No Upstash/Redis or Next.js middleware rate limiting for auth or search endpoints. | **P2** |

---

## 15. Performance Audit

1. **Overuse of `'use client'` Directives:**
   - Every single page in `src/app/` (`page.tsx`, `explore/page.tsx`, `subject/[id]/page.tsx`, `dashboard/page.tsx`, `pyqs/page.tsx`, `admin/page.tsx`, `login/page.tsx`, `signup/page.tsx`) contains `'use client'`.
   - *Impact:* Bypasses Next.js 14 Server Component streaming and server rendering benefits. Entire component tree is bundled and hydrated on the client.
2. **Unused Dependencies:**
   - `framer-motion` (`^11.18.2`) is installed (~35kB gzipped) but virtually unused across the codebase.
3. **Image Optimization:**
   - No `next/image` is utilized; diagrams and schemas are represented as text descriptions.
4. **Data Delivery:**
   - The entire `sppuData.ts` file is bundled into the client JavaScript bundle for every route that imports it.

**Severity:** **P2** (Medium)

---

## 16. Testing Audit

| Test Category | Target (`implement_plan.md` Phase 19) | Current Implementation | Coverage |
|---|---|---|---|
| **Unit Tests** | Priority score, quiz scoring, entitlement checks, study plan logic | 0 test files | 0% |
| **Integration Tests** | Login, PYQ retrieval, payment flow, admin publishing | 0 test files | 0% |
| **E2E Tests** | Browse subject -> View PYQ -> Read notes -> Take quiz -> Upgrade | 0 test files | 0% |
| **Linting** | `npm run lint` | Fails immediately (missing `.eslintrc.json`) | 0% |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | Passes with 0 errors | 100% |

**Severity:** **P1** (High)

---

## 17. SEO & Deployment Audit

1. **Metadata & Open Graph:**
   - Root `layout.tsx` contains static metadata (`title`, `description`, `keywords`).
   - Dynamic subject pages (`/subject/[id]`) do **not** export `generateMetadata()`. Search engines cannot index specific SPPU subjects (e.g. "SPPU DBMS 2024 Pattern Notes").
2. **Indexing Directives:**
   - No `sitemap.ts` or `sitemap.xml` exists.
   - No `robots.ts` or `robots.txt` exists.
   - No canonical URL tags are defined.
3. **Legal Compliance:**
   - `design.md` and `implement_plan.md` require legal and disclaimer pages before public launch.
   - Links in `Footer.tsx` for "Privacy Policy", "Terms of Service", and "Copyright Policy" are dead spans with no destination.
4. **Deployment Health:**
   - The app can be deployed to Vercel and built statically, but will function only as a read-only prototype.

**Severity:** **P2** (Medium)

---

## 18. Technical Debt Summary

1. **Phantom Completion in Documentation:** `todo.md` has marked Phases 5–11 as completed. This misleads contributors and coding assistants into believing backend and database foundations exist when they do not.
2. **DBMS Coupling:** The entire UI is tightly coupled to DBMS. `AcademicHierarchyBrowser`, `subject/[id]`, and `pyqs` all default or hardcode DBMS data.
3. **Mock Data Monolith:** `src/data/sppuData.ts` holds all branches, subjects, units, question clusters, PYQs, and presets in a single file.
4. **Broken Global Navigation:** Anchor hashes (`#pyq-intelligence`, `#exam-mode`) in `Navbar.tsx` break when navigating across routes.
5. **Dead Package Overhead:** `framer-motion` installed without active animations.
6. **Missing ESLint Config:** `next lint` prompts for setup on every run.

---

## 19. Critical Problems (Prioritized by Severity)

### Priority 0 (P0) — Absolute Blockers (Must Fix First)
1. **No Database & Persistence Layer:** There is no database or Supabase connection. User data, questions, notes, and study plans cannot be saved.
2. **No Authentication & Route Security:** Auth forms perform client-side redirects (`window.location.href`). Anyone can access `/admin` and `/dashboard`.
3. **No Payment & Entitlement Processing:** Razorpay is not installed or integrated; server-side entitlement checks do not exist.
4. **No API or Server Action Layer:** Zero backend endpoints exist to serve dynamic data or process requests.

### Priority 1 (P1) — High Severity (Core Value & Integrity)
1. **Empty Academic Subjects:** 4 of 5 MVP subjects (`DSA`, `OOP`, `OS`, `TOC`) have 0 units and 0 questions; `/subject/[id]` renders DBMS data for all subject IDs.
2. **Trivial Question Bank Size:** Exactly 2 questions exist in the entire codebase.
3. **Missing Notes System:** Zero study notes exist despite being a core product pillar.
4. **Missing Test & Lint Infrastructure:** `next lint` fails due to missing `.eslintrc.json`; 0 automated test coverage.

### Priority 2 (P2) — Medium Severity (UX, Design & SEO)
1. **UI Deviations from `design.md`:** Background blur glow circles, gradient text clipping, and forced dark mode must be removed.
2. **Missing Mobile Bottom Navigation:** Mobile users lack the bottom navigation bar specified in `design.md`.
3. **Broken Global Navigation:** Navbar anchor links (`#...`) fail on sub-routes; Login button links to `#pricing`.
4. **Overuse of `'use client'`:** Pages are client-rendered, impairing SEO and initial paint times.
5. **Missing Dynamic Metadata & Sitemap:** No subject-level Open Graph or sitemap generator.

### Priority 3 (P3) — Low Severity (Polish & Cleanup)
1. **Unused Dependencies:** Remove `framer-motion` or implement intentional subtle animations.
2. **Dead Footer Links:** Add real static pages for Privacy Policy, Terms, and Copyright Notice.
3. **Component Inconsistencies:** Standardize checkbox controls and badge styles.

---

## 20. Recommended Implementation Order

Following `implement_plan.md` Section 27 and `skill.md` rules:

```text
Phase 0 & 1: Foundation & Lint Fix
  ↓
Phase 3: Database & Academic Schema (PostgreSQL / Supabase + Seed SE Computer)
  ↓
Phase 4: Authentication & Route Middleware (Supabase Auth / SSR)
  ↓
Phase 5: Real PYQ & Question Data Pipeline
  ↓
Phase 6: Notes & Solved Answers Repository
  ↓
Phase 7: Quiz Engine & Scoring
  ↓
Phase 8: Admin Panel CRUD & Verification Pipeline
  ↓
Phase 9: Premium Entitlements & Razorpay Webhooks
  ↓
Phase 10 & 11: PYQ Intelligence & Clustering Engines
  ↓
Phase 12 & 13: Exam Mode & User Progress Tracking
  ↓
Phase 14 & 15: AI Grounding & Production Hardening
```

### Detailed Execution Steps:
1. **Step 1 (Fix Base Tooling):** Create `.eslintrc.json` so `npm run lint` passes; clean up broken navbar links and remove AI glow styling.
2. **Step 2 (Database Layer):** Install `@supabase/supabase-js` (or configure PostgreSQL/Prisma); write SQL migrations for the 22 tables defined in `architecture.md`; seed real SE Computer data for all 5 subjects (`DBMS`, `DSA`, `OOP`, `OS`, `TOC`).
3. **Step 3 (Authentication & Authorization):** Implement Supabase Auth (or NextAuth); configure login, signup, session cookies, and Next.js middleware protecting `/admin` and `/dashboard`.
4. **Step 4 (Data Access APIs):** Build Server Components and API route handlers for dynamic subject fetching (`/subject/[id]`), eliminating hardcoded DBMS coupling.
5. **Step 5 (PYQ & Notes Content):** Populate at least 15–20 real PYQs per subject and actual exam-ready notes.
6. **Step 6 (Payment Integration):** Install `razorpay`, create order creation endpoint, and build webhook verification to grant user entitlements.
7. **Step 7 (Mobile Bottom Navigation & Design Alignment):** Implement the `design.md` bottom navigation bar and academic typography.

---

## 21. Phase Readiness

| Phase (from `implement_plan.md`) | Description | Documented Status (`todo.md`) | Actual Audited Status | Ready for Next Phase? |
|---|---|---|---|---|
| **Phase 0** | Repository Setup | `[x] Done` | **PARTIAL** (ESLint broken, `.env` placeholder only) | ❌ Needs Lint Fix |
| **Phase 1** | Design System | `[x] Done` | **PARTIAL** (Has tokens, but violates design.md AI glow rules) | ❌ Needs Cleanup |
| **Phase 2** | Landing Page | `[x] Done` | **COMPLETE** (Polished, but uses broken hash links) | ⚠️ Needs Link Fix |
| **Phase 3** | Academic Structure | `[x] Done` | **PARTIAL** (Only mock data for DBMS; no DB) | ❌ Blocked by DB |
| **Phase 4** | Authentication | `[x] Done` | **MISSING** (Dummy redirects, no sessions) | ❌ Blocked by Auth |
| **Phase 5** | PYQ System | `[x] Done` | **PARTIAL** (Only 2 questions, mock data) | ❌ Blocked by DB |
| **Phase 6** | Notes & Answers | `[x] Done` | **MISSING** (No notes exist in codebase) | ❌ Blocked by DB |
| **Phase 7** | Quiz System | `[x] Done` | **PARTIAL** (1 mock preview question only) | ❌ Blocked by DB |
| **Phase 8** | Admin Panel | `[x] Done` | **NEEDS REFACTOR** (Mock UI only, completely public) | ❌ Blocked by Auth/DB |
| **Phase 9** | Premium & Entitlements | `[x] Done` | **MISSING** (No Razorpay, no entitlements) | ❌ Blocked by Payments |
| **Phase 10** | PYQ Intelligence | `[ ] Not started` | **PARTIAL** (Mock stats in TS; no engine) | ❌ Blocked by DB |
| **Phase 11** | Question Clustering | `[ ] Not started` | **PARTIAL** (Static array; no algorithm) | ❌ Blocked by DB |
| **Phase 12** | Exam Mode | `[ ] Not started` | **PARTIAL** (Mock presets in TS) | ❌ Blocked by DB |
| **Phase 13** | Student Progress | `[ ] Not started` | **MISSING** (Client useState only) | ❌ Blocked by DB |
| **Phase 14** | AI Assistant | `[ ] Not started` | **MISSING** | ⏳ Blocked by Data Layer |
| **Phase 15** | Search | `[ ] Not started` | **NEEDS REFACTOR** (Client-side filter on 2 questions) | ❌ Blocked by DB |
| **Phase 16** | SEO | `[ ] Not started` | **PARTIAL** (Basic root metadata only) | ⚠️ Post-Content |
| **Phase 17** | Performance | `[ ] Not started` | **PARTIAL** (Fast dev build, but all CSR) | ⚠️ Post-Content |
| **Phase 18** | Security Review | `[ ] Not started` | **MISSING** | ❌ Blocked by Auth/DB |
| **Phase 19** | Testing | `[ ] Not started` | **MISSING** (0 tests, 0% coverage) | ❌ Must Start Now |
| **Phase 20** | Launch | `[ ] Not started` | **MISSING** | ❌ Not Ready |

---

*End of ScoreEdge Project Audit. No implementation modifications have been made during this audit turn.*
