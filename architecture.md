# SPPU Exam Intelligence — Architecture

## 1. Architecture Goal

Build a modular platform that can start with one branch and scale to multiple SPPU engineering branches, patterns, semesters, and subjects.

Primary architecture principle:

> **Content first → structured data → intelligence → personalization → AI**

Do not build the AI layer before the academic/question data model is reliable.

---

## 2. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │       Student       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Web App   │
                    │ UI + Server Routes  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   PostgreSQL DB        Object Storage         Auth System
  academic + users       PDFs/assets           sessions/users
          │
          ▼
   Intelligence Layer
          │
   ┌──────┼─────────────┐
   ▼      ▼             ▼
 PYQ   Clusters      Priority
Analysis Similarity   Engine
   │      │             │
   └──────┴──────┬──────┘
                  ▼
          Preparation Engine
                  │
            ┌─────┴─────┐
            ▼           ▼
        Study Plan   Exam Mode
                  │
                  ▼
             AI Assistant
```

---

## 3. Recommended Stack

### Frontend / Full-stack framework
- Next.js
- React
- TypeScript

### Styling
- Tailwind CSS
- Component/design system

### Database
- PostgreSQL
- Supabase may be used as the managed PostgreSQL/Auth/Storage platform

### Authentication
- Supabase Auth or equivalent

### Storage
- Object storage for documents and media

### Payments
- Razorpay or another India-supported gateway

### AI
- OpenAI API

### Deployment
- Vercel or equivalent

### Version control
- Git + GitHub

---

## 4. Application Layers

## 4.1 Presentation Layer

Responsible for:
- pages
- responsive UI
- accessibility
- client state
- loading/error states

Do not put database logic directly into UI components.

---

## 4.2 Application Layer

Responsible for:
- business rules
- access checks
- study-plan generation
- premium permissions
- question analysis requests
- quiz scoring

---

## 4.3 Data Layer

Responsible for:
- database queries
- repositories/data access
- transactions
- validation
- migrations

Keep database-specific logic isolated.

---

## 4.4 Intelligence Layer

Responsible for:
- question normalization
- similarity detection
- clustering
- frequency calculations
- priority scoring
- syllabus-topic mapping

This layer should be independently testable.

---

## 4.5 AI Layer

Responsible for:
- grounded explanations
- study planning
- natural-language search
- revision assistance

The AI layer must use verified platform data where factual SPPU-specific answers are required.

---

# 5. Academic Data Model

Core hierarchy:

```text
University
  ↓
Pattern
  ↓
Branch
  ↓
Academic Year / Year Level
  ↓
Semester
  ↓
Subject
  ↓
Unit
  ↓
Topic
```

Example:

```text
SPPU
└── 2024 Pattern
    └── Computer Engineering
        └── SE
            └── Semester 3
                └── DBMS
                    ├── Unit 1
                    ├── Unit 2
                    └── Unit 3
```

---

# 6. PYQ Data Model

A paper is separate from an individual question.

```text
PYQ Paper
├── pattern
├── branch
├── year level
├── semester
├── subject
├── exam session
├── exam year
├── source
└── verification status
```

Questions belong to a paper.

```text
Question
├── paper_id
├── text
├── question_number
├── marks
├── topic_id
├── normalized_text
└── cluster_id
```

---

# 7. Suggested Tables

```text
users
profiles
branches
patterns
academic_years
semesters
subjects
units
topics

pyq_papers
questions
question_occurrences
question_clusters

notes
answers
resources

quizzes
quiz_questions
quiz_attempts

study_plans
study_plan_items
progress
bookmarks

subscriptions
payments

reports
audit_logs
```

---

# 8. Important Relationships

```text
Pattern 1 ── * Subjects
Branch 1 ── * Subjects
Subject 1 ── * Units
Unit 1 ── * Topics

Subject 1 ── * PYQ Papers
PYQ Paper 1 ── * Questions

Topic 1 ── * Questions
Question Cluster 1 ── * Questions

User 1 ── * Progress
User 1 ── * Quiz Attempts
User 1 ── * Study Plans
User 1 ── * Subscriptions
```

Use explicit foreign keys.

---

# 9. Content Ownership

Every content item should have metadata:

```text
source
source_type
license_or_permission
created_by
verified
verified_at
updated_at
```

Recommended source types:

- official
- original
- licensed
- community-submitted
- reference-only

Do not redistribute third-party content without verifying rights.

---

# 10. Question Intelligence Architecture

## Pipeline

```text
Source Paper
   ↓
