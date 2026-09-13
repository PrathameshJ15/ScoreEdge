export type ContentStatus = 'DRAFT' | 'REVIEW' | 'VERIFIED' | 'PUBLISHED' | 'ARCHIVED';

export type UserRole = 'STUDENT' | 'ADMIN' | 'REVIEWER';

export type PriorityLevel = 'MUST_STUDY' | 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionType = 'THEORY' | 'NUMERICAL' | 'MCQ' | 'DIAGRAM' | 'SHORT_ANSWER';

export type ExamSession = 'IN_SEM' | 'END_SEM' | 'RE_EXAM' | 'SUPPLEMENTARY';

export type VerificationStatus = 'UNVERIFIED' | 'NEEDS_REVIEW' | 'VERIFIED' | 'REJECTED';

export type TrendDirection = 'HIGH' | 'STABLE' | 'EMERGING';

export type SourceType =
  | 'OFFICIAL'
  | 'COMMUNITY'
  | 'INTERNAL'
  | 'REFERENCE'
  | 'UNIVERSITY_EXAM_PAPER'
  | 'SYLLABUS_DOCUMENT'
  | 'FACULTY_NOTES'
  | 'STANDARD_TEXTBOOK'
  | 'COMMUNITY_SUBMISSION';

export type ProductType = 'SUBJECT_PASS' | 'SEMESTER_PASS' | 'EXAM_CRASH';

export type OrderStatus = 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentStatus = 'SUCCESS' | 'FAILED';

export type TaskType = 'MUST_READ_NOTE' | 'SOLVE_PYQ' | 'PRACTICE_QUIZ' | 'REVISION';

export type PlanDurationType = '2h' | '5h' | '1d' | '3d' | '7d';

export type ProgressItemType =
  | 'TOPIC'
  | 'NOTE'
  | 'PYQ'
  | 'QUIZ'
  | 'QUESTION'
  | 'EXAM_MODE'
  | 'REVISION';

