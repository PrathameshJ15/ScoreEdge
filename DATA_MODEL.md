# ScoreEdge Domain Data Model

**Version:** 1.0.0  
**Last Updated:** September 5, 2026  
**Status:** Production Ready  

---

## 1. Domain Architecture Overview

ScoreEdge's data model is organized around the foundational rule established in `architecture.md`:

> **Content first → structured data → intelligence → personalization → AI**

The model consists of 28 normalized entities categorized into 6 core domains:
1. **Identity & Authorization Domain** (`users`)
2. **Academic Hierarchy Domain** (`universities`, `patterns`, `branches`, `academic_years`, `semesters`, `subjects`, `units`, `topics`, `syllabus_items`)
3. **Question Intelligence Domain** (`content_sources`, `questions`, `question_occurrences`, `question_clusters`, `question_cluster_members`)
4. **Content & Practice Domain** (`answers`, `notes`, `quizzes`, `quiz_questions`, `quiz_attempts`)
5. **Personalization & Preparation Domain** (`student_progress`, `study_plans`, `study_plan_tasks`)
6. **Commerce & Governance Domain** (`products`, `orders`, `payments`, `entitlements`, `verification_records`)

---

## 2. Core Enumerations

### `content_status`
Lifecycle states for all academic content (questions, answers, notes, quizzes):
- `DRAFT`: Raw imported or authored content, not visible to students.
- `REVIEW`: Awaiting peer or faculty verification.
- `VERIFIED`: Formally reviewed and verified for SPPU syllabus alignment.
- `PUBLISHED`: Publicly live and accessible based on entitlement tier.
- `ARCHIVED`: Deprecated due to pattern/syllabus revision.

### `verification_status`
- `UNVERIFIED`: Extracted raw data.
- `NEEDS_REVIEW`: Flagged for verification.
- `VERIFIED`: Confirmed against official SPPU paper copies.
- `REJECTED`: Discarded due to errors or duplication.

### `user_role`
- `STUDENT`: Standard learner; access to free content and purchased entitlements.
- `REVIEWER`: Faculty or senior peer contributor; can verify content and manage queues.
- `ADMIN`: Platform administrator; full CRUD and commerce governance.

### `priority_level`
- `MUST_STUDY`: Very High frequency (appeared in ≥70% of analyzed papers).
- `HIGH`: Appeared in ~50-70% of papers.
- `MEDIUM`: Appeared in ~30-50% of papers.
- `LOW`: Appeared in <30% of papers or obsolete topic.

### `difficulty_level`
- `EASY`
- `MEDIUM`
- `HARD`

### `question_type`
- `THEORY`: Standard descriptive question.
- `NUMERICAL`: Mathematical problem or algorithm tracing.
- `MCQ`: Multiple choice question.
- `DIAGRAM`: Question requiring circuit, architecture, or ER diagrams.
- `SHORT_ANSWER`: 2-mark brief conceptual question.

### `exam_session`
- `IN_SEM`: 30-mark mid-semester examination.
- `END_SEM`: 70-mark final semester examination.
- `RE_EXAM`: Remedial examination.
- `SUPPLEMENTARY`: Combined back-paper session.

---

## 3. Entity Definitions & Attribute Specifications

### 3.1 Identity Domain
#### `User`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique user identifier |
| `email` | String (Unique) | Student or staff email address |
| `password_hash` | String | Scrypt salt and hash string |
| `full_name` | String | Full name |
| `role` | `user_role` | `STUDENT`, `ADMIN`, or `REVIEWER` |
| `avatar_url` | String (Nullable) | Profile avatar URI |
| `email_verified`| Boolean | Verification flag |
| `is_active` | Boolean | Active account indicator |
| `created_at` | Timestamptz | Account creation timestamp |
| `updated_at` | Timestamptz | Account update timestamp |
| `deleted_at` | Timestamptz (Nullable) | Soft deletion timestamp |

---

### 3.2 Academic Hierarchy Domain
#### `University`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | University ID |
| `code` | String (Unique) | e.g., `SPPU` |
| `name` | String | Savitribai Phule Pune University |
| `state` | String | Maharashtra |
| `country` | String | India |
| `website` | String (Nullable) | Official university portal |

#### `Pattern`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Pattern ID |
| `university_id` | UUID (FK) | Reference to `universities.id` |
| `name` | String | e.g., `2024 Pattern (NEP)` |
| `code` | String | `2024-pattern` |
| `effective_year`| Int | Year introduced (e.g., 2024) |
| `is_active` | Boolean | Active status flag |

#### `Branch`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Branch ID |
| `code` | String (Unique) | `COMP`, `IT`, `AI-DS`, `E&TC` |
| `name` | String | Computer Engineering |
| `description` | String | Scope and description |
| `is_active` | Boolean | Active status flag |

