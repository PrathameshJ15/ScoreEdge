# ScoreEdge Database Architecture & Operations Guide

**Version:** 1.0.0  
**Database Engine:** PostgreSQL 15+ / Supabase  
**Encoding:** UTF-8  
**Collation:** en_US.UTF-8  

---

## 1. Database Principles

ScoreEdge's database layer enforces four non-negotiable architectural principles:

1. **Normalized Canonical Hierarchy:** Academic structure is strictly normalized from University down to Syllabus Item. No denormalized string matching is permitted in core relations.
2. **Deterministic Foreign Keys:** Every child record references its parent with `ON DELETE CASCADE` or `ON DELETE SET NULL` constraints to ensure data integrity.
3. **Audit & Soft Deletion:** Critical academic content and user records support soft deletion (`deleted_at IS NULL`) and automated audit tracking (`verification_records`).
4. **Row-Level Security (RLS):** Supabase-compatible RLS policies ensure private user data (progress, study plans, entitlements) is segregated at the database engine level.

---

## 2. DDL & Migration Scripts

The complete database schema and seed migrations are located in:
- **Production Schema:** [`src/db/schema.sql`](file:///C:/Users/jadha/OneDrive/Desktop/ScoreEdge/src/db/schema.sql)
- **Seed Data:** [`src/db/seed.sql`](file:///C:/Users/jadha/OneDrive/Desktop/ScoreEdge/src/db/seed.sql)

### Applying Migrations Locally or via Supabase CLI

```bash
# Apply schema
psql -h localhost -U postgres -d scoreedge -f src/db/schema.sql

# Seed initial SPPU SE Computer curriculum
psql -h localhost -U postgres -d scoreedge -f src/db/seed.sql
```

---

## 3. Indexing Strategy

Comprehensive B-Tree indexes are created across high-frequency query paths:

| Table | Indexed Columns | Justification |
|---|---|---|
| `users` | `email`, `role` | Fast login lookups and role-based filtering |
| `subjects` | `branch_id`, `semester_id`, `code` | Academic navigation and subject hub resolution |
| `units` | `subject_id`, `unit_number` | Unit listing ordered by syllabus sequence |
| `topics` | `unit_id`, `importance_level` | Filtering topics by `MUST_STUDY` / `HIGH` priority |
| `questions` | `subject_id`, `unit_id`, `is_pyq`, `content_status` | Fast PYQ library filtering and student access gating |
| `question_occurrences`| `question_id`, `year`, `subject_id` | Historical paper occurrence aggregation |
| `question_clusters` | `subject_id`, `unit_id` | Topic intelligence and clustering previews |
| `answers` | `question_id`, `marks_target` | Rapid retrieval of 2, 5, or 10-mark solved answers |
| `notes` | `subject_id`, `slug` | SEO-friendly URL slug resolution |
| `student_progress` | `user_id`, `subject_id` | Student dashboard readiness score calculation |
| `entitlements` | `user_id`, `subject_id` | Instant server-side authorization check |
| `orders` | `user_id`, `gateway_order_id` | Webhook callback reconciliation |

---

## 4. Automated Triggers

### `update_timestamp()` Trigger
All tables with an `updated_at` column are bound to an automated PostgreSQL trigger:

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

This guarantees that any update via SQL or ORM automatically updates `updated_at` without relying on application-level clock synchronization.

---

## 5. Row-Level Security (RLS) Policies

All tables have RLS enabled. Policies are partitioned by visibility:

### Public Read Tables
Tables containing academic syllabus, patterns, subjects, units, and verified published questions allow open read access:
```sql
CREATE POLICY "Public subjects read" ON subjects 
FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Public published questions read" ON questions 
FOR SELECT USING (content_status = 'PUBLISHED' AND deleted_at IS NULL);
```

### Private Student Tables
User records, study plans, quiz attempts, and progress records enforce strict ownership via `auth.uid()`:
```sql
CREATE POLICY "Users manage own progress" ON student_progress 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own study plans" ON study_plans 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own entitlements" ON entitlements 
FOR SELECT USING (auth.uid() = user_id AND is_active = true);
```

---

## 6. Content Status Progression

Academic content follows a strict 5-stage verification state machine:

```text
[ DRAFT ] ──────────► [ REVIEW ] ──────────► [ VERIFIED ] ──────────► [ PUBLISHED ]
   │                     │                       │                         │
   ▼                     ▼                       ▼                         ▼
   └─────────────────────┴───────► [ ARCHIVED ] ◄──────────────────────────┘
```

1. **`DRAFT`:** Author authored content; visible only to author and admins.
2. **`REVIEW`:** Enqueued in `/api/admin` verification queue for reviewer evaluation.
3. **`VERIFIED`:** Verified by reviewer against official SPPU question paper.
4. **`PUBLISHED`:** Publicly queryable via public API endpoints.
5. **`ARCHIVED`:** Soft-deprecated upon curriculum or pattern changes.

---

## 7. Connection Management & Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Server | PostgreSQL direct connection string with SSL |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client-side anonymous key (restricted by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Server-only administrative key (never exposed to client) |
| `AUTH_SECRET` | Server | Secret for signing session tokens and API auth |