Document Processing
   ↓
Question Extraction
   ↓
Normalization
   ↓
Topic Classification
   ↓
Similarity Detection
   ↓
Cluster Proposal
   ↓
Human Verification
   ↓
Analytics
```

AI can propose classifications, but verification is required before publishing important intelligence.

---

# 11. Question Clustering

A question cluster represents the same underlying concept.

Example:

```text
Cluster:
Deadlock Prevention

Questions:
- Explain deadlock prevention.
- Explain techniques for preventing deadlocks.
- Describe methods of deadlock prevention.
```

Cluster fields:

```text
cluster_id
name
topic_id
description
confidence
verified
```

---

# 12. Priority Engine

Suggested inputs:

```text
frequency
recency
marks
recurrence
topic importance
pattern relevance
```

Output:

```text
priority_score
priority_label
```

The score should be explainable.

Example:

```text
Normalization
Frequency: 4/5
Recent: Yes
Typical marks: 5–10
Priority: MUST STUDY
```

Do not expose unsupported claims as official predictions.

---

# 13. Preparation Engine

Inputs:

```text
user
branch
pattern
semester
subject
exam_date
available_time
progress
topic_priority
```

Output:

```text
study_plan
study_plan_items
estimated_duration
priority
completion_status
```

The engine must respect realistic time constraints.

---

# 14. Premium Access Architecture

Use server-side authorization.

Conceptual flow:

```text
User
 ↓
Authenticated?
 ↓
Subscription active?
 ↓
Resource requires premium?
 ↓
Allow / Deny
```

Never rely only on hiding UI buttons.

The server must enforce access.

---

# 15. Payment Flow

```text
Student
  ↓
Select Premium
  ↓
Create order
  ↓
Payment gateway
  ↓
Gateway callback/webhook
  ↓
Verify payment
  ↓
Create/update subscription
  ↓
Grant entitlement
```

Never grant permanent access solely from client-side payment success.

---

# 16. File Storage

Store PDFs/assets in object storage.

Do not expose private premium files with permanent public URLs.

Use:
- private buckets
- authorized access
- short-lived signed URLs where appropriate

---

# 17. Search Architecture

### V1

PostgreSQL search:
- exact match
- keyword match
- filters

### Later

Add:
- semantic embeddings
- natural-language search
- question similarity

Keep canonical data in PostgreSQL; search indexes should be rebuildable.

---

# 18. AI Grounding

For SPPU-specific questions:

```text
User Query
   ↓
Retrieve verified platform data
   ↓
Relevant syllabus/PYQ/notes
   ↓
AI generation
   ↓
Answer with context
```

Do not let the AI invent university-specific facts when source data is unavailable.

---

# 19. Admin Architecture

Admin needs:
- role-based access
- audit logging
- content workflows
- verification states
- moderation

Suggested roles:

```text
admin
editor
reviewer
support
```

---

# 20. Data Verification States

Use:

```text
draft
processing
needs_review
verified
published
archived
```

This prevents raw imported data from appearing publicly.

---

# 21. Security Requirements

Minimum:
- server-side authorization
- protected admin routes
- input validation
- rate limiting for expensive endpoints
- secure secrets
- database row-level security where applicable
- signed/private file access
- payment webhook verification
- audit logs
- safe file upload validation
- protection against injection/XSS
- no secret keys in client code

---

# 22. Observability

Track:
- errors
- slow requests
- failed payments
- AI failures
- failed imports
- search failures
- content publication events

Keep structured logs.

---

# 23. Scalability Strategy

MVP:
- one Next.js app
- managed PostgreSQL
- object storage
- server APIs

Later:
- background job system
- queue for document processing
- dedicated search index
- caching
- analytics warehouse if required

Do not introduce microservices until actual scale requires them.

---

# 24. Architecture Principles

1. One source of truth for academic data.
2. Separate content from analysis.
3. Separate UI from business logic.
4. Keep intelligence deterministic/explainable where possible.
5. Use AI as an assistant, not the source of truth.
6. Enforce premium permissions server-side.
7. Keep raw source documents and normalized records separate.
8. Make import pipelines repeatable.
9. Make database migrations version-controlled.
10. Build for one branch first, but do not hard-code one branch.
