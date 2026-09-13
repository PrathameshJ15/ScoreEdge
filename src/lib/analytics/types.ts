export type AnalyticsEventType =
  | 'visitor'
  | 'signup'
  | 'login'
  | 'subject opened'
  | 'topic opened'
  | 'PYQ viewed'
  | 'question practiced'
  | 'quiz started'
  | 'quiz completed'
  | 'syllabus progress'
  | 'premium page viewed'
  | 'checkout started'
  | 'payment completed'
  | 'Exam Mode started'
  | 'Exam Mode completed'
  | 'AI feature used'
  | 'search performed';

export const ALL_ANALYTICS_EVENT_TYPES: AnalyticsEventType[] = [
  'visitor',
  'signup',
  'login',
  'subject opened',
  'topic opened',
  'PYQ viewed',
  'question practiced',
  'quiz started',
  'quiz completed',
  'syllabus progress',
  'premium page viewed',
  'checkout started',
  'payment completed',
  'Exam Mode started',
  'Exam Mode completed',
  'AI feature used',
  'search performed',
];

export type FunnelStage =
  | 'visitor'
  | 'signup'
  | 'study_activity'
  | 'premium_interest'
  | 'checkout'
  | 'purchase';

export const FUNNEL_STAGES: { stage: FunnelStage; label: string; description: string }[] = [
  {
    stage: 'visitor',
    label: 'Visitors',
    description: 'Students who visit ScoreEdge landing, subject catalogues, or public resources.',
  },
  {
    stage: 'signup',
    label: 'Signups',
    description: 'Students who register an academic account.',
  },
  {
    stage: 'study_activity',
    label: 'Study Activity',
    description: 'Students engaging in active learning (PYQs, questions, quizzes, exam mode, syllabus, AI).',
  },
  {
    stage: 'premium_interest',
    label: 'Premium Interest',
    description: 'Students exploring premium pass features or pricing options.',
  },
  {
    stage: 'checkout',
    label: 'Checkout Started',
    description: 'Students initiating a Razorpay/UPI checkout for a pass.',
  },
  {
    stage: 'purchase',
    label: 'Purchase Completed',
    description: 'Students with verified successful pass transactions.',
  },
];

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  anonymous_id: string;
  user_id?: string | null;
  properties: Record<string, unknown>;
  created_at: string;
}

export interface FunnelStepStats {
  stage: FunnelStage;
  label: string;
  description: string;
  count: number;
  conversion_from_previous_percent: number;
  conversion_from_top_percent: number;
  drop_off_count: number;
  drop_off_percent: number;
}

export interface FunnelAnalysis {
  timeframe: '24h' | '7d' | '30d' | 'all';
  total_visitors: number;
  total_purchases: number;
  overall_conversion_rate_percent: number;
  steps: FunnelStepStats[];
}

export interface StudyActivityInsights {
  total_study_events: number;
  pyqs_viewed: number;
  questions_practiced: number;
  quizzes_started: number;
  quizzes_completed: number;
  quiz_completion_rate_percent: number;
  exam_mode_started: number;
  exam_mode_completed: number;
  exam_mode_completion_rate_percent: number;
  syllabus_progress_updates: number;
  ai_features_used: number;
  top_subjects_by_activity: Array<{ subject_id: string; event_count: number }>;
  top_ai_actions: Array<{ action: string; count: number }>;
}

export interface PrivacyComplianceAudit {
  is_compliant: boolean;
  zero_pii_guarantee: boolean;
  total_events_audited: number;
  sensitive_fields_blocked_count: number;
  dnt_signals_honored_count: number;
  anonymized_visitor_ratio_percent: number;
  third_party_trackers_count: 0;
  audit_timestamp: string;
  privacy_notes: string[];
}

export interface ProductAnalyticsDashboardData {
  summary: {
    total_events: number;
    unique_visitors: number;
    active_learners: number;
    total_signups: number;
    total_checkouts: number;
    total_purchases: number;
  };
  funnel: FunnelAnalysis;
  event_type_breakdown: Record<string, number>;
  study_activity: StudyActivityInsights;
  search_insights: {
    total_searches: number;
    top_search_terms: Array<{ term: string; count: number }>;
  };
  privacy_audit: PrivacyComplianceAudit;
}
