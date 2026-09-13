import { z } from 'zod';
import { dbStore } from '@/lib/db/client';
import {
  University,
  Pattern,
  Branch,
  AcademicYear,
  Semester,
  Subject,
  Unit,
  Topic,
  Question,
  PriorityLevel,
  DifficultyLevel,
  QuestionType,
  ContentStatus,
} from '@/lib/db/types';

// ==========================================
// 1. ZOD ONBOARDING SCHEMAS FOR ALL 9 TIERS
// ==========================================

export const UniversityOnboardSchema = z.object({
  code: z.string().min(2).max(16).toUpperCase(),
  name: z.string().min(3).max(128),
  state: z.string().min(2).max(64),
  country: z.string().min(2).max(64).default('India'),
  website: z.string().url().optional().nullable(),
});

export const PatternOnboardSchema = z.object({
  university_id: z.string().min(1),
  code: z.string().min(2).max(32),
  name: z.string().min(3).max(64),
  effective_year: z.number().int().min(2010).max(2035),
  is_active: z.boolean().default(true),
});

export const BranchOnboardSchema = z.object({
  code: z.string().min(2).max(16).toUpperCase(),
  name: z.string().min(3).max(64),
  description: z.string().min(5).max(512),
  is_active: z.boolean().default(true),
});

export const AcademicYearOnboardSchema = z.object({
  pattern_id: z.string().min(1),
  code: z.enum(['FE', 'SE', 'TE', 'BE']),
  name: z.string().min(2).max(64),
  year_number: z.number().int().min(1).max(4),
  is_active: z.boolean().default(true),
});

export const SemesterOnboardSchema = z.object({
  academic_year_id: z.string().min(1),
  semester_number: z.number().int().min(1).max(8),
  name: z.string().min(2).max(64),
  is_active: z.boolean().default(true),
});

