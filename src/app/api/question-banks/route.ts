import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id') || 'sub-dbms';

    const subject = dbStore.subjects.find((s) => s.id === subjectId || s.short_name.toLowerCase() === subjectId.toLowerCase());
    if (!subject) {
      return apiError('NOT_FOUND', 'Subject not found', 404);
    }

    const units = dbStore.units.filter((u) => u.subject_id === subject.id);
    const questions = dbStore.questions.filter(
      (q) => q.subject_id === subject.id && q.content_status === 'PUBLISHED' && !q.deleted_at
    );

    const unitBanks = units.map((unit) => {
      const unitQuestions = questions.filter((q) => q.unit_id === unit.id);
      return {
        unit: {
          id: unit.id,
          unit_number: unit.unit_number,
          title: unit.title,
        },
        questions_by_marks: {
          two_marks: unitQuestions.filter((q) => q.marks <= 2),
          five_marks: unitQuestions.filter((q) => q.marks > 2 && q.marks <= 5),
          ten_marks: unitQuestions.filter((q) => q.marks > 5),
        },
        total_questions: unitQuestions.length,
      };
    });

    return apiSuccess({
      subject: {
        id: subject.id,
        name: subject.name,
        short_name: subject.short_name,
        code: subject.code,
      },
      units: unitBanks,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve question banks', 500, err instanceof Error ? err.message : undefined);
  }
}
