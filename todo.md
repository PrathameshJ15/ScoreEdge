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

# 3. Design System

- [x] Finalize color tokens
- [x] Finalize typography
- [x] Finalize spacing
- [x] Finalize radius
- [x] Finalize shadows/elevation
- [x] Build Button
- [x] Build Input
- [x] Build SearchInput
- [x] Build Select
- [x] Build Tabs
- [x] Build Badge
- [x] Build PriorityBadge
- [x] Build Card
- [x] Build responsive navigation

---

# 4. Marketing Website

- [x] Homepage hero
- [x] Feature section
- [x] PYQ Intelligence preview
- [x] Exam Mode preview
- [x] Premium preview
- [x] Solved answers preview
- [x] Academic hierarchy browser
- [x] Quiz & practice simulator
- [x] FAQ
- [x] Footer
- [x] Mobile optimization
- [x] SEO metadata

---

# 5. Academic Database

- [ ] Patterns table
- [ ] Branches table
- [ ] Academic years
- [ ] Semesters
- [ ] Subjects
- [ ] Units
- [ ] Topics
- [ ] Foreign keys
- [ ] Indexes
- [ ] Seed SE Computer data
- [ ] Validate academic hierarchy

---

# 6. Authentication

- [ ] Signup
- [ ] Login
- [ ] Logout
- [ ] Session handling
- [ ] Password reset
- [ ] Protected dashboard
- [ ] Profile
- [ ] Onboarding
- [ ] Branch/year/semester preferences

---

# 7. PYQ System

- [ ] PYQ paper table
- [ ] Question table
- [ ] Question occurrence data
- [ ] Paper metadata
- [ ] Source metadata
- [ ] Verification status
- [ ] PYQ library
- [ ] Filters
- [ ] Search
- [ ] Paper viewer
- [ ] Question viewer
- [ ] Report issue button
- [ ] Missing-paper contribution flow

---

# 8. Notes System

- [ ] Notes table
- [ ] Topic-note relation
- [ ] Notes reader
- [ ] Basic notes
- [ ] Premium notes
- [ ] Revision notes
- [ ] Diagrams
- [ ] Exam-writing tips
- [ ] 2-mark answers
- [ ] 5-mark answers
- [ ] 10-mark answers

---

# 9. Quiz System

- [ ] Quiz table
- [ ] Quiz question table
- [ ] Attempt table
- [ ] Quiz UI
- [ ] Scoring
- [ ] Explanations
- [ ] Attempt history
- [ ] Weak-topic detection
- [ ] Basic mock test

---

# 10. Admin Panel

- [ ] Admin authentication
- [ ] Admin roles
- [ ] Dashboard
- [ ] Pattern CRUD
- [ ] Branch CRUD
- [ ] Semester CRUD
- [ ] Subject CRUD
- [ ] Unit CRUD
- [ ] Topic CRUD
- [ ] PYQ CRUD
- [ ] Question CRUD
- [ ] Notes CRUD
- [ ] Answers CRUD
- [ ] Quiz CRUD
- [ ] Publish/unpublish
- [ ] Verification workflow
- [ ] Audit logs

---

# 11. Premium

- [ ] Products
- [ ] Pricing page
- [ ] Entitlements
- [ ] Razorpay integration
- [ ] Order creation
- [ ] Payment verification
- [ ] Webhook handling
- [ ] Subscription status
- [ ] Server-side access control
- [ ] Private file access
- [ ] Premium UI states

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
