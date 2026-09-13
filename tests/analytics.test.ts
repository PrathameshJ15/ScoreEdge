import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '@/lib/db/client';
import {
  ALL_ANALYTICS_EVENT_TYPES,
  AnalyticsEventType,
  FUNNEL_STAGES,
} from '@/lib/analytics/types';
import {
  sanitizeEventProperties,
  sanitizeSearchQuery,
  redactSensitiveText,
  verifyPrivacyCompliance,
  isDoNotTrackRequested,
  SENSITIVE_KEY_DENYLIST,
} from '@/lib/analytics/privacy';
import {
  trackServerEvent,
  getProductAnalyticsDashboard,
  resetTelemetryCounters,
} from '@/lib/analytics/service';
import { calculateFunnelAnalysis, filterEventsByTimeframe } from '@/lib/analytics/funnel';
import { NextRequest } from 'next/server';
import { POST as handleClientEvent } from '@/app/api/analytics/events/route';
import { GET as handleAdminAnalytics } from '@/app/api/admin/analytics/route';
import { createAuthToken } from '@/lib/api/auth';

describe('Privacy-Conscious Product Analytics', () => {
  beforeEach(() => {
    dbStore.reset();
    resetTelemetryCounters();
  });

  describe('1. Data Minimization & Privacy Protection Guardrails', () => {
    it('strictly drops all sensitive student data and credentials from telemetry properties', () => {
      const maliciousPayload = {
        subject_id: 'sub-dbms',
        unit_id: 'unit-1',
        password: 'SuperSecretPassword123!',
        password_hash: '$2b$10$xyz',
        token: 'eyJh.eyJzdWIi.123456',
        secret: 'top_secret',
        email: 'student@example.com',
        user_email: 'pune_student@gmail.com',
        full_name: 'Rahul Sharma',
        name: 'Rahul',
        student_name: 'Rahul Sharma',
        phone: '9876543210',
        mobile: '+919876543210',
        card: '4111222233334444',
        cvv: '123',
        mpin: '4567',
        upi_pin: '9876',
        razorpay_signature: 'abc123hmac',
        ip: '192.168.1.1',
        ip_address: '10.0.0.1',
        user_agent: 'Mozilla/5.0...',
        aadhaar: '1234-5678-9012',
      };

      const { sanitized, blockedKeysCount } = sanitizeEventProperties(maliciousPayload);

      // Safe non-sensitive properties must be preserved
      expect(sanitized.subject_id).toBe('sub-dbms');
      expect(sanitized.unit_id).toBe('unit-1');

      // Every single sensitive key must be dropped
      SENSITIVE_KEY_DENYLIST.forEach((sensitiveKey) => {
        expect(sanitized[sensitiveKey]).toBeUndefined();
      });

      // Blocked keys count must reflect dropped sensitive keys
      expect(blockedKeysCount).toBeGreaterThanOrEqual(18);

      // Must pass privacy compliance verification
      const compliance = verifyPrivacyCompliance(sanitized);
      expect(compliance.compliant).toBe(true);
      expect(compliance.violations.length).toBe(0);
    });

    it('redacts accidental PII (email, phone) within nested objects and freeform strings', () => {
      const rawPayload = {
        action: 'query',
        details: {
          note: 'Contact me at student123@college.edu or 9876543210 regarding syllabus',
          nested: {
            user_input: 'Sent from user@domain.com',
          },
        },
      };

      const { sanitized } = sanitizeEventProperties(rawPayload);

      const note = (sanitized.details as any).note;
      expect(note).toContain('[REDACTED_EMAIL]');
      expect(note).toContain('[REDACTED_PHONE]');
      expect(note).not.toContain('student123@college.edu');
      expect(note).not.toContain('9876543210');

      const nestedInput = (sanitized.details as any).nested.user_input;
      expect(nestedInput).toContain('[REDACTED_EMAIL]');
      expect(nestedInput).not.toContain('user@domain.com');
    });

    it('sanitizes search queries and removes sensitive data', () => {
      const dirtyQuery = 'DBMS notes student@sppu.ac.in call 9876543210';
      const cleaned = sanitizeSearchQuery(dirtyQuery);

      expect(cleaned).toContain('DBMS notes');
      expect(cleaned).toContain('[REDACTED_EMAIL]');
      expect(cleaned).toContain('[REDACTED_PHONE]');
      expect(cleaned).not.toContain('student@sppu.ac.in');
      expect(cleaned).not.toContain('9876543210');
    });

    it('honors Do Not Track (DNT) and Sec-GPC browser privacy signals', () => {
      const dntHeaders = new Headers({ dnt: '1' });
      expect(isDoNotTrackRequested(dntHeaders)).toBe(true);

      const gpcHeaders = new Headers({ 'sec-gpc': '1' });
      expect(isDoNotTrackRequested(gpcHeaders)).toBe(true);

      const standardHeaders = new Headers({ accept: 'application/json' });
      expect(isDoNotTrackRequested(standardHeaders)).toBe(false);

      // Tracking must yield null and not store event when DNT is enabled
      const eventCountBefore = dbStore.analyticsEvents.length;
      const tracked = trackServerEvent('subject opened', {
        headers: dntHeaders,
        properties: { subject_id: 'sub-dbms' },
      });

      expect(tracked).toBeNull();
      expect(dbStore.analyticsEvents.length).toBe(eventCountBefore);
    });
  });

  describe('2. Product Events Coverage', () => {
    it('supports all 16 required product events plus visitor stage', () => {
      const requiredEvents: AnalyticsEventType[] = [
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

      for (const eventName of requiredEvents) {
        expect(ALL_ANALYTICS_EVENT_TYPES).toContain(eventName);

        const event = trackServerEvent(eventName, {
          userId: 'usr-student-1',
          anonymousId: 'vis_test_session',
          properties: {
            subject_id: 'sub-dbms',
            timestamp: Date.now(),
          },
        });

        expect(event).not.toBeNull();
        expect(event?.event_type).toBe(eventName);
        expect(event?.user_id).toBe('usr-student-1');
        expect(event?.properties.subject_id).toBe('sub-dbms');
      }
    });

    it('maintains strict error isolation and never throws on malformed calls', () => {
      // Intentionally pass problematic input
      expect(() => {
        trackServerEvent('login', {
          properties: { circular: null as any },
        });
      }).not.toThrow();

      // Passing undefined options should also be completely safe
      expect(() => {
        trackServerEvent('visitor');
      }).not.toThrow();
    });
  });

  describe('3. Conversion Funnel Tracking (6 Stages)', () => {
    it('tracks the conversion funnel: visitor -> signup -> study activity -> premium interest -> checkout -> purchase', () => {
      // Clear events for isolated funnel calculation
      dbStore.analyticsEvents = [];

      // Student A: completes all 6 stages
      trackServerEvent('visitor', { anonymousId: 'sess_A' });
      trackServerEvent('signup', { anonymousId: 'sess_A', userId: 'usr_A' });
      trackServerEvent('subject opened', { anonymousId: 'sess_A', userId: 'usr_A', properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('premium page viewed', { anonymousId: 'sess_A', userId: 'usr_A' });
      trackServerEvent('checkout started', { anonymousId: 'sess_A', userId: 'usr_A', properties: { product_id: 'prod-dbms-pass' } });
      trackServerEvent('payment completed', { anonymousId: 'sess_A', userId: 'usr_A', properties: { order_id: 'ord-1' } });

      // Student B: reaches checkout (drops off before purchase)
      trackServerEvent('visitor', { anonymousId: 'sess_B' });
      trackServerEvent('signup', { anonymousId: 'sess_B', userId: 'usr_B' });
      trackServerEvent('PYQ viewed', { anonymousId: 'sess_B', userId: 'usr_B', properties: { question_id: 'q-1' } });
      trackServerEvent('premium page viewed', { anonymousId: 'sess_B', userId: 'usr_B' });
      trackServerEvent('checkout started', { anonymousId: 'sess_B', userId: 'usr_B', properties: { product_id: 'prod-sem4-all' } });

      // Student C: study activity only (never views premium)
      trackServerEvent('visitor', { anonymousId: 'sess_C' });
      trackServerEvent('signup', { anonymousId: 'sess_C', userId: 'usr_C' });
      trackServerEvent('quiz started', { anonymousId: 'sess_C', userId: 'usr_C' });
      trackServerEvent('quiz completed', { anonymousId: 'sess_C', userId: 'usr_C' });

      // Student D: signs up but does no study activity
      trackServerEvent('visitor', { anonymousId: 'sess_D' });
      trackServerEvent('signup', { anonymousId: 'sess_D', userId: 'usr_D' });

      // Visitor E: visits landing only, never signs up
      trackServerEvent('visitor', { anonymousId: 'sess_E' });

      const funnel = calculateFunnelAnalysis(dbStore.analyticsEvents, 'all');

      expect(funnel.total_visitors).toBe(5); // A, B, C, D, E
      expect(funnel.total_purchases).toBe(1); // A only
      expect(funnel.overall_conversion_rate_percent).toBe(20); // 1 / 5 = 20%

      expect(funnel.steps.length).toBe(6);

      // Stage 1: visitor
      const step1 = funnel.steps[0];
      expect(step1.stage).toBe('visitor');
      expect(step1.count).toBe(5);
      expect(step1.conversion_from_previous_percent).toBe(100);

      // Stage 2: signup
      const step2 = funnel.steps[1];
      expect(step2.stage).toBe('signup');
      expect(step2.count).toBe(4); // A, B, C, D
      expect(step2.conversion_from_previous_percent).toBe(80); // 4 / 5 = 80%
      expect(step2.drop_off_count).toBe(1); // E dropped off

      // Stage 3: study_activity
      const step3 = funnel.steps[2];
      expect(step3.stage).toBe('study_activity');
      expect(step3.count).toBe(3); // A, B, C
      expect(step3.conversion_from_previous_percent).toBe(75); // 3 / 4 = 75%
      expect(step3.drop_off_count).toBe(1); // D dropped off

      // Stage 4: premium_interest
      const step4 = funnel.steps[3];
      expect(step4.stage).toBe('premium_interest');
      expect(step4.count).toBe(2); // A, B
      expect(step4.conversion_from_previous_percent).toBe(66.7); // 2 / 3 = 66.7%
      expect(step4.drop_off_count).toBe(1); // C dropped off

      // Stage 5: checkout
      const step5 = funnel.steps[4];
      expect(step5.stage).toBe('checkout');
      expect(step5.count).toBe(2); // A, B
      expect(step5.conversion_from_previous_percent).toBe(100); // 2 / 2 = 100%
      expect(step5.drop_off_count).toBe(0);

      // Stage 6: purchase
      const step6 = funnel.steps[5];
      expect(step6.stage).toBe('purchase');
      expect(step6.count).toBe(1); // A
      expect(step6.conversion_from_previous_percent).toBe(50); // 1 / 2 = 50%
      expect(step6.drop_off_count).toBe(1); // B dropped off
    });

    it('filters funnel by timeframe (24h, 7d, 30d, all)', () => {
      const now = Date.now();
      const oldEvent = {
        id: 'evt-old',
        event_type: 'visitor' as AnalyticsEventType,
        anonymous_id: 'vis_old',
        properties: {},
        created_at: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days old
      };
      const recentEvent = {
        id: 'evt-recent',
        event_type: 'visitor' as AnalyticsEventType,
        anonymous_id: 'vis_recent',
        properties: {},
        created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours old
      };

      const events = [oldEvent, recentEvent];

      const allResults = filterEventsByTimeframe(events, 'all');
      expect(allResults.length).toBe(2);

      const past24hResults = filterEventsByTimeframe(events, '24h');
      expect(past24hResults.length).toBe(1);
      expect(past24hResults[0].id).toBe('evt-recent');

      const past7dResults = filterEventsByTimeframe(events, '7d');
      expect(past7dResults.length).toBe(1);

      const past30dResults = filterEventsByTimeframe(events, '30d');
      expect(past30dResults.length).toBe(2);
    });
  });

  describe('4. Admin / Product Insights & Study Metrics', () => {
    it('computes study activity metrics, quiz completion rate, and exam mode completion rate', () => {
      dbStore.analyticsEvents = [];

      // 2 quizzes started, 1 completed
      trackServerEvent('quiz started', { properties: { quiz_id: 'q1' } });
      trackServerEvent('quiz started', { properties: { quiz_id: 'q2' } });
      trackServerEvent('quiz completed', { properties: { quiz_id: 'q1', score: 90 } });

      // 4 exam modes started, 3 completed
      trackServerEvent('Exam Mode started', { properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('Exam Mode started', { properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('Exam Mode started', { properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('Exam Mode started', { properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('Exam Mode completed', { properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('Exam Mode completed', { properties: { subject_id: 'sub-dbms' } });
      trackServerEvent('Exam Mode completed', { properties: { subject_id: 'sub-dbms' } });

      // AI features
      trackServerEvent('AI feature used', { properties: { action: 'summarize_unit' } });
      trackServerEvent('AI feature used', { properties: { action: 'summarize_unit' } });
      trackServerEvent('AI feature used', { properties: { action: 'explain_concept' } });

      // Search performed
      trackServerEvent('search performed', { properties: { sanitized_query: 'normalization bcnf' } });

      const dashboard = getProductAnalyticsDashboard('all');

      expect(dashboard.study_activity.quizzes_started).toBe(2);
      expect(dashboard.study_activity.quizzes_completed).toBe(1);
      expect(dashboard.study_activity.quiz_completion_rate_percent).toBe(50);

      expect(dashboard.study_activity.exam_mode_started).toBe(4);
      expect(dashboard.study_activity.exam_mode_completed).toBe(3);
      expect(dashboard.study_activity.exam_mode_completion_rate_percent).toBe(75);

      expect(dashboard.study_activity.ai_features_used).toBe(3);
      expect(dashboard.study_activity.top_ai_actions[0].action).toBe('summarize_unit');
      expect(dashboard.study_activity.top_ai_actions[0].count).toBe(2);

      expect(dashboard.search_insights.total_searches).toBe(1);
      expect(dashboard.search_insights.top_search_terms[0].term).toBe('normalization bcnf');

      // Privacy audit guarantee
      expect(dashboard.privacy_audit.is_compliant).toBe(true);
      expect(dashboard.privacy_audit.zero_pii_guarantee).toBe(true);
      expect(dashboard.privacy_audit.third_party_trackers_count).toBe(0);
    });
  });

  describe('5. API Routes Integration', () => {
    it('POST /api/analytics/events records client events safely', async () => {
      const req = new NextRequest('http://localhost:3000/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'premium page viewed',
          anonymous_id: 'client_vis_123',
          properties: {
            view: 'pricing_page',
            // Test that if client attempts to pass sensitive field, it is dropped
            email: 'should_be_stripped@sppu.in',
          },
        }),
      });

      const res = await handleClientEvent(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.received).toBe(true);

      // Verify event was saved without sensitive data
      const saved = dbStore.analyticsEvents.find((e) => e.anonymous_id === 'client_vis_123');
      expect(saved).toBeDefined();
      expect(saved?.event_type).toBe('premium page viewed');
      expect(saved?.properties.view).toBe('pricing_page');
      expect(saved?.properties.email).toBeUndefined();
    });

    it('GET /api/admin/analytics enforces role authorization', async () => {
      // 1. Unauthenticated request -> 403
      const unauthReq = new NextRequest('http://localhost:3000/api/admin/analytics');
      const unauthRes = await handleAdminAnalytics(unauthReq);
      expect(unauthRes.status).toBe(403);

      // 2. Student request -> 403
      const studentToken = createAuthToken({
        id: 'usr-student-1',
        email: 'student@scoreedge.in',
        role: 'STUDENT',
      });
      const studentReq = new NextRequest('http://localhost:3000/api/admin/analytics', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentRes = await handleAdminAnalytics(studentReq);
      expect(studentRes.status).toBe(403);

      // 3. Admin request -> 200 with complete dashboard metrics
      const adminToken = createAuthToken({
        id: 'usr-admin-1',
        email: 'admin@scoreedge.in',
        role: 'ADMIN',
      });
      const adminReq = new NextRequest('http://localhost:3000/api/admin/analytics?timeframe=all', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminRes = await handleAdminAnalytics(adminReq);
      expect(adminRes.status).toBe(200);

      const adminJson = await adminRes.json();
      expect(adminJson.data.funnel).toBeDefined();
      expect(adminJson.data.funnel.steps.length).toBe(6);
      expect(adminJson.data.summary).toBeDefined();
      expect(adminJson.data.privacy_audit.zero_pii_guarantee).toBe(true);
    });
  });
});
