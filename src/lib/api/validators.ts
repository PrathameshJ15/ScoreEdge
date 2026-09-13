import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'ADMIN', 'REVIEWER']).default('STUDENT'),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SubjectCreateSchema = z.object({
  pattern_id: z.string().min(1),
  branch_id: z.string().min(1),
  semester_id: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
  short_name: z.string().min(2),
  total_units: z.number().int().min(1).max(10).default(6),
  total_credits: z.number().int().min(1).default(3),
  is_popular: z.boolean().default(false),
});

export const UnitCreateSchema = z.object({
  subject_id: z.string().min(1),
  unit_number: z.number().int().min(1).max(8),
  title: z.string().min(2),
  description: z.string().min(5),
  weightage_percentage: z.number().min(0).max(100).default(16),
});

export const TopicCreateSchema = z.object({
  unit_id: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(5),
  order_index: z.number().int().default(1),
  importance_level: z.enum(['MUST_STUDY', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
});

export const SyllabusCreateSchema = z.object({
  unit_id: z.string().min(1),
  topic_id: z.string().optional().nullable(),
  content: z.string().min(5),
  reference_materials: z.string().optional().nullable(),
  hours_allocated: z.number().int().default(6),
  content_status: z.enum(['DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const QuestionCreateSchema = z.object({
  subject_id: z.string().min(1),
  unit_id: z.string().min(1),
  topic_id: z.string().optional().nullable(),
  question_text: z.string().min(5),
  normalized_question: z.string().optional(),
  marks: z.number().int().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  question_type: z.enum(['THEORY', 'NUMERICAL', 'MCQ', 'DIAGRAM', 'SHORT_ANSWER']).default('THEORY'),
  is_pyq: z.boolean().default(true),
  verification_status: z.enum(['UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED']).default('UNVERIFIED'),
  content_status: z.enum(['DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  source_id: z.string().optional().nullable(),
});

export const AnswerCreateSchema = z.object({
  question_id: z.string().min(1),
  marks_target: z.enum(['2', '5', '10']).transform(Number).pipe(z.union([z.literal(2), z.literal(5), z.literal(10)])),
  heading: z.string().min(3),
  summary: z.string().min(5),
  key_points: z.array(z.string()).min(1),
  diagram_description: z.string().optional().nullable(),
  example_text: z.string().optional().nullable(),
  evaluator_tips: z.string().optional().nullable(),
  is_premium: z.boolean().default(false),
  content_status: z.enum(['DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const NoteCreateSchema = z.object({
  subject_id: z.string().min(1),
  unit_id: z.string().min(1),
  topic_id: z.string().optional().nullable(),
  title: z.string().min(3),
  slug: z.string().min(2),
  summary: z.string().min(5),
  content_body: z.string().min(10),
  read_time_minutes: z.number().int().default(5),
  is_free_preview: z.boolean().default(true),
  is_premium: z.boolean().default(false),
  content_status: z.enum(['DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const QuizCreateSchema = z.object({
  subject_id: z.string().min(1),
  unit_id: z.string().optional().nullable(),
  title: z.string().min(3),
  description: z.string().min(5),
  duration_minutes: z.number().int().default(15),
  total_questions: z.number().int().default(10),
  passing_score: z.number().int().default(60),
  difficulty: z.enum(['BASIC', 'EXAM_STANDARD', 'ADVANCED']).default('EXAM_STANDARD'),
  is_premium: z.boolean().default(false),
});

export const QuizAttemptSubmitSchema = z.object({
  quiz_id: z.string().min(1),
  answers: z.record(z.string(), z.number()),
  time_taken_seconds: z.number().int().min(1),
});

export const ProgressToggleSchema = z.object({
  subject_id: z.string().min(1),
  unit_id: z.string().optional().nullable(),
  topic_id: z.string().optional().nullable(),
  item_type: z.enum(['TOPIC', 'NOTE', 'PYQ', 'QUIZ', 'QUESTION', 'EXAM_MODE', 'REVISION']),
  item_id: z.string().min(1),
  is_completed: z.boolean(),
});

export const StudySessionCreateSchema = z.object({
  subject_id: z.string().min(1),
  duration_minutes: z.number().int().min(1).max(1440),
  topics_covered: z.array(z.string()).default([]),
  questions_practiced: z.number().int().min(0).default(0),
  notes_reviewed: z.number().int().min(0).default(0),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
});

export const RevisionRecordSchema = z.object({
  subject_id: z.string().min(1),
  topic_id: z.string().min(1),
  confidence_level: z.enum(['CONFIDENT', 'MODERATE', 'NEEDS_PRACTICE']),
});

export const ExamModeRecordSchema = z.object({
  subject_id: z.string().min(1),
  duration_type: z.enum(['2h', '5h', '1d', '3d', '7d']),
  total_tasks: z.number().int().min(1),
  completed_tasks: z.number().int().min(0),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
});

export const StudyPlanGenerateSchema = z.object({
  subject_id: z.string().min(1),
  duration_type: z.enum(['2h', '5h', '1d', '3d', '7d']),
  available_hours: z.number().min(0.5).max(100),
});

export const VerificationActionSchema = z.object({
  entity_type: z.enum(['QUESTION', 'ANSWER', 'NOTE', 'CLUSTER', 'SYLLABUS', 'QUIZ']),
  entity_id: z.string().min(1),
  status: z.enum(['DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED']),
  review_notes: z.string().optional(),
});

export const AIQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  subject_id: z.string().optional(),
  unit_id: z.string().optional(),
  topic_id: z.string().optional(),
  task_type: z
    .enum([
      'EXPLAIN',
      'TEACH_ME',
      'EXAM_ANSWER',
      'QUIZ_ME',
      'STUDY_PLAN',
      'REVISE',
      'ASK_SCOREEDGE',
      // Legacy aliases
      'CONCEPT_EXPLANATION',
      'MODEL_ANSWER',
      'REVISION_GUIDANCE',
      'GENERAL_QUERY',
    ])
    .default('EXPLAIN'),
  marks_target: z
    .union([z.literal(2), z.literal(5), z.literal(10), z.literal('2'), z.literal('5'), z.literal('10')])
    .transform(Number)
    .pipe(z.union([z.literal(2), z.literal(5), z.literal(10)]))
    .optional(),
  action: z.string().optional(),
  source_mode: z.enum(['MY_MATERIAL', 'SCOREDGE', 'BOTH']).default('BOTH'),
  file_ids: z.array(z.string()).optional(),
  quick_action: z
    .enum([
      'SUMMARIZE',
      '2_MARK',
      '5_MARK',
      '10_MARK',
      'IMPORTANT_QUESTIONS',
      'QUIZ_ME_FROM_THIS',
      'REVISE_THIS',
      'EXPLAIN_SIMPLY',
    ])
    .optional(),
  session_id: z.string().optional(),
});

export const UniversityCreateSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  state: z.string().min(2),
  country: z.string().default('India'),
  website: z.string().url().optional().nullable(),
});

export const PatternCreateSchema = z.object({
  university_id: z.string().min(1),
  name: z.string().min(2),
  code: z.string().min(2),
  effective_year: z.number().int().min(2000),
  is_active: z.boolean().default(true),
});

export const BranchCreateSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().default(''),
  is_active: z.boolean().default(true),
});

export const AcademicYearCreateSchema = z.object({
  pattern_id: z.string().min(1),
  code: z.enum(['FE', 'SE', 'TE', 'BE']),
  name: z.string().min(2),
  year_number: z.number().int().min(1).max(5),
  is_active: z.boolean().default(true),
});

export const SemesterCreateSchema = z.object({
  academic_year_id: z.string().min(1),
  semester_number: z.number().int().min(1).max(10),
  name: z.string().min(2),
  is_active: z.boolean().default(true),
});

export const ContentSourceCreateSchema = z.object({
  name: z.string().min(3),
  source_type: z.enum([
    'UNIVERSITY_EXAM_PAPER',
    'SYLLABUS_DOCUMENT',
    'FACULTY_NOTES',
    'STANDARD_TEXTBOOK',
    'COMMUNITY_SUBMISSION',
  ]).default('UNIVERSITY_EXAM_PAPER'),
  source_url: z.string().optional().nullable(),
  license_type: z.string().default('Academic Fair Use / Official SPPU'),
  copyright_notes: z.string().optional().nullable(),
});

export const QuestionOccurrenceCreateSchema = z.object({
  question_id: z.string().min(1),
  year: z.number().int().min(2000),
  exam_session: z.enum(['IN_SEM', 'END_SEM', 'RE_EXAM', 'SUPPLEMENTARY']).default('IN_SEM'),
  question_number: z.string().min(1),
  marks: z.number().int().min(1),
  pattern_id: z.string().min(1),
  branch_id: z.string().min(1),
  semester_id: z.string().min(1),
  subject_id: z.string().min(1),
  source_id: z.string().optional().nullable(),
  verification_status: z.enum(['UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED']).default('VERIFIED'),
});

export const UnifiedSearchQuerySchema = z.object({
  q: z.string().default(''),
  university_id: z.string().optional(),
  pattern_id: z.string().optional(),
  branch_id: z.string().optional(),
  academic_year_id: z.string().optional(),
  semester_id: z.string().optional(),
  subject_id: z.string().optional(),
  unit_id: z.string().optional(),
  category: z
    .enum(['ALL', 'TOPICS', 'QUESTIONS', 'PYQS', 'NOTES', 'ANSWERS'])
    .default('ALL'),
  priority: z
    .enum(['MUST_STUDY', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW'])
    .optional(),
  marks: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined)),
  limit: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : 30)),
});
