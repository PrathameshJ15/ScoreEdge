import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { StudyPlanGenerateSchema } from '@/lib/api/validators';
import { getAuthUser, verifyAuthToken } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { StudyPlan, StudyPlanTask, User } from '@/lib/db/types';
import { generateExamModePlan, ExamDurationType } from '@/lib/intelligence/examModeEngine';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user ? user.id : 'usr-student-1';

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id') || 'sub-dbms';
    const durationType = (searchParams.get('duration_type') as ExamDurationType) || '2h';

    const plan = dbStore.studyPlans.find((p) => p.user_id === userId && p.subject_id === subjectId && p.is_active);
    
    let completedIds: string[] = [];
    if (plan) {
      completedIds = dbStore.studyPlanTasks
        .filter((t) => t.study_plan_id === plan.id && t.is_completed)
        .map((t) => t.id);
    }

    const examMode = generateExamModePlan({
      subjectId,
      durationType,
      completedTaskIds: completedIds,
      user,
    });

    const tasks = plan
      ? dbStore.studyPlanTasks
          .filter((t) => t.study_plan_id === plan.id)
          .sort((a, b) => a.order_index - b.order_index)
      : [];

    return apiSuccess({
      plan: plan || null,
      tasks,
      examMode,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve study plan', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    let user: User | { id: string; role?: string } | null = getAuthUser(request);

    if (!user) {
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        const payload = verifyAuthToken(token);
        if (payload) {
          user = { id: payload.id, role: payload.role };
        }
      }
    }

    const userId = user ? user.id : 'usr-student-1';

    const json = await request.json().catch(() => null);
    const parseResult = StudyPlanGenerateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid study plan generation parameters', 400, parseResult.error.format());
    }

    const { subject_id, duration_type, available_hours } = parseResult.data;

    // Entitlement check for Exam Mode crash plans (2h and 5h)
    if (duration_type === '2h' || duration_type === '5h') {
      const entitlementCheck = checkUserEntitlement(user, subject_id);
      if (!entitlementCheck.hasAccess) {
        return apiError(
          'UPGRADE_REQUIRED',
          'Emergency Exam Mode plans require Single Subject Pass (₹49) or Semester Pass (₹199)',
          403
        );
      }
    }

    // Deactivate previous active plans for this subject
    dbStore.studyPlans
      .filter((p) => p.user_id === userId && p.subject_id === subject_id)
      .forEach((p) => (p.is_active = false));

    const newPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      user_id: userId,
      subject_id,
      title: `${duration_type.toUpperCase()} Exam Mode Plan (${available_hours} Hours)`,
      duration_type,
      available_hours,
      completion_rate: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.studyPlans.push(newPlan);

    // Generate full 5-phase actionable exam mode plan
    const examMode = generateExamModePlan({
      subjectId: subject_id,
      durationType: duration_type as ExamDurationType,
      user,
    });

    const tasks: StudyPlanTask[] = [];
    let taskIndex = 1;

    examMode.phases.forEach((phase) => {
      phase.tasks.forEach((t) => {
        const task: StudyPlanTask = {
          id: t.id,
          study_plan_id: newPlan.id,
          topic_id: t.topicId || null,
          task_title: `${t.phaseTitle}: ${t.topicTitle} - ${t.actionTitle}`,
          task_type: t.taskType,
          estimated_minutes: t.estimatedMinutes,
          priority: phase.phase === 'PRIORITY_1_MUST_STUDY' ? 'MUST_STUDY' : 'HIGH',
          is_completed: false,
          order_index: taskIndex++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        tasks.push(task);
        dbStore.studyPlanTasks.push(task);
      });
    });

    return apiSuccess({ plan: newPlan, tasks, examMode }, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to generate study plan', 500, err instanceof Error ? err.message : undefined);
  }
}
