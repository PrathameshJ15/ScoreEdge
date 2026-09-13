# ScoreEdge REST API Reference

**Version:** 1.0.0  
**Base URL:** `/api`  
**Content-Type:** `application/json`  
**Authentication:** Bearer JWT in `Authorization` header or `scoreedge_token` HTTP-only cookie  

---

## 1. Response Envelopes

All ScoreEdge API routes return predictable JSON envelopes.

### Success Response (`200 OK`, `201 Created`)
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 48,
    "totalPages": 3
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `500`)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": { ... }
  }
}
```

---

## 2. Authentication Endpoints

### `POST /api/auth/register`
Creates a new student or reviewer account.

**Request Body:**
```json
{
  "email": "student@sppu.ac.in",
  "password": "Password@123",
  "full_name": "Prathamesh Jadhav",
  "role": "STUDENT"
}
```

**Response (`201 Created`):**
```json
{
  "data": {
    "user": {
      "id": "usr-1725500000000",
      "email": "student@sppu.ac.in",
      "full_name": "Prathamesh Jadhav",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

### `POST /api/auth/login`
Authenticates a user and issues a signed JWT token.

**Request Body:**
```json
{
  "email": "student@sppu.ac.in",
  "password": "Password@123"
}
```

**Response (`200 OK`):**
Sets `scoreedge_token` cookie and returns user object with token.

### `GET /api/auth/me`
Retrieves the profile of the currently authenticated user. Requires valid Bearer token or session cookie.

### `POST /api/auth/logout`
Clears the session cookie.

---

## 3. Academic Hierarchy Endpoints

### `GET /api/universities`
Lists universities.

### `GET /api/patterns?university_id=...`
Lists active SPPU patterns (e.g. 2024 Pattern, 2019 Pattern).

### `GET /api/branches`
Lists engineering branches (`COMP`, `IT`, `AI-DS`, `E&TC`).

### `GET /api/academic-years?pattern_id=...`
Lists year levels (`FE`, `SE`, `TE`, `BE`).

### `GET /api/semesters?academic_year_id=...`
Lists semesters (`Semester 3`, `Semester 4`, etc.).

### `GET /api/subjects`
Lists subjects.

**Query Parameters:**
- `pattern_id` (string)
- `branch_id` (string)
- `semester_id` (string)
- `q` (string, searches code, name, or short_name)
- `page` (int, default 1)
- `limit` (int, default 20)

### `GET /api/subjects/[id]`
Returns full subject details including all units, PYQ counts, and syllabus overview.

### `POST /api/subjects`
Creates a subject. **Requires `ADMIN` role.**

### `GET /api/units?subject_id=...`
Lists syllabus units ordered by `unit_number`.

### `GET /api/topics?unit_id=...&importance=MUST_STUDY`
Lists topics filtered by unit and importance priority.

### `GET /api/syllabus?unit_id=...`
Returns official syllabus text and recommended textbook chapters.

---

## 4. Question Intelligence & PYQ Endpoints

### `GET /api/questions`
Query question bank.
- Non-admin users automatically receive only `PUBLISHED` questions.
- Admins can query all content statuses (`DRAFT`, `REVIEW`, `VERIFIED`, `PUBLISHED`, `ARCHIVED`).

**Query Parameters:**
- `subject_id` (string)
- `unit_id` (string)
- `topic_id` (string)
- `is_pyq` (boolean)
- `difficulty` (`EASY`, `MEDIUM`, `HARD`)
- `q` (string)
- `page`, `limit`

### `GET /api/questions/[id]`
Returns question detail, historical occurrences in past papers, and available solved answers.

### `GET /api/pyqs`
Retrieves Previous Year Questions enriched with exam paper occurrences:
- `year` (e.g., 2025, 2024)
- `session` (`IN_SEM`, `END_SEM`)
- `question_number` (e.g., `Q3(a)`)
- `marks`

### `GET /api/pyqs/clusters?subject_id=...`
Returns high-yield question clusters grouping differently phrased questions testing the same concept:
- `canonical_name`
- `occurrence_count`
- `years`
- `typical_marks`
- `trend` (`HIGH`, `STABLE`, `EMERGING`)
- `variations` (list of matching questions)

### `GET /api/question-banks?subject_id=...`
Groups questions by unit and marks category (2-mark, 5-mark, 10-mark) for exam preparation.

---

## 5. Answers & Notes Endpoints

### `GET /api/answers?question_id=...&marks=5`
Retrieves solved answers. If the answer is premium and the user lacks an active entitlement, summary preview is returned with locked status.

### `POST /api/answers`
Creates or updates solved answers. **Requires `ADMIN` or `REVIEWER` role.**

### `GET /api/notes?subject_id=...&unit_id=...&slug=...`
Retrieves exam notes. Masks premium content if student is not entitled.

### `POST /api/notes`
Publishes new notes. **Requires `ADMIN` or `REVIEWER` role.**

---

## 6. Practice & Assessment Endpoints

### `GET /api/quizzes?subject_id=...`
Lists quizzes for a subject.

### `GET /api/quizzes/[id]`
Returns quiz questions and options without leaking correct answer indexes to the student.

### `POST /api/quizzes/[id]`
Submits a completed quiz attempt.

**Request Body:**
```json
{
  "quiz_id": "quiz-dbms-norm",
  "answers": {
    "qq-1": 2,
    "qq-2": 0
  },
  "time_taken_seconds": 45
}
```

**Response (`200 OK`):**
Returns total score, percentage, pass/fail status, detailed question evaluation with explanations, and records progress.

---

## 7. Personalization Endpoints

### `GET /api/progress?subject_id=...`
Returns student's overall readiness percentage and item completion states.

### `POST /api/progress`
Toggles completion of a topic, note, or question.

### `GET /api/study-plans?subject_id=...`
Returns active study plan and task checklist.

### `POST /api/study-plans`
Generates a priority-ranked preparation plan based on available hours (`2h`, `5h`, `1d`, `3d`, `7d`).

---

## 8. Commerce & Entitlements Endpoints

### `GET /api/products`
Lists purchase plans (`FREE_EXPLORER`, `SUB_DBMS_PASS` ₹49, `SEM_COMP_PASS` ₹199).

### `POST /api/orders`
Initializes a server-side order for Razorpay checkout.

### `GET /api/entitlements`
Returns student's active passes and unlocked subject IDs.

---

## 9. Admin & AI Endpoints

### `GET /api/admin`
Returns aggregated analytics (total subjects, questions, users, revenue) and the verification review queue. **Requires `ADMIN` or `REVIEWER` role.**

### `POST /api/admin/verify`
Updates verification status and records an audit log in `verification_records`.

### `POST /api/ai`
Foundational AI grounding endpoint. Validates query against verified platform database records and returns grounded context, preventing unverified hallucination.