export type AccessScope = 'SINGLE_SUBJECT' | 'SEMESTER_ALL';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  branch_code?: string | null;
  academic_year?: string | null;
  year_number?: number | null;
  semester_number?: number | null;
  pattern?: string | null;
  target_sgpa?: number | null;
  avatar_url?: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface University {
  id: string;
  code: string;
  name: string;
  state: string;
  country: string;
  website?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pattern {
  id: string;
  university_id: string;
  name: string;
  code: string;
  effective_year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  pattern_id: string;
  branch_id?: string;
  code: 'FE' | 'SE' | 'TE' | 'BE';
  name: string;
  year_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  academic_year_id: string;
  semester_number: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  pattern_id: string;
  branch_id: string;
  semester_id: string;
  code: string;
  name: string;
  short_name: string;
  total_units: number;
  total_credits: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  description: string;
  weightage_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  importance_level: PriorityLevel;
  created_at: string;
  updated_at: string;
}

export interface SyllabusItem {
  id: string;
  unit_id: string;
  topic_id?: string | null;
  content: string;
  reference_materials?: string | null;
  hours_allocated: number;
  content_status?: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentSource {
  id: string;
  name: string;
  source_type: SourceType;
  source_url?: string | null;
  license_type: string;
  copyright_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  subject_id: string;
  unit_id: string;
  topic_id?: string | null;
  question_text: string;
  normalized_question: string;
  marks: number;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  is_pyq: boolean;
  verification_status: VerificationStatus;
  content_status: ContentStatus;
  source_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface QuestionOccurrence {
  id: string;
  question_id: string;
  year: number;
  exam_session: ExamSession;
  question_number: string;
  marks: number;
  pattern_id: string;
  branch_id: string;
  semester_id: string;
  subject_id: string;
  source_id?: string | null;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export type RepetitionType =
  | 'EXACT_REPETITION'
  | 'NEAR_REPETITION'
  | 'CONCEPT_REPETITION'
  | 'WORDING_VARIATION';

export type ClusteringAlgorithm =
  | 'DETERMINISTIC_TOKEN_OVERLAP'
  | 'NGRAM_JACCARD'
  | 'LEVENSHTEIN'
  | 'SEMANTIC_EMBEDDING'
  | 'HYBRID'
  | 'MANUAL';

export type ClusterReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface QuestionCluster {
  id: string;
  subject_id: string;
  unit_id: string;
  topic_id?: string | null;
  canonical_name: string;
  canonical_question: string;
  occurrence_count: number;
  years: number[];
  typical_marks: string;
  confidence_score: number;
  human_approved: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  review_status?: ClusterReviewStatus;
  repetition_summary?: string; // e.g. "Repeated/Similar in 4 verified papers"
  primary_repetition_type?: RepetitionType;
  clustering_algorithm?: ClusteringAlgorithm;
  embedding_model?: string | null; // Reserved for future AI embeddings
  trend: TrendDirection;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface QuestionClusterMember {
  id: string;
  cluster_id: string;
  question_id: string;
  repetition_type?: RepetitionType;
  similarity_score: number;
  lexical_similarity?: number;
  jaccard_similarity?: number;
  embedding_similarity?: number | null; // Reserved for future AI embeddings
  confidence_level?: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  match_explanation?: string;
  added_by?: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  marks_target: 2 | 5 | 10;
  heading: string;
  summary: string;
  key_points: string[];
  diagram_description?: string | null;
  example_text?: string | null;
  evaluator_tips?: string | null;
  is_premium: boolean;
  content_status: ContentStatus;
  author_id?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  subject_id: string;
  unit_id: string;
  topic_id?: string | null;
  title: string;
  slug: string;
  summary: string;
  content_body: string;
  read_time_minutes: number;
  is_free_preview: boolean;
  is_premium: boolean;
  content_status: ContentStatus;
  author_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Quiz {
  id: string;
  subject_id: string;
  unit_id?: string | null;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  difficulty: 'BASIC' | 'EXAM_STANDARD' | 'ADVANCED';
  is_premium: boolean;
  content_status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  marks: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  time_taken_seconds: number;
  completed_at: string;
  answers_json: Record<string, number>;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  user_id: string;
  subject_id: string;
  unit_id?: string | null;
  topic_id?: string | null;
  item_type: ProgressItemType;
  item_id: string;
  is_completed: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  duration_minutes: number;
  topics_covered: string[]; // topic IDs
  questions_practiced: number;
  notes_reviewed: number;
  started_at: string;
  completed_at: string;
  created_at: string;
}

export interface ExamModeRecord {
  id: string;
  user_id: string;
  subject_id: string;
  duration_type: PlanDurationType;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevisionRecord {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string;
  revision_count: number;
  confidence_level: 'CONFIDENT' | 'MODERATE' | 'NEEDS_PRACTICE';
  last_revised_at: string;
  next_recommended_revision_at: string;
  created_at: string;
  updated_at: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  duration_type: PlanDurationType;
  available_hours: number;
  completion_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanTask {
  id: string;
  study_plan_id: string;
  topic_id?: string | null;
  task_title: string;
  task_type: TaskType;
  estimated_minutes: number;
  priority: PriorityLevel;
  is_completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  product_type: ProductType;
  subject_id?: string | null;
  semester_id?: string | null;
  price_inr: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  amount_inr: number;
  currency: string;
  gateway: 'RAZORPAY';
  gateway_order_id?: string | null;
  idempotency_key?: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount_inr: number;
  gateway_payment_id?: string | null;
  gateway_signature?: string | null;
  payment_method?: string | null;
  status: PaymentStatus;
  failure_reason?: string | null;
  refund_id?: string | null;
  refund_amount?: number | null;
  raw_response?: string | null;
  created_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  subject_id?: string | null;
  semester_id?: string | null;
  access_scope: AccessScope;
  expires_at?: string | null;
  is_active: boolean;
  order_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationRecord {
  id: string;
  entity_type: 'QUESTION' | 'ANSWER' | 'NOTE' | 'CLUSTER' | 'SYLLABUS' | 'QUIZ';
  entity_id: string;
  status_from: string;
  status_to: string;
  reviewer_id: string;
  review_notes?: string | null;
  created_at: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FileProcessingStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';
export type KnowledgeSourceMode = 'MY_MATERIAL' | 'SCOREDGE' | 'BOTH';

export interface UserStudyFile {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  mime_type: string;
  status: FileProcessingStatus;
  error_message?: string | null;
  extracted_text?: string;
  chunks_count: number;
  ocr_applied: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface StudyFileChunk {
  id: string;
  file_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  headings?: string[];
  created_at: string;
}

export interface AISession {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  source_mode: KnowledgeSourceMode;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  source_mode: KnowledgeSourceMode;
  citations?: Array<{
    type: 'STUDENT_MATERIAL' | 'SYLLABUS' | 'TOPIC' | 'PYQ' | 'ANSWER' | 'NOTE' | 'CLUSTER';
    id: string;
    title: string;
    snippet?: string;
  }>;
  created_at: string;
}

export type { AnalyticsEvent, AnalyticsEventType } from '../analytics/types';


