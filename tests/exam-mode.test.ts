import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  generateExamModePlan,
  calculateExamCountdown,
  DURATION_CONFIGS,
  ExamDurationType,
} from '@/lib/intelligence/examModeEngine';
import { dbStore } from '@/lib/db/client';
import { GET as getStudyPlanHandler, POST as postStudyPlanHandler } from '@/app/api/study-plans/route';
import { createAuthToken } from '@/lib/api/auth';
import { User } from '@/lib/db/types';

describe('ScoreEdge Exam Mode Engine & Sequences', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. Duration Selection (All 5 Durations Supported)', () => {
    const durations: ExamDurationType[] = ['2h', '5h', '1d', '3d', '7d'];

    durations.forEach((dur) => {
      it(`generates actionable plan for duration '${dur}'`, () => {
        const plan = generateExamModePlan({
          subjectId: 'sub-dbms',
          durationType: dur,
        });

        expect(plan.subjectId).toBe('sub-dbms');
        expect(plan.durationType).toBe(dur);
        expect(plan.totalAvailableMinutes).toBe(DURATION_CONFIGS[dur].totalMinutes);
        expect(plan.totalTasksCount).toBeGreaterThan(0);
        expect(plan.phases.length).toBe(5);
      });
    });
  });

  describe('2. Required 5-Phase Study Sequence', () => {
    it('generates the exact 5 required phases in sequence', () => {
      const plan = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '5h',
      });

      const phaseKeys = plan.phases.map((p) => p.phase);
      expect(phaseKeys).toEqual([
        'PRIORITY_1_MUST_STUDY',
        'PRIORITY_2_HIGH',
        'FINAL_REVISION',
        'PYQ_PRACTICE',
        'QUIZ',
      ]);

      const phaseTitles = plan.phases.map((p) => p.title);
      expect(phaseTitles[0]).toBe('Priority 1 — MUST STUDY');
      expect(phaseTitles[1]).toBe('Priority 2 — HIGH');
      expect(phaseTitles[2]).toBe('Final Revision');
      expect(phaseTitles[3]).toBe('PYQ Practice');
      expect(phaseTitles[4]).toBe('Quiz');
    });

    it('allocates time budgets across all 5 phases', () => {
      const plan = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '2h',
      });

      plan.phases.forEach((phase) => {
        expect(phase.totalMinutes).toBeGreaterThan(0);
        expect(phase.tasks.length).toBeGreaterThan(0);
      });

      const totalPlanMinutes = plan.phases.reduce((sum, p) => sum + p.totalMinutes, 0);
      expect(totalPlanMinutes).toBeGreaterThanOrEqual(100);
      expect(totalPlanMinutes).toBeLessThanOrEqual(140);
    });
  });

  describe('3. Task Details: Topic, Priority Reason, Marks & Time Allocation', () => {
    it('includes clear topic name, time allocation, and empirical reason for priority', () => {
      const plan = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '5h',
      });

      // Check Phase 1 (MUST STUDY) tasks
      const p1 = plan.phases[0];
      expect(p1.tasks.length).toBeGreaterThan(0);

      p1.tasks.forEach((task) => {
        expect(task.topicTitle).toBeDefined();
        expect(task.actionTitle).toBeDefined();
        expect(task.estimatedMinutes).toBeGreaterThan(0);
        expect(task.reasonForPriority).toBeDefined();
        // Reason must be grounded and non-empty
        expect(task.reasonForPriority.length).toBeGreaterThan(5);
        expect(task.isCompleted).toBe(false);
      });
    });

    it('never makes guaranteed question predictions', () => {
      const plan = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '1d',
      });

      // Disclaimer must state not an official prediction
      expect(plan.disclaimer).toContain('Not an official prediction');
      expect(plan.disclaimer).not.toContain('100% guaranteed');
      expect(plan.disclaimer).not.toContain('certain exam questions');

      // Check all tasks for prohibited prediction claims
      plan.phases.forEach((p) => {
        p.tasks.forEach((t) => {
          expect(t.reasonForPriority.toLowerCase()).not.toContain('guaranteed');
          expect(t.reasonForPriority.toLowerCase()).not.toContain('100% leak');
          expect(t.actionTitle.toLowerCase()).not.toContain('certain question');
        });
      });
    });
  });

  describe('4. Dynamic Progress & Remaining Time Calculation', () => {
    it('recalculates remaining time and completion percentage as tasks are completed', () => {
      const initialPlan = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '2h',
      });

      expect(initialPlan.completedTasksCount).toBe(0);
      expect(initialPlan.completionPercentage).toBe(0);
      const initialRemaining = initialPlan.remainingMinutes;

      // Complete first two tasks
      const task1Id = initialPlan.phases[0].tasks[0].id;
      const task2Id = initialPlan.phases[0].tasks[1].id;
      const task1Minutes = initialPlan.phases[0].tasks[0].estimatedMinutes;
      const task2Minutes = initialPlan.phases[0].tasks[1].estimatedMinutes;

      const updatedPlan = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '2h',
        completedTaskIds: [task1Id, task2Id],
      });

      expect(updatedPlan.completedTasksCount).toBe(2);
      expect(updatedPlan.completionPercentage).toBeGreaterThan(0);
      expect(updatedPlan.remainingMinutes).toBe(initialRemaining - (task1Minutes + task2Minutes));
    });
  });

  describe('5. Real-Time Exam Countdown', () => {
    it('computes positive days, hours, and formatted countdown string for future exams', () => {
      const futureDate = new Date(Date.now() + (2 * 24 * 60 + 5 * 60 + 30) * 60 * 1000).toISOString();
      const countdown = calculateExamCountdown(futureDate);

      expect(countdown.isPassed).toBe(false);
      expect(countdown.days).toBe(2);
      expect(countdown.hours).toBe(5);
      expect(countdown.formattedString).toContain('Exam in 2d 5h');
    });

    it('handles passed exam dates gracefully', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      const countdown = calculateExamCountdown(pastDate);

      expect(countdown.isPassed).toBe(true);
      expect(countdown.days).toBe(0);
      expect(countdown.formattedString).toContain('Exam session in progress or concluded');
    });
  });

  describe('6. Premium Entitlement & Paywall Integration', () => {
    const studentUser: User = {
      id: 'usr-student-free',
      email: 'student@example.com',
      password_hash: 'hash',
      full_name: 'Free Student',
      role: 'STUDENT',
      email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('requires upgrade for 2h and 5h crash plans for free students', () => {
      const plan2h = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '2h',
        user: studentUser,
      });
      expect(plan2h.requiresUpgrade).toBe(true);

      const plan5h = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '5h',
        user: studentUser,
      });
      expect(plan5h.requiresUpgrade).toBe(true);
    });

    it('allows free access to 1d, 3d, and 7d comprehensive study roadmaps', () => {
      const plan1d = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '1d',
        user: studentUser,
      });
      expect(plan1d.requiresUpgrade).toBe(false);

      const plan3d = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '3d',
        user: studentUser,
      });
      expect(plan3d.requiresUpgrade).toBe(false);

      const plan7d = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '7d',
        user: studentUser,
      });
      expect(plan7d.requiresUpgrade).toBe(false);
    });

    it('unlocks 2h and 5h crash plans when student has an active entitlement', () => {
      // Add entitlement to dbStore
      dbStore.entitlements.push({
        id: 'ent-test-dbms',
        user_id: studentUser.id,
        order_id: 'ord-test',
        product_id: 'prod-single-dbms',
        access_scope: 'SINGLE_SUBJECT',
        subject_id: 'sub-dbms',
        expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const plan2h = generateExamModePlan({
        subjectId: 'sub-dbms',
        durationType: '2h',
        user: studentUser,
      });
      expect(plan2h.requiresUpgrade).toBe(false);
    });
  });

  describe('7. API Route Integration (/api/study-plans)', () => {
    it('GET /api/study-plans returns 5-phase examMode object', async () => {
      const req = new NextRequest('http://localhost:3000/api/study-plans?subject_id=sub-dbms&duration_type=5h');
      const res = await getStudyPlanHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.examMode).toBeDefined();
      expect(json.data.examMode.phases.length).toBe(5);
      expect(json.data.examMode.phases[0].phase).toBe('PRIORITY_1_MUST_STUDY');
    });

    it('POST /api/study-plans blocks unentitled students on 2h crash plan with 403', async () => {
      const freeUser: User = {
        id: 'usr-student-free-api',
        email: 'freeapi@example.com',
        password_hash: 'hash',
        full_name: 'Free API Student',
        role: 'STUDENT',
        email_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const token = createAuthToken({ id: freeUser.id, email: freeUser.email, role: 'STUDENT' });

      const req = new NextRequest('http://localhost:3000/api/study-plans', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_type: '2h',
          available_hours: 2,
        }),
      });

      const res = await postStudyPlanHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('UPGRADE_REQUIRED');
    });

    it('POST /api/study-plans allows free generation for 1d, 3d, and 7d plans', async () => {
      const freeUser: User = {
        id: 'usr-student-free-api2',
        email: 'freeapi2@example.com',
        password_hash: 'hash',
        full_name: 'Free API Student 2',
        role: 'STUDENT',
        email_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const token = createAuthToken({ id: freeUser.id, email: freeUser.email, role: 'STUDENT' });

      const req = new NextRequest('http://localhost:3000/api/study-plans', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_type: '1d',
          available_hours: 10,
        }),
      });

      const res = await postStudyPlanHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.plan).toBeDefined();
      expect(json.data.tasks.length).toBeGreaterThan(0);
      expect(json.data.examMode.phases.length).toBe(5);
    });
  });
});