export const SubjectOnboardSchema = z.object({
  pattern_id: z.string().min(1),
  branch_id: z.string().min(1),
  semester_id: z.string().min(1),
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(128),
  short_name: z.string().min(2).max(32),
  total_units: z.number().int().min(1).max(10).default(6),
  total_credits: z.number().int().min(1).max(6).default(3),
  is_popular: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const UnitOnboardSchema = z.object({
  subject_id: z.string().min(1),
  unit_number: z.number().int().min(1).max(10),
  title: z.string().min(2).max(128),
  description: z.string().min(5).max(1024),
  weightage_percentage: z.number().min(0).max(100).default(16),
});

export const TopicOnboardSchema = z.object({
  unit_id: z.string().min(1),
  title: z.string().min(2).max(128),
  description: z.string().min(5).max(1024),
  order_index: z.number().int().default(1),
  importance_level: z.enum(['MUST_STUDY', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
});

export const QuestionOnboardSchema = z.object({
  subject_id: z.string().min(1),
  unit_id: z.string().min(1),
  topic_id: z.string().optional().nullable(),
  question_text: z.string().min(5),
  marks: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  question_type: z.enum(['THEORY', 'NUMERICAL', 'MCQ', 'DIAGRAM', 'SHORT_ANSWER']).default('THEORY'),
  is_pyq: z.boolean().default(true),
  content_status: z.enum(['DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

/**
 * Batch Subject Curriculum Onboarding Schema
 * Allows uploading/registering a full subject with all units, topics, and initial questions
 */
export const BatchSubjectCurriculumSchema = z.object({
  subject: SubjectOnboardSchema,
  units: z
    .array(
      z.object({
        unit_number: z.number().int().min(1).max(10),
        title: z.string().min(2),
        description: z.string().min(5),
        weightage_percentage: z.number().min(0).max(100).default(16),
        topics: z
          .array(
            z.object({
              title: z.string().min(2),
              description: z.string().min(5),
              order_index: z.number().int().default(1),
              importance_level: z.enum(['MUST_STUDY', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
            })
          )
          .default([]),
        questions: z
          .array(
            z.object({
              question_text: z.string().min(5),
              marks: z.number().int().min(1).max(20).default(5),
              difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
              question_type: z.enum(['THEORY', 'NUMERICAL', 'MCQ', 'DIAGRAM', 'SHORT_ANSWER']).default('THEORY'),
              is_pyq: z.boolean().default(true),
            })
          )
          .default([]),
      })
    )
    .min(1),
});

export type BatchSubjectCurriculumInput = z.input<typeof BatchSubjectCurriculumSchema>;

// ==========================================
// 2. ONBOARDING EXECUTION PIPELINE
// ==========================================

export class CurriculumOnboardingError extends Error {
  constructor(message: string, public statusCode = 400, public details?: unknown) {
    super(message);
    this.name = 'CurriculumOnboardingError';
  }
}

/**
 * Register a new University.
 */
export function onboardUniversity(input: z.input<typeof UniversityOnboardSchema>): University {
  const payload = UniversityOnboardSchema.parse(input);
  const existing = dbStore.universities.find((u) => u.code.toLowerCase() === payload.code.toLowerCase());
  if (existing) {
    throw new CurriculumOnboardingError(`University with code "${payload.code}" already exists.`);
  }

  const newUni: University = {
    id: `uni-${payload.code.toLowerCase()}`,
    code: payload.code,
    name: payload.name,
    state: payload.state,
    country: payload.country,
    website: payload.website || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.universities.push(newUni);
  return newUni;
}

/**
 * Register a new Curriculum Pattern under an existing University.
 */
export function onboardPattern(input: z.input<typeof PatternOnboardSchema>): Pattern {
  const payload = PatternOnboardSchema.parse(input);
  const uni = dbStore.universities.find((u) => u.id === payload.university_id);
  if (!uni) {
    throw new CurriculumOnboardingError(`University "${payload.university_id}" not found.`);
  }

  const existing = dbStore.patterns.find(
    (p) => p.university_id === payload.university_id && p.code.toLowerCase() === payload.code.toLowerCase()
  );
  if (existing) {
    throw new CurriculumOnboardingError(`Pattern "${payload.code}" already exists for ${uni.name}.`);
  }

  const newPat: Pattern = {
    id: `pat-${payload.code.toLowerCase()}`,
    university_id: payload.university_id,
    name: payload.name,
    code: payload.code,
    effective_year: payload.effective_year,
    is_active: payload.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.patterns.push(newPat);
  return newPat;
}

/**
 * Register a new Academic Branch.
 */
export function onboardBranch(input: z.input<typeof BranchOnboardSchema>): Branch {
  const payload = BranchOnboardSchema.parse(input);
  const existing = dbStore.branches.find((b) => b.code.toLowerCase() === payload.code.toLowerCase());
  if (existing) {
    throw new CurriculumOnboardingError(`Branch with code "${payload.code}" already exists.`);
  }

  const newBranch: Branch = {
    id: `branch-${payload.code.toLowerCase()}`,
    code: payload.code,
    name: payload.name,
    description: payload.description,
    is_active: payload.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.branches.push(newBranch);
  return newBranch;
}

/**
 * Register a new Academic Year under a Pattern.
 */
export function onboardAcademicYear(input: z.input<typeof AcademicYearOnboardSchema>): AcademicYear {
  const payload = AcademicYearOnboardSchema.parse(input);
  const pat = dbStore.patterns.find((p) => p.id === payload.pattern_id);
  if (!pat) {
    throw new CurriculumOnboardingError(`Pattern "${payload.pattern_id}" not found.`);
  }

  const newAy: AcademicYear = {
    id: `ay-${payload.code.toLowerCase()}-${pat.code.toLowerCase()}`,
    pattern_id: payload.pattern_id,
    code: payload.code,
    name: payload.name,
    year_number: payload.year_number,
    is_active: payload.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.academicYears.push(newAy);
  return newAy;
}

/**
 * Register a new Semester under an Academic Year.
 */
export function onboardSemester(input: z.input<typeof SemesterOnboardSchema>): Semester {
  const payload = SemesterOnboardSchema.parse(input);
  const ay = dbStore.academicYears.find((a) => a.id === payload.academic_year_id);
  if (!ay) {
    throw new CurriculumOnboardingError(`Academic year "${payload.academic_year_id}" not found.`);
  }

  const newSem: Semester = {
    id: `sem-${payload.semester_number}`,
    academic_year_id: payload.academic_year_id,
    semester_number: payload.semester_number,
    name: payload.name,
    is_active: payload.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.semesters.push(newSem);
  return newSem;
}

/**
 * Register a new Subject with parent tier integrity verification.
 */
export function onboardSubject(input: z.input<typeof SubjectOnboardSchema>): Subject {
  const payload = SubjectOnboardSchema.parse(input);
  const pat = dbStore.patterns.find((p) => p.id === payload.pattern_id);
  if (!pat) {
    throw new CurriculumOnboardingError(`Pattern "${payload.pattern_id}" not found.`);
  }

  const branch = dbStore.branches.find((b) => b.id === payload.branch_id);
  if (!branch) {
    throw new CurriculumOnboardingError(`Branch "${payload.branch_id}" not found.`);
  }

  const sem = dbStore.semesters.find((s) => s.id === payload.semester_id);
  if (!sem) {
    throw new CurriculumOnboardingError(`Semester "${payload.semester_id}" not found.`);
  }

  const existing = dbStore.subjects.find((s) => s.code.toLowerCase() === payload.code.toLowerCase() && !s.deleted_at);
  if (existing) {
    throw new CurriculumOnboardingError(`Subject with code "${payload.code}" already exists.`);
  }

  const newSubject: Subject = {
    id: `sub-${payload.short_name.toLowerCase()}`,
    pattern_id: payload.pattern_id,
    branch_id: payload.branch_id,
    semester_id: payload.semester_id,
    code: payload.code,
    name: payload.name,
    short_name: payload.short_name,
    total_units: payload.total_units,
    total_credits: payload.total_credits,
    is_popular: payload.is_popular,
    is_active: payload.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.subjects.push(newSubject);
  return newSubject;
}

/**
 * Atomic batch onboarding of a complete subject with units, topics, and questions.
 */
export function onboardBatchSubjectCurriculum(rawInput: BatchSubjectCurriculumInput): {
  subject: Subject;
  units_count: number;
  topics_count: number;
  questions_count: number;
} {
  const input = BatchSubjectCurriculumSchema.parse(rawInput);
  // 1. Create Subject
  const subject = onboardSubject(input.subject);

  let topicsCount = 0;
  let questionsCount = 0;

  // 2. Create Units, Topics, Questions
  for (const unitData of input.units) {
    const unitId = `unit-${subject.short_name.toLowerCase()}-${unitData.unit_number}`;
    const newUnit: Unit = {
      id: unitId,
      subject_id: subject.id,
      unit_number: unitData.unit_number,
      title: unitData.title,
      description: unitData.description,
      weightage_percentage: unitData.weightage_percentage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.units.push(newUnit);

    // Topics
    for (let i = 0; i < unitData.topics.length; i++) {
      const topData = unitData.topics[i];
      const newTopic: Topic = {
        id: `topic-${unitId}-${i + 1}`,
        unit_id: unitId,
        title: topData.title,
        description: topData.description,
        order_index: topData.order_index || i + 1,
        importance_level: topData.importance_level as PriorityLevel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.topics.push(newTopic);
      topicsCount++;
    }

    // Questions
    const unitQuestions = unitData.questions || [];
    for (let j = 0; j < unitQuestions.length; j++) {
      const qData = unitQuestions[j];
      const newQ: Question = {
        id: `q-${unitId}-${j + 1}`,
        subject_id: subject.id,
        unit_id: unitId,
        topic_id: null,
        question_text: qData.question_text,
        normalized_question: qData.question_text.toLowerCase().trim(),
        marks: qData.marks,
        difficulty: qData.difficulty as DifficultyLevel,
        question_type: qData.question_type as QuestionType,
        is_pyq: qData.is_pyq,
        verification_status: 'VERIFIED',
        content_status: 'PUBLISHED',
        source_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.questions.push(newQ);
      questionsCount++;
    }
  }

  return {
    subject,
    units_count: input.units.length,
    topics_count: topicsCount,
    questions_count: questionsCount,
  };
}

/**
 * System-wide integrity audit checking for orphaned records or invalid references across the 9 tiers.
 */
export function auditCurriculumIntegrity(): {
  is_healthy: boolean;
  total_universities: number;
  total_patterns: number;
  total_branches: number;
  total_subjects: number;
  total_units: number;
  total_topics: number;
  total_questions: number;
  orphans: {
    patterns_missing_university: string[];
    subjects_missing_pattern: string[];
    subjects_missing_branch: string[];
    subjects_missing_semester: string[];
    units_missing_subject: string[];
    topics_missing_unit: string[];
    questions_missing_unit: string[];
  };
} {
  const uniIds = new Set(dbStore.universities.map((u) => u.id));
  const patIds = new Set(dbStore.patterns.map((p) => p.id));
  const branchIds = new Set(dbStore.branches.map((b) => b.id));
  const semIds = new Set(dbStore.semesters.map((s) => s.id));
  const subIds = new Set(dbStore.subjects.filter((s) => !s.deleted_at).map((s) => s.id));
  const unitIds = new Set(dbStore.units.map((u) => u.id));

  const patternsMissingUni = dbStore.patterns.filter((p) => !uniIds.has(p.university_id)).map((p) => p.id);
  const subjectsMissingPat = dbStore.subjects.filter((s) => !s.deleted_at && !patIds.has(s.pattern_id)).map((s) => s.id);
  const subjectsMissingBranch = dbStore.subjects.filter((s) => !s.deleted_at && !branchIds.has(s.branch_id)).map((s) => s.id);
  const subjectsMissingSem = dbStore.subjects.filter((s) => !s.deleted_at && !semIds.has(s.semester_id)).map((s) => s.id);
  const unitsMissingSub = dbStore.units.filter((u) => !subIds.has(u.subject_id)).map((u) => u.id);
  const topicsMissingUnit = dbStore.topics.filter((t) => !unitIds.has(t.unit_id)).map((t) => t.id);
  const questionsMissingUnit = dbStore.questions.filter((q) => !q.deleted_at && !unitIds.has(q.unit_id)).map((q) => q.id);

  const totalOrphans =
    patternsMissingUni.length +
    subjectsMissingPat.length +
    subjectsMissingBranch.length +
    subjectsMissingSem.length +
    unitsMissingSub.length +
    topicsMissingUnit.length +
    questionsMissingUnit.length;

  return {
    is_healthy: totalOrphans === 0,
    total_universities: dbStore.universities.length,
    total_patterns: dbStore.patterns.length,
    total_branches: dbStore.branches.length,
    total_subjects: dbStore.subjects.filter((s) => !s.deleted_at).length,
    total_units: dbStore.units.length,
    total_topics: dbStore.topics.length,
    total_questions: dbStore.questions.filter((q) => !q.deleted_at).length,
    orphans: {
      patterns_missing_university: patternsMissingUni,
      subjects_missing_pattern: subjectsMissingPat,
      subjects_missing_branch: subjectsMissingBranch,
      subjects_missing_semester: subjectsMissingSem,
      units_missing_subject: unitsMissingSub,
      topics_missing_unit: topicsMissingUnit,
      questions_missing_unit: questionsMissingUnit,
    },
  };
}
