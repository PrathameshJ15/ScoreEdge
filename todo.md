# SPPU Exam Intelligence — TODO

Legend:

- [ ] Not started
- [~] In progress
- [x] Done
- [!] Blocked / needs decision

---


# 0. Product Decisions

- [ ] Finalize product/brand name
- [ ] Finalize tagline
- [ ] Confirm MVP audience: SE Computer Engineering
- [ ] Confirm first pattern to support
- [ ] Finalize initial subjects
- [ ] Define free vs premium boundaries
- [ ] Decide first pricing experiment
- [ ] Define launch success metrics

---

# 1. R&D

## User Research

- [ ] Collect real student problems
- [ ] Interview / survey SPPU students
- [ ] Identify top exam-preparation pain points
- [ ] Validate willingness to pay

## Competitor Research

- [ ] Analyze SPPU Engineers
- [ ] Analyze FixPass
- [ ] Analyze PaperMint
- [ ] Analyze other PYQ/notes platforms
- [ ] Record features
- [ ] Record pricing
- [ ] Record strengths
- [ ] Record weaknesses
- [ ] Record UI/UX patterns
- [ ] Identify gaps

## Data Research

- [ ] Identify official SPPU syllabus sources
- [ ] Identify official PYQ sources
- [ ] Identify college/reference sources
- [ ] Define source metadata
- [ ] Define verification process
- [ ] Define copyright/licensing policy

---

# 2. Repository

- [x] Initialize Git
- [x] Create Next.js project
- [x] Configure TypeScript
- [x] Configure Tailwind
- [x] Configure linting
- [x] Configure formatting
- [x] Add environment variable template
- [x] Add README
- [x] Add project docs

---

# 3. Design System & UI/UX Redesign

- [x] Premium Academic SaaS design tokens (`tailwind.config.js`, `globals.css`)
- [x] Removed AI glow blobs, clipped multi-stop gradients, and crypto purple
- [x] Implemented subtle physical 3D depth system (`shadow-depth-1` through `shadow-depth-4`, layered card stacks, tactile hover elevation)
- [x] Built/Refined Button with active press state and academic variants (no rainbow gradients)
- [x] Built Card with depth variants (`default`, `elevated`, `layered`, `flat`) and tactile hover lift
- [x] Built PriorityBadge with semantic contrast (`MUST STUDY`, `HIGH`, `MEDIUM`, `LOW`)
- [x] Built Badge with crisp semantic academic borders
- [x] Built EmptyState, ErrorState, and Skeleton loading primitives
- [x] Fixed ThemeToggle to respect user system preference and default to academic light mode

---

# 4. Global Navigation & Screens Redesign

- [x] Redesigned Navbar with real route navigation, branch selector, and no broken hash anchors
- [x] Built Mobile Bottom Navigation (`Home | Subjects | PYQs | Study | Account`) per `design.md` Section 10
- [x] Redesigned Homepage Hero with layered 3D card preview, academic copy, and trust metrics
- [x] Redesigned PYQ Intelligence Preview with concept recurrence percentages and clustering details
- [x] Redesigned Emergency Exam Mode Simulator with interactive time presets (2h, 5h, 1d) and checklists
- [x] Redesigned 2/5/10-Mark Solved Answers Preview with high academic readability and evaluator key points
- [x] Redesigned Curriculum Hierarchy Browser with clickable subject cards and semester filtering
- [x] Redesigned Interactive Practice Quiz with instant feedback and step-by-step academic explanations
- [x] Redesigned Pricing Section with layered depth, Single Subject Pack (₹49), and Semester Pass (₹199)
- [x] Redesigned Student Dashboard as personal exam command center with countdown and analytics
- [x] Redesigned Dynamic Subject Hub (`/subject/[id]`) with dynamic data lookup, units, clusters, and model answers
- [x] Redesigned PYQ Library (`/pyqs`) with search, filter by year/subject, and empty state
- [x] Redesigned Admin CMS (`/admin`) with metrics cards and human verification pipeline
- [x] Redesigned Login (`/login`) & Signup (`/signup`) with academic branding and depth elevation
- [x] Redesigned FAQ and Footer with real platform and subject links

---

# 5. Academic Database & REST API Foundation

- [x] Normalized 28-entity PostgreSQL schema (`src/db/schema.sql`) with foreign keys, cascade rules, update triggers, indexes, and Row Level Security (RLS)
- [x] TypeScript domain entity types & enums (`src/lib/db/types.ts`)
- [x] Production SQL seed (`src/db/seed.sql`) & in-memory database store (`src/lib/db/seedData.ts`, `src/lib/db/client.ts`)
- [x] Standardized API response envelopes (`src/lib/api/response.ts`) with safe `{ data, meta }` and `{ error }` structures
- [x] Secure authentication utility (`src/lib/api/auth.ts`) with scrypt password hashing, session tokens, and role-based guards
- [x] Request payload and query validation with Zod (`src/lib/api/validators.ts`)
- [x] Complete REST API routes (Auth, Academic Hierarchy, Questions, PYQs, Answers, Notes, Quizzes, Progress, Study Plans, Products, Orders, Entitlements, Admin, AI Guard)
- [x] Architecture & database documentation (`DATABASE.md`, `API.md`, `DATA_MODEL.md`, `PROJECT_AUDIT.md`)
- [x] Automated test suite with 18 passing tests across DB store and REST API endpoints (`tests/database.test.ts`, `tests/api.test.ts`)
- [x] Patterns table & selection
- [x] Branches navigation
- [x] Academic years & semesters
- [x] Subjects explorer (/explore)
- [x] Subject Hub (/subject/[id]) with Overview, Intelligence, Solved Answers, Exam Mode & Quiz tabs
- [x] Seed SE Computer data (DBMS, DSA, OOP, OS, TOC)

