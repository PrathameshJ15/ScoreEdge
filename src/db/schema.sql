-- ============================================================================
-- ScoreEdge SPPU Exam Intelligence Platform
-- Production PostgreSQL / Supabase Normalized Database Schema
-- Version: 1.0.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for clean migration environments if needed
-- (In production migrations, use ALTER / incremental DDL)

-- ----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN', 'REVIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('MUST_STUDY', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('THEORY', 'NUMERICAL', 'MCQ', 'DIAGRAM', 'SHORT_ANSWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exam_session AS ENUM ('IN_SEM', 'END_SEM', 'RE_EXAM', 'SUPPLEMENTARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trend_direction AS ENUM ('HIGH', 'STABLE', 'EMERGING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE source_type AS ENUM ('OFFICIAL', 'COMMUNITY', 'INTERNAL', 'REFERENCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('SUBJECT_PASS', 'SEMESTER_PASS', 'EXAM_CRASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('CREATED', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('MUST_READ_NOTE', 'SOLVE_PYQ', 'PRACTICE_QUIZ', 'REVISION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_duration_type AS ENUM ('2h', '5h', '1d', '3d', '7d');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE progress_item_type AS ENUM ('TOPIC', 'NOTE', 'PYQ', 'QUIZ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_scope AS ENUM ('SINGLE_SUBJECT', 'SEMESTER_ALL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CORE IDENTITY & USER ACCESS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'STUDENT' NOT NULL,
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 3. ACADEMIC HIERARCHY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India' NOT NULL,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    effective_year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_pattern_code_uni UNIQUE (university_id, code)
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- 'FE', 'SE', 'TE', 'BE'
    name VARCHAR(100) NOT NULL,
    year_number INT NOT NULL CHECK (year_number BETWEEN 1 AND 4),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_pattern_year UNIQUE (pattern_id, code)
);

CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_number INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_sem_number UNIQUE (academic_year_id, semester_number)
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    total_units INT DEFAULT 6 NOT NULL,
    total_credits INT DEFAULT 3 NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_subject_code_pattern UNIQUE (pattern_id, branch_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_branch ON subjects(branch_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    unit_number INT NOT NULL CHECK (unit_number BETWEEN 1 AND 8),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    weightage_percentage INT DEFAULT 16 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_unit_subject_number UNIQUE (subject_id, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_units_subject ON units(subject_id);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_index INT DEFAULT 1 NOT NULL,
    importance_level priority_level DEFAULT 'MEDIUM' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_topics_unit ON topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_topics_importance ON topics(importance_level);

CREATE TABLE IF NOT EXISTS syllabus_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    reference_materials TEXT,
    hours_allocated INT DEFAULT 6 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. CONTENT SOURCES & PROVENANCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_type source_type DEFAULT 'OFFICIAL' NOT NULL,
    source_url TEXT,
    license_type VARCHAR(100) DEFAULT 'Educational / All Rights Reserved' NOT NULL,
    copyright_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. QUESTIONS, OCCURRENCES & CLUSTERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    normalized_question TEXT NOT NULL,
    marks INT NOT NULL CHECK (marks > 0),
    difficulty difficulty_level DEFAULT 'MEDIUM' NOT NULL,
    question_type question_type DEFAULT 'THEORY' NOT NULL,
    is_pyq BOOLEAN DEFAULT TRUE NOT NULL,
    verification_status verification_status DEFAULT 'UNVERIFIED' NOT NULL,
    content_status content_status DEFAULT 'DRAFT' NOT NULL,
    source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_unit ON questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_pyq ON questions(is_pyq);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(content_status);

CREATE TABLE IF NOT EXISTS question_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    year INT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    exam_session exam_session NOT NULL,
    question_number VARCHAR(50) NOT NULL,
    marks INT NOT NULL,
    pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
    verification_status verification_status DEFAULT 'VERIFIED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_occurrences_question ON question_occurrences(question_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_year ON question_occurrences(year);
CREATE INDEX IF NOT EXISTS idx_occurrences_subject ON question_occurrences(subject_id);

CREATE TABLE IF NOT EXISTS question_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    canonical_name VARCHAR(255) NOT NULL,
    canonical_question TEXT NOT NULL,
    occurrence_count INT DEFAULT 1 NOT NULL,
    years INT[] DEFAULT '{}' NOT NULL,
    typical_marks VARCHAR(50) NOT NULL,
    confidence_score NUMERIC(5,2) DEFAULT 0.90 NOT NULL,
    human_approved BOOLEAN DEFAULT FALSE NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    trend trend_direction DEFAULT 'STABLE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clusters_subject ON question_clusters(subject_id);
CREATE INDEX IF NOT EXISTS idx_clusters_unit ON question_clusters(unit_id);

CREATE TABLE IF NOT EXISTS question_cluster_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL REFERENCES question_clusters(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5,2) DEFAULT 1.0 NOT NULL,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_cluster_member UNIQUE (cluster_id, question_id)
);

-- ----------------------------------------------------------------------------
-- 6. EXAM ANSWERS & STUDY NOTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    marks_target INT NOT NULL CHECK (marks_target IN (2, 5, 10)),
    heading VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    key_points JSONB DEFAULT '[]'::jsonb NOT NULL,
    diagram_description TEXT,
    example_text TEXT,
    evaluator_tips TEXT,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    content_status content_status DEFAULT 'PUBLISHED' NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_marks ON answers(marks_target);

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content_body TEXT NOT NULL,
    read_time_minutes INT DEFAULT 5 NOT NULL,
    is_free_preview BOOLEAN DEFAULT TRUE NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    content_status content_status DEFAULT 'PUBLISHED' NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_note_slug_subject UNIQUE (subject_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_unit ON notes(unit_id);

-- ----------------------------------------------------------------------------
-- 7. QUIZZES & ASSESSMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT DEFAULT 15 NOT NULL,
    total_questions INT DEFAULT 10 NOT NULL,
    passing_score INT DEFAULT 60 NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'EXAM_STANDARD' NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    content_status content_status DEFAULT 'PUBLISHED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- array of strings e.g. ["Option A", "Option B"]
    correct_option_index INT NOT NULL CHECK (correct_option_index >= 0),
    explanation TEXT NOT NULL,
    marks INT DEFAULT 1 NOT NULL,
    order_index INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL,
    max_score INT NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    time_taken_seconds INT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    answers_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- ----------------------------------------------------------------------------
-- 8. STUDENT PROGRESS & STUDY PLANS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    item_type progress_item_type NOT NULL,
    item_id UUID NOT NULL,
    is_completed BOOLEAN DEFAULT TRUE NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_progress_item UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_subject ON student_progress(subject_id);

CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration_type plan_duration_type NOT NULL,
    available_hours NUMERIC(4,1) NOT NULL,
    completion_rate NUMERIC(5,2) DEFAULT 0.0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS study_plan_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    task_title VARCHAR(255) NOT NULL,
    task_type task_type NOT NULL,
    estimated_minutes INT NOT NULL,
    priority priority_level DEFAULT 'MUST_STUDY' NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    order_index INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_study_tasks_plan ON study_plan_tasks(study_plan_id);

-- ----------------------------------------------------------------------------
-- 9. PRODUCTS, COMMERCE & ENTITLEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    product_type product_type NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    price_inr INT NOT NULL CHECK (price_inr >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    amount_inr INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    gateway VARCHAR(50) DEFAULT 'RAZORPAY' NOT NULL,
    gateway_order_id VARCHAR(100),
    status order_status DEFAULT 'CREATED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_gateway_order_id ON orders(gateway_order_id);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_inr INT NOT NULL,
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(255),
    payment_method VARCHAR(50),
    status payment_status NOT NULL,
    raw_response TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    access_scope access_scope NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_subject ON entitlements(subject_id);

-- ----------------------------------------------------------------------------
-- 10. AUDIT & VERIFICATION RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'QUESTION', 'ANSWER', 'NOTE', 'CLUSTER', 'SYLLABUS'
    entity_id UUID NOT NULL,
    status_from VARCHAR(50) NOT NULL,
    status_to VARCHAR(50) NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_entity ON verification_records(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 11. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_update_timestamp ON %I;
            CREATE TRIGGER trg_update_timestamp
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();', t, t);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES (SUPABASE COMPATIBLE)
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Public readable tables (academic catalog)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public universities read" ON universities FOR SELECT USING (true);

ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public patterns read" ON patterns FOR SELECT USING (is_active = true);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public branches read" ON branches FOR SELECT USING (is_active = true);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public subjects read" ON subjects FOR SELECT USING (is_active = true AND deleted_at IS NULL);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public units read" ON units FOR SELECT USING (true);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public topics read" ON topics FOR SELECT USING (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public published questions read" ON questions FOR SELECT USING (content_status = 'PUBLISHED' AND deleted_at IS NULL);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public published notes read" ON notes FOR SELECT USING (content_status = 'PUBLISHED' AND deleted_at IS NULL);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public published answers read" ON answers FOR SELECT USING (content_status = 'PUBLISHED');

-- User private tables
CREATE POLICY "Users read their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own progress" ON student_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own study plans" ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own entitlements" ON entitlements FOR SELECT USING (auth.uid() = user_id AND is_active = true);
