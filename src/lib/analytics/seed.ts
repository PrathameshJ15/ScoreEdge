import { AnalyticsEvent } from './types';

/**
 * Realistic seed events showing the 6-stage funnel:
 * visitor -> signup -> study activity -> premium interest -> checkout -> purchase
 * 
 * 100% compliant with privacy rules:
 * - No passwords
 * - No personal student emails or names
 * - Only academic resource IDs and non-sensitive telemetry
 */

const baseTimestamp = new Date('2026-09-01T10:00:00Z').getTime();

export const SEED_ANALYTICS_EVENTS: AnalyticsEvent[] = [
  // Visitor stage (Students discovering the platform)
  {
    id: 'evt-seed-01',
    event_type: 'visitor',
    anonymous_id: 'vis_sess_101',
    properties: { path: '/', referrer: 'direct' },
    created_at: new Date(baseTimestamp).toISOString(),
  },
  {
    id: 'evt-seed-02',
    event_type: 'visitor',
    anonymous_id: 'vis_sess_102',
    properties: { path: '/explore', referrer: 'google' },
    created_at: new Date(baseTimestamp + 60000).toISOString(),
  },
  {
    id: 'evt-seed-03',
    event_type: 'visitor',
    anonymous_id: 'vis_sess_103',
    properties: { path: '/subject/sub-dbms', referrer: 'college_group' },
    created_at: new Date(baseTimestamp + 120000).toISOString(),
  },
  {
    id: 'evt-seed-04',
    event_type: 'visitor',
    anonymous_id: 'vis_sess_104',
    properties: { path: '/subject/sub-dbms', referrer: 'direct' },
    created_at: new Date(baseTimestamp + 180000).toISOString(),
  },
  {
    id: 'evt-seed-05',
    event_type: 'visitor',
    anonymous_id: 'vis_sess_105',
    properties: { path: '/pricing', referrer: 'whatsapp' },
    created_at: new Date(baseTimestamp + 240000).toISOString(),
  },

  // Signup stage
  {
    id: 'evt-seed-06',
    event_type: 'signup',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { role: 'STUDENT', source: 'organic_landing' },
    created_at: new Date(baseTimestamp + 300000).toISOString(),
  },
  {
    id: 'evt-seed-07',
    event_type: 'signup',
    anonymous_id: 'vis_sess_102',
    user_id: 'usr-student-2',
    properties: { role: 'STUDENT', source: 'explore_page' },
    created_at: new Date(baseTimestamp + 360000).toISOString(),
  },
  {
    id: 'evt-seed-08',
    event_type: 'signup',
    anonymous_id: 'vis_sess_103',
    user_id: 'usr-student-3',
    properties: { role: 'STUDENT', source: 'subject_view' },
    created_at: new Date(baseTimestamp + 420000).toISOString(),
  },
  {
    id: 'evt-seed-09',
    event_type: 'signup',
    anonymous_id: 'vis_sess_104',
    user_id: 'usr-student-4',
    properties: { role: 'STUDENT', source: 'direct' },
    created_at: new Date(baseTimestamp + 480000).toISOString(),
  },

  // Login events
  {
    id: 'evt-seed-10',
    event_type: 'login',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { auth_method: 'password' },
    created_at: new Date(baseTimestamp + 540000).toISOString(),
  },

  // Study Activity: Subject opened & Topic opened
  {
    id: 'evt-seed-11',
    event_type: 'subject opened',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { subject_id: 'sub-dbms', subject_code: '210243' },
    created_at: new Date(baseTimestamp + 600000).toISOString(),
  },
  {
    id: 'evt-seed-12',
    event_type: 'topic opened',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { subject_id: 'sub-dbms', topic_id: 'top-dbms-1', topic_title: 'ER Modeling' },
    created_at: new Date(baseTimestamp + 660000).toISOString(),
  },
  {
    id: 'evt-seed-13',
    event_type: 'PYQ viewed',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { question_id: 'q-dbms-001', marks: 10, recurrence_frequency: 5 },
    created_at: new Date(baseTimestamp + 720000).toISOString(),
  },
  {
    id: 'evt-seed-14',
    event_type: 'question practiced',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { question_id: 'q-dbms-001', marks: 10 },
    created_at: new Date(baseTimestamp + 780000).toISOString(),
  },
  {
    id: 'evt-seed-15',
    event_type: 'syllabus progress',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { subject_id: 'sub-dbms', item_type: 'TOPIC', is_completed: true },
    created_at: new Date(baseTimestamp + 840000).toISOString(),
  },

  // Study Activity: Quizzes
  {
    id: 'evt-seed-16',
    event_type: 'quiz started',
    anonymous_id: 'vis_sess_102',
    user_id: 'usr-student-2',
    properties: { quiz_id: 'quiz-dbms-u1', subject_id: 'sub-dbms' },
    created_at: new Date(baseTimestamp + 900000).toISOString(),
  },
  {
    id: 'evt-seed-17',
    event_type: 'quiz completed',
    anonymous_id: 'vis_sess_102',
    user_id: 'usr-student-2',
    properties: { quiz_id: 'quiz-dbms-u1', subject_id: 'sub-dbms', score: 90, passed: true },
    created_at: new Date(baseTimestamp + 960000).toISOString(),
  },

  // Study Activity: Exam Mode
  {
    id: 'evt-seed-18',
    event_type: 'Exam Mode started',
    anonymous_id: 'vis_sess_103',
    user_id: 'usr-student-3',
    properties: { subject_id: 'sub-dbms', duration_type: '5h', total_tasks: 8 },
    created_at: new Date(baseTimestamp + 1020000).toISOString(),
  },
  {
    id: 'evt-seed-19',
    event_type: 'Exam Mode completed',
    anonymous_id: 'vis_sess_103',
    user_id: 'usr-student-3',
    properties: { subject_id: 'sub-dbms', duration_type: '5h', completion_rate: 100 },
    created_at: new Date(baseTimestamp + 1080000).toISOString(),
  },

  // AI feature used & Search performed
  {
    id: 'evt-seed-20',
    event_type: 'AI feature used',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { action: 'explain_concept', subject_id: 'sub-dbms', task_type: 'EXPLAIN' },
    created_at: new Date(baseTimestamp + 1140000).toISOString(),
  },
  {
    id: 'evt-seed-21',
    event_type: 'search performed',
    anonymous_id: 'vis_sess_102',
    user_id: 'usr-student-2',
    properties: { sanitized_query: 'b-tree indexing', results_count: 4 },
    created_at: new Date(baseTimestamp + 1200000).toISOString(),
  },

  // Stage 4: Premium interest (Premium page viewed)
  {
    id: 'evt-seed-22',
    event_type: 'premium page viewed',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { source_trigger: 'locked_diagram_click' },
    created_at: new Date(baseTimestamp + 1260000).toISOString(),
  },
  {
    id: 'evt-seed-23',
    event_type: 'premium page viewed',
    anonymous_id: 'vis_sess_102',
    user_id: 'usr-student-2',
    properties: { source_trigger: 'pricing_navbar_link' },
    created_at: new Date(baseTimestamp + 1320000).toISOString(),
  },
  {
    id: 'evt-seed-24',
    event_type: 'premium page viewed',
    anonymous_id: 'vis_sess_103',
    user_id: 'usr-student-3',
    properties: { source_trigger: 'exam_mode_banner' },
    created_at: new Date(baseTimestamp + 1380000).toISOString(),
  },

  // Stage 5: Checkout started
  {
    id: 'evt-seed-25',
    event_type: 'checkout started',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { product_id: 'prod-dbms-pass', amount_inr: 49 },
    created_at: new Date(baseTimestamp + 1440000).toISOString(),
  },
  {
    id: 'evt-seed-26',
    event_type: 'checkout started',
    anonymous_id: 'vis_sess_102',
    user_id: 'usr-student-2',
    properties: { product_id: 'prod-sem4-all', amount_inr: 199 },
    created_at: new Date(baseTimestamp + 1500000).toISOString(),
  },

  // Stage 6: Purchase completed
  {
    id: 'evt-seed-27',
    event_type: 'payment completed',
    anonymous_id: 'vis_sess_101',
    user_id: 'usr-student-1',
    properties: { order_id: 'ord-101', product_id: 'prod-dbms-pass', amount_inr: 49, payment_method: 'UPI' },
    created_at: new Date(baseTimestamp + 1560000).toISOString(),
  },
];
