import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { QuizAttemptSubmitSchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { trackServerEvent } from '@/lib/analytics/service';
import { QuizAttempt } from '@/lib/db/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quiz = dbStore.quizzes.find((q) => q.id === params.id);
    if (!quiz) {
      return apiError('NOT_FOUND', 'Quiz not found', 404);
    }

    const currentUser = getAuthUser(request);
    const entitlementCheck = checkUserEntitlement(currentUser, quiz.subject_id);

    if (quiz.is_premium && !entitlementCheck.hasAccess) {
      return apiError(
        'UPGRADE_REQUIRED',
        'This assessment requires Single Subject Pass (₹49) or Semester Pass (₹199)',
        403
      );
    }

    const questions = dbStore.quizQuestions
      .filter((qq) => qq.quiz_id === quiz.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        marks: q.marks,
        order_index: q.order_index,
      }));

    trackServerEvent('quiz started', {
      userId: currentUser?.id,
      properties: {
        quiz_id: quiz.id,
        subject_id: quiz.subject_id,
        unit_id: quiz.unit_id,
        is_premium: quiz.is_premium,
      },
      headers: request.headers,
    });

    return apiSuccess({
      quiz,
      questions,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve quiz details', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    const userId = user ? user.id : 'usr-student-1'; // fallback to demo user if not logged in

    const quiz = dbStore.quizzes.find((q) => q.id === params.id);
    if (!quiz) {
      return apiError('NOT_FOUND', 'Quiz not found', 404);
    }

    const json = await request.json().catch(() => null);
    const parseResult = QuizAttemptSubmitSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid quiz submission format', 400, parseResult.error.format());
    }

    const { answers, time_taken_seconds } = parseResult.data;
    const questions = dbStore.quizQuestions.filter((qq) => qq.quiz_id === quiz.id);

    let totalScore = 0;
    let maxScore = 0;
    const evaluationResults: Array<{
      question_id: string;
      question_text: string;
      user_answer: number;
      correct_answer: number;
      is_correct: boolean;
      explanation: string;
    }> = [];

    questions.forEach((q) => {
      maxScore += q.marks;
      const userSelected = answers[q.id];
      const isCorrect = userSelected === q.correct_option_index;

      if (isCorrect) {
        totalScore += q.marks;
      }

      evaluationResults.push({
        question_id: q.id,
        question_text: q.question_text,
        user_answer: userSelected,
        correct_answer: q.correct_option_index,
        is_correct: isCorrect,
        explanation: q.explanation,
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= quiz.passing_score;

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      user_id: userId,
      quiz_id: quiz.id,
      score: totalScore,
      max_score: maxScore,
      percentage,
      time_taken_seconds,
      completed_at: new Date().toISOString(),
      answers_json: answers,
      created_at: new Date().toISOString(),
    };

    dbStore.quizAttempts.push(attempt);

    // Also update progress
    const existingProgress = dbStore.studentProgress.find(
      (p) => p.user_id === userId && p.item_type === 'QUIZ' && p.item_id === quiz.id
    );

    if (existingProgress) {
      existingProgress.is_completed = passed;
      existingProgress.last_activity_at = new Date().toISOString();
    } else {
      dbStore.studentProgress.push({
        id: `prog-${Date.now()}`,
        user_id: userId,
        subject_id: quiz.subject_id,
        unit_id: quiz.unit_id || null,
        item_type: 'QUIZ',
        item_id: quiz.id,
        is_completed: passed,
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Decoupled tracking for quiz completion
    trackServerEvent('quiz completed', {
      userId,
      properties: {
        quiz_id: quiz.id,
        subject_id: quiz.subject_id,
        score: totalScore,
        max_score: maxScore,
        percentage,
        passed,
      },
      headers: request.headers,
    });

    return apiSuccess({
      attempt_id: attempt.id,
      score: totalScore,
      max_score: maxScore,
      percentage,
      passed,
      time_taken_seconds,
      results: evaluationResults,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to score quiz submission', 500, err instanceof Error ? err.message : undefined);
  }
}