---

# 6. Authentication & Student Dashboard

- [x] Signup page (/signup)
- [x] Login page (/login)
- [x] Protected Student Dashboard (/dashboard)
- [x] Branch/year/semester preferences & exam countdown
- [x] Daily task checklist

---

# 7. PYQ System

- [x] PYQ library (/pyqs)
- [x] Question occurrence & metadata filters
- [x] Verified answer indicators

---

# 8. Notes & Solved Answers System

- [x] Solved answer reader (2-mark, 5-mark, 10-mark)
- [x] Diagram & schema hint boxes
- [x] Key bullet points for SPPU evaluators

---

# 9. Quiz System

- [x] Topic quiz runner
- [x] Interactive answer submission & instant feedback
- [x] Weak area detection

---

# 10. Admin Panel

- [x] Admin dashboard (/admin)
- [x] Subject CRUD overview
- [x] Verification pipeline queue
- [x] Revenue & subscriber analytics

---

# 11. Premium & Entitlements

- [x] Pricing page (/pricing)
- [x] Product catalog (Free, ₹49 Subject, ₹199 Semester)
- [x] Premium entitlement flags

---

# 12. PYQ Intelligence

- [ ] Frequency calculation
- [ ] Topic-wise frequency
- [ ] Unit-wise distribution
- [ ] Marks trend
- [ ] Recentness
- [ ] Priority score
- [ ] Priority labels
- [ ] Topic intelligence UI
- [ ] Analysis dashboard

---

# 13. Question Clustering

- [ ] Normalized question field
- [ ] Manual clustering support
- [ ] Similarity prototype
- [ ] Cluster table
- [ ] AI-assisted cluster suggestions
- [ ] Human review workflow
- [ ] Cluster UI
- [ ] Repeated-question count

---

# 14. Exam Mode

- [ ] Exam countdown
- [ ] Available-time input
- [ ] 2-hour plan
- [ ] 5-hour plan
- [ ] 1-day plan
- [ ] 3-day plan
- [ ] 7-day plan
- [ ] Priority-based ordering
- [ ] Progress checklist
- [ ] Final revision block
- [ ] Mock-test block

---

# 15. Progress

- [ ] Topic completion
- [ ] Notes completion
- [ ] PYQ practice
- [ ] Quiz scores
- [ ] Weak topics
- [ ] Preparation score
- [ ] Dashboard
- [ ] Study streak, only if useful

---

# 16. AI Assistant

- [ ] Grounded retrieval layer
- [ ] Explain topic
- [ ] Simple explanation
- [ ] Hinglish explanation
- [ ] 2/5/10-mark answer helper
- [ ] Quiz generation
- [ ] Study plan generation
- [ ] Revision helper
- [ ] Report incorrect answer

---

# 17. Search

- [ ] Keyword search
- [ ] Topic filters
- [ ] Subject filters
- [ ] PYQ search
- [ ] Notes search
- [ ] Answer search
- [ ] Natural-language search
- [ ] Semantic search

---

# 18. SEO

- [ ] Subject landing pages
- [ ] PYQ landing pages
- [ ] Notes landing pages
- [ ] Important-question landing pages
- [ ] Pattern pages
- [ ] Metadata
- [ ] Open Graph
- [ ] Sitemap
- [ ] Robots
- [ ] Structured data where appropriate

---

# 19. Security

- [ ] Auth review
- [ ] Authorization review
- [ ] Admin role review
- [ ] File upload validation
- [ ] Private storage
- [ ] Signed URLs
- [ ] Rate limiting
- [ ] Input validation
- [ ] Payment webhook verification
- [ ] Secret audit
- [ ] XSS/injection review
- [ ] Audit logs

---

# 20. Performance

- [ ] Database query review
- [ ] Pagination
- [ ] Search optimization
- [ ] Lazy loading
- [ ] Image optimization
- [ ] PDF loading optimization
- [ ] Caching
- [ ] Core Web Vitals review
- [ ] Mobile performance test

---

# 21. Testing

## Unit

- [ ] Priority score
- [ ] Quiz scoring
- [ ] Entitlement checks
- [ ] Study plan logic
- [ ] Cluster utilities

## Integration

- [ ] Auth
- [ ] PYQ retrieval
- [ ] Notes access
- [ ] Premium access
- [ ] Payment webhooks
- [ ] Admin publishing

## E2E

- [ ] Browse subject
- [ ] View PYQ
- [ ] Read notes
- [ ] Take quiz
- [ ] Use analysis
- [ ] Start Exam Mode
- [ ] Purchase premium

---

# 22. Launch

- [ ] Legal pages
- [ ] Privacy policy
- [ ] Terms
- [ ] Copyright/contact process
- [ ] Analytics
- [ ] Error monitoring
- [ ] Production environment
- [ ] Database backup strategy
- [ ] Final mobile review
- [ ] Final accessibility review
- [ ] Content verification
- [ ] Soft launch to students
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Public launch

---

# 23. Post-Launch

- [ ] Measure signup conversion
- [ ] Measure subject engagement
- [ ] Measure premium conversion
- [ ] Measure Exam Mode usage
- [ ] Measure retention
- [ ] Identify most-used subjects
- [ ] Identify missing content
- [ ] Improve weak features
- [ ] Expand to next branch
