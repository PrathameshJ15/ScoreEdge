-- ============================================================================
-- ScoreEdge SPPU Exam Intelligence Platform
-- Production PostgreSQL Seed Data
-- ============================================================================

-- 1. UNIVERSITY
INSERT INTO universities (id, code, name, state, country, website)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'SPPU', 'Savitribai Phule Pune University', 'Maharashtra', 'India', 'http://www.unipune.ac.in')
ON CONFLICT (code) DO NOTHING;

-- 2. PATTERNS
INSERT INTO patterns (id, university_id, name, code, effective_year, is_active)
VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2024 Pattern (NEP)', '2024-pattern', 2024, TRUE),
    ('22222222-2222-2222-2222-333333333333', '11111111-1111-1111-1111-111111111111', '2019 Pattern', '2019-pattern', 2019, TRUE)
ON CONFLICT (university_id, code) DO NOTHING;

-- 3. BRANCHES
INSERT INTO branches (id, code, name, description, is_active)
VALUES
    ('33333333-3333-3333-3333-111111111111', 'COMP', 'Computer Engineering', 'SPPU 2024 & 2019 Pattern syllabus, PYQ intelligence, and exam-focused notes for SE, TE, and BE.', TRUE),
    ('33333333-3333-3333-3333-222222222222', 'IT', 'Information Technology', 'Comprehensive exam intelligence for IT subjects across semesters.', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'AI-DS', 'Artificial Intelligence & Data Science', 'Specialized notes, PYQs, and priority models for AI & Data Science.', TRUE),
    ('33333333-3333-3333-3333-444444444444', 'E&TC', 'Electronics & Telecommunication', 'Exam preparation tools for Core E&TC subjects.', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 4. ACADEMIC YEARS & SEMESTERS
INSERT INTO academic_years (id, pattern_id, code, name, year_number, is_active)
VALUES
    ('44444444-4444-4444-4444-111111111111', '22222222-2222-2222-2222-222222222222', 'SE', 'Second Year Engineering', 2, TRUE)
ON CONFLICT (pattern_id, code) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, semester_number, name, is_active)
VALUES
    ('55555555-5555-5555-5555-111111111111', '44444444-4444-4444-4444-111111111111', 3, 'Semester 3', TRUE),
    ('55555555-5555-5555-5555-222222222222', '44444444-4444-4444-4444-111111111111', 4, 'Semester 4', TRUE)
ON CONFLICT (academic_year_id, semester_number) DO NOTHING;

-- 5. SUBJECTS (5 SE COMPUTER SUBJECTS)
INSERT INTO subjects (id, pattern_id, branch_id, semester_id, code, name, short_name, total_units, total_credits, is_popular, is_active)
VALUES
    ('66666666-6666-6666-6666-000000000001', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-111111111111', '55555555-5555-5555-5555-111111111111', '210241', 'Database Management Systems', 'DBMS', 6, 3, TRUE, TRUE),
    ('66666666-6666-6666-6666-000000000002', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-111111111111', '55555555-5555-5555-5555-111111111111', '210242', 'Data Structures & Algorithms', 'DSA', 6, 3, TRUE, TRUE),
    ('66666666-6666-6666-6666-000000000003', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-111111111111', '55555555-5555-5555-5555-111111111111', '210243', 'Object Oriented Programming', 'OOP', 6, 3, TRUE, TRUE),
    ('66666666-6666-6666-6666-000000000004', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-111111111111', '55555555-5555-5555-5555-222222222222', '210244', 'Operating Systems', 'OS', 6, 3, TRUE, TRUE),
    ('66666666-6666-6666-6666-000000000005', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-111111111111', '55555555-5555-5555-5555-222222222222', '210245', 'Theory of Computation', 'TOC', 6, 3, FALSE, TRUE)
ON CONFLICT (pattern_id, branch_id, code) DO NOTHING;

-- 6. UNITS FOR DBMS
INSERT INTO units (id, subject_id, unit_number, title, description, weightage_percentage)
VALUES
    ('77777777-7777-7777-7777-000000000001', '66666666-6666-6666-6666-000000000001', 1, 'Introduction to DBMS & ER Modeling', 'Database architecture, 3-schema architecture, ER diagrams, Strong vs Weak Entity sets.', 15),
    ('77777777-7777-7777-7777-000000000002', '66666666-6666-6666-6666-000000000001', 2, 'Relational Model & Relational Algebra', 'Codd rules, Relational Algebra operators, SQL queries, Join operations.', 18),
    ('77777777-7777-7777-7777-000000000003', '66666666-6666-6666-6666-000000000001', 3, 'Database Design & Normalization', 'Functional Dependencies, 1NF, 2NF, 3NF, BCNF, Lossless Join, Dependency Preservation.', 24),
    ('77777777-7777-7777-7777-000000000004', '66666666-6666-6666-6666-000000000001', 4, 'Transaction Management & Concurrency Control', 'ACID properties, Schedule Serializability, 2PL, Deadlocks.', 20),
    ('77777777-7777-7777-7777-000000000005', '66666666-6666-6666-6666-000000000001', 5, 'Database Recovery Systems', 'Log-based recovery, Checkpointing, Shadow Paging, ARIES algorithm.', 13),
    ('77777777-7777-7777-7777-000000000006', '66666666-6666-6666-6666-000000000001', 6, 'NoSQL Databases & Distributed Databases', 'CAP Theorem, MongoDB vs SQL, Key-Value stores, Document stores.', 10)
ON CONFLICT (subject_id, unit_number) DO NOTHING;

-- 7. USERS (ADMIN & TEST STUDENT)
INSERT INTO users (id, email, password_hash, full_name, role, email_verified, is_active)
VALUES
    ('99999999-9999-9999-9999-000000000001', 'admin@scoreedge.in', 'scrypt$16384$8$1$c2FsdHNhbHQ$hashedadminpassword', 'ScoreEdge Admin', 'ADMIN', TRUE, TRUE),
    ('99999999-9999-9999-9999-000000000002', 'student@sppu.ac.in', 'scrypt$16384$8$1$c2FsdHNhbHQ$hashedstudentpassword', 'Prathamesh Jadhav', 'STUDENT', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 8. PRODUCTS
INSERT INTO products (id, code, name, description, product_type, price_inr, is_active)
VALUES
    ('88888888-8888-8888-8888-000000000001', 'PROD_FREE', 'Free Explorer', 'Basic syllabus, select PYQs and notes forever free', 'SUBJECT_PASS', 0, TRUE),
    ('88888888-8888-8888-8888-000000000002', 'PROD_SUB_DBMS', 'DBMS Single Subject Pass', 'Complete DBMS solved answers, PYQ intelligence, and Exam Mode', 'SUBJECT_PASS', 49, TRUE),
    ('88888888-8888-8888-8888-000000000003', 'PROD_SEM3_COMP', 'SE Computer Semester Pass', 'Full access to all 5 SE Computer subjects for the semester', 'SEMESTER_PASS', 199, TRUE)
ON CONFLICT (code) DO NOTHING;