#### `AcademicYear`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Year level ID |
| `pattern_id` | UUID (FK) | Reference to `patterns.id` |
| `code` | String | `FE`, `SE`, `TE`, `BE` |
| `name` | String | Second Year Engineering |
| `year_number` | Int | 1 to 4 |

#### `Semester`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Semester ID |
| `academic_year_id`| UUID (FK) | Reference to `academic_years.id` |
| `semester_number`| Int | 1 to 8 |
| `name` | String | Semester 3 |

#### `Subject`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Subject ID |
| `pattern_id` | UUID (FK) | Reference to `patterns.id` |
| `branch_id` | UUID (FK) | Reference to `branches.id` |
| `semester_id` | UUID (FK) | Reference to `semesters.id` |
| `code` | String | Official SPPU course code (e.g. `210241`) |
| `name` | String | Database Management Systems |
| `short_name` | String | `DBMS` |
| `total_units` | Int | Default 6 |
| `total_credits`| Int | Default 3 |
| `is_popular` | Boolean | Featured subject flag |
| `is_active` | Boolean | Active flag |
| `deleted_at` | Timestamptz (Nullable) | Soft deletion timestamp |

#### `Unit`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unit ID |
| `subject_id` | UUID (FK) | Reference to `subjects.id` |
| `unit_number` | Int | 1 to 6 |
| `title` | String | Unit title |
| `description` | String | Syllabus summary |
| `weightage_percentage`| Int | Percentage weightage in SPPU papers (~16%) |

#### `Topic`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Topic ID |
| `unit_id` | UUID (FK) | Reference to `units.id` |
| `title` | String | Topic title (e.g., 3NF and BCNF) |
| `description` | String | Topic conceptual description |
| `order_index` | Int | Ordering in syllabus |
| `importance_level`| `priority_level` | `MUST_STUDY`, `HIGH`, `MEDIUM`, `LOW` |

#### `SyllabusItem`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Syllabus line item ID |
| `unit_id` | UUID (FK) | Reference to `units.id` |
| `topic_id` | UUID (FK, Nullable)| Reference to `topics.id` |
| `content` | String | Official syllabus textbook text |
| `reference_materials`| String (Nullable) | Textbooks & chapters |
| `hours_allocated`| Int | Teaching hours |

---

### 3.3 Question Intelligence Domain
#### `ContentSource`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Source ID |
| `name` | String | Source publisher or author |
| `source_type` | `source_type` | `OFFICIAL`, `COMMUNITY`, `INTERNAL`, `REFERENCE` |
| `source_url` | String (Nullable) | URL or catalog reference |
| `license_type`| String | License terms |
| `copyright_notes`| String (Nullable) | Verification of fair educational reuse |

#### `Question`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Question ID |
| `subject_id` | UUID (FK) | Reference to `subjects.id` |
| `unit_id` | UUID (FK) | Reference to `units.id` |
| `topic_id` | UUID (FK, Nullable)| Reference to `topics.id` |
| `question_text` | String | Full question text as asked |
| `normalized_question`| String | Lowercased, alphanumeric normalized text |
| `marks` | Int | Question marks (e.g. 5, 8, 10) |
| `difficulty` | `difficulty_level` | `EASY`, `MEDIUM`, `HARD` |
| `question_type` | `question_type` | `THEORY`, `NUMERICAL`, `MCQ`, `DIAGRAM`, `SHORT_ANSWER` |
| `is_pyq` | Boolean | True if asked in previous SPPU papers |
| `verification_status`| `verification_status`| `UNVERIFIED`, `NEEDS_REVIEW`, `VERIFIED`, `REJECTED` |
| `content_status` | `content_status` | `DRAFT`, `REVIEW`, `VERIFIED`, `PUBLISHED`, `ARCHIVED` |
| `source_id` | UUID (FK, Nullable)| Reference to `content_sources.id` |
| `created_at` | Timestamptz | Creation timestamp |
| `updated_at` | Timestamptz | Update timestamp |
| `deleted_at` | Timestamptz (Nullable)| Soft deletion timestamp |

#### `QuestionOccurrence`
Represents every historical appearance of a question in an SPPU examination:
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Occurrence ID |
| `question_id` | UUID (FK) | Reference to `questions.id` |
| `year` | Int | Exam year (e.g., 2025) |
| `exam_session` | `exam_session` | `IN_SEM`, `END_SEM`, `RE_EXAM`, `SUPPLEMENTARY` |
| `question_number`| String | Question paper number (e.g., `Q3(a)`) |
| `marks` | Int | Marks allotted in this specific paper |
| `pattern_id` | UUID (FK) | Reference to `patterns.id` |
| `branch_id` | UUID (FK) | Reference to `branches.id` |
| `semester_id` | UUID (FK) | Reference to `semesters.id` |
| `subject_id` | UUID (FK) | Reference to `subjects.id` |
| `source_id` | UUID (FK, Nullable)| Verified paper file source |
| `verification_status`| `verification_status`| Verified against original paper |

