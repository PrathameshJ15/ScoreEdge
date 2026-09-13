import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const totalUniversities = dbStore.universities.length;
    const totalPatterns = dbStore.patterns.length;
    const totalBranches = dbStore.branches.length;
    const totalAcademicYears = dbStore.academicYears.length;
    const totalSemesters = dbStore.semesters.length;
    const totalSubjects = dbStore.subjects.filter((s) => !s.deleted_at).length;
    const totalUnits = dbStore.units.length;
    const totalTopics = dbStore.topics.length;
    const totalSyllabusItems = dbStore.syllabusItems.length;
    const totalQuestions = dbStore.questions.filter((q) => !q.deleted_at).length;
    const totalPyqs = dbStore.questions.filter((q) => q.is_pyq && !q.deleted_at).length;
    const totalAnswers = dbStore.answers.length;
    const totalNotes = dbStore.notes.filter((n) => !n.deleted_at).length;
    const totalQuizzes = dbStore.quizzes.length;
    const totalSources = dbStore.contentSources.length;
    const totalUsers = dbStore.users.filter((u) => !u.deleted_at).length;
    const totalStudents = dbStore.users.filter((u) => u.role === 'STUDENT' && !u.deleted_at).length;

    // Status counts across all questions, answers, notes, quizzes
    const allContent = [
      ...dbStore.questions.map((q) => q.content_status),
      ...dbStore.answers.map((a) => a.content_status),
      ...dbStore.notes.map((n) => n.content_status),
      ...dbStore.quizzes.map((qz) => qz.content_status),
    ];

    const statusCounts = {
      DRAFT: allContent.filter((s) => s === 'DRAFT').length,
      REVIEW: allContent.filter((s) => s === 'REVIEW').length,
      VERIFIED: allContent.filter((s) => s === 'VERIFIED').length,
      PUBLISHED: allContent.filter((s) => s === 'PUBLISHED').length,
      ARCHIVED: allContent.filter((s) => s === 'ARCHIVED').length,
    };

    const pendingQuestions = dbStore.questions.filter(
      (q) => q.verification_status === 'NEEDS_REVIEW' || q.content_status === 'REVIEW'
    );
    const unverifiedQuestions = dbStore.questions.filter((q) => q.verification_status === 'UNVERIFIED');

    const totalOrders = dbStore.orders.length;
    const paidOrders = dbStore.orders.filter((o) => o.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount_inr, 0);

    const recentAudits = [...dbStore.verificationRecords]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return apiSuccess({
      stats: {
        total_universities: totalUniversities,
        total_patterns: totalPatterns,
        total_branches: totalBranches,
        total_academic_years: totalAcademicYears,
        total_semesters: totalSemesters,
        total_subjects: totalSubjects,
        total_units: totalUnits,
        total_topics: totalTopics,
        total_syllabus_items: totalSyllabusItems,
        total_questions: totalQuestions,
        total_pyqs: totalPyqs,
        total_answers: totalAnswers,
        total_notes: totalNotes,
        total_quizzes: totalQuizzes,
        total_sources: totalSources,
        total_users: totalUsers,
        total_students: totalStudents,
        total_orders: totalOrders,
        total_revenue_inr: totalRevenue,
      },
      status_breakdown: statusCounts,
      verification_queue: {
        pending_count: pendingQuestions.length,
        unverified_count: unverifiedQuestions.length,
        items_to_review: pendingQuestions.slice(0, 10),
      },
      recent_audits: recentAudits,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve admin dashboard stats', 500, err instanceof Error ? err.message : undefined);
  }
}