#### `QuestionCluster`
Represents a group of questions that test the same underlying concept:
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Cluster ID |
| `subject_id` | UUID (FK) | Reference to `subjects.id` |
| `unit_id` | UUID (FK) | Reference to `units.id` |
| `topic_id` | UUID (FK, Nullable)| Reference to `topics.id` |
| `canonical_name`| String | Concept label (e.g. `Normalization (1NF, 2NF, 3NF, BCNF)`) |
| `canonical_question`| String | Standardized question synthesis |
| `occurrence_count`| Int | Total paper appearances |
| `years` | Array[Int] | e.g. `[2025, 2024, 2023]` |
| `typical_marks`| String | e.g. `5–10 Marks` |
| `confidence_score`| Decimal | Cluster similarity score (0.0 to 1.0) |
| `human_approved`| Boolean | Reviewer confirmation |
| `approved_by` | UUID (FK, Nullable)| Reference to `users.id` |
| `trend` | `trend_direction` | `HIGH`, `STABLE`, `EMERGING` |

#### `QuestionClusterMember`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Membership ID |
| `cluster_id` | UUID (FK) | Reference to `question_clusters.id` |
| `question_id` | UUID (FK) | Reference to `questions.id` |
| `similarity_score`| Decimal | Semantic/lexical match score |
| `added_by` | UUID (FK, Nullable)| User who assigned or confirmed |

---

### 3.4 Content & Practice Domain
#### `Answer`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Answer ID |
| `question_id` | UUID (FK) | Reference to `questions.id` |
| `marks_target` | Int | Target answer length: `2`, `5`, or `10` marks |
| `heading` | String | Answer heading |
| `summary` | String | Executive answer summary |
| `key_points` | JSONB / Array[String]| Mandatory evaluator scoring bullet points |
| `diagram_description`| String (Nullable) | Diagram drawing guidance |
| `example_text` | String (Nullable) | Worked code/schema example |
| `evaluator_tips`| String (Nullable) | Specific guidance for scoring SPPU marks |
| `is_premium` | Boolean | Premium entitlement requirement |
| `content_status`| `content_status` | `DRAFT`, `REVIEW`, `VERIFIED`, `PUBLISHED`, `ARCHIVED` |
| `author_id` | UUID (FK, Nullable)| Creator ID |
| `verified_by` | UUID (FK, Nullable)| Verified reviewer ID |

#### `Note`
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Note ID |
| `subject_id` | UUID (FK) | Reference to `subjects.id` |
| `unit_id` | UUID (FK) | Reference to `units.id` |
| `topic_id` | UUID (FK, Nullable)| Reference to `topics.id` |
| `title` | String | Note chapter title |
| `slug` | String | URL slug |
| `summary` | String | Brief abstract |
| `content_body` | String | Markdown content |
| `read_time_minutes`| Int | Estimated reading time |
| `is_free_preview`| Boolean | Available in free tier |
| `is_premium` | Boolean | Requires active subject/semester pass |
| `content_status`| `content_status` | Status |

#### `Quiz` & `QuizQuestion`
- `Quiz`: Multi-question assessment bound to a subject/unit with `duration_minutes` and `passing_score`.
- `QuizQuestion`: Individual question with 4 options, `correct_option_index`, and detailed explanation.
- `QuizAttempt`: Records student submission, `score`, `percentage`, `answers_json`, and `time_taken_seconds`.

---

### 3.5 Personalization Domain
#### `StudentProgress`
Records granular completion of topics, notes, questions, and quizzes:
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Progress record ID |
| `user_id` | UUID (FK) | Reference to `users.id` |
| `subject_id` | UUID (FK) | Reference to `subjects.id` |
| `item_type` | `progress_item_type`| `TOPIC`, `NOTE`, `PYQ`, `QUIZ` |
| `item_id` | UUID | Reference to target item |
| `is_completed` | Boolean | True if finished |
| `last_activity_at`| Timestamptz | Timestamp of last engagement |

#### `StudyPlan` & `StudyPlanTask`
- `StudyPlan`: Dynamic preparation schedules (`2h`, `5h`, `1d`, `3d`, `7d`) customized to available hours.
- `StudyPlanTask`: Granular task steps prioritized into `MUST_STUDY` vs `HIGH` priority with estimated durations.

---

### 3.6 Commerce & Entitlements Domain
#### `Product`, `Order`, `Payment`, `Entitlement`
- `Product`: Catalog defining `FREE_EXPLORER`, `SUB_DBMS_PASS` (₹49), and `SEM_COMP_PASS` (₹199).
- `Order`: Server-side order with `gateway_order_id` (Razorpay order reference).
- `Payment`: Verified payment with `gateway_payment_id` and signature verification.
- `Entitlement`: Grants access to a single subject or entire semester until `expires_at`.
- `VerificationRecord`: Audit record tracking all review approvals and rejections.
