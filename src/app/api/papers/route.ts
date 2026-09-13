import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema } from '@/lib/api/validators';
import { ExamSession } from '@/lib/db/types';

export interface ExamPaper {
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  subject_short_name: string;
  subject_code: string;
  year: number;
  exam_session: ExamSession;
  pattern_id: string;
  pattern_name: string;
  total_marks: number;
  question_count: number;
  questions: Array<{
    id: string;
    occurrence_id: string;
    question_number: string;
    question_text: string;
    marks: number;
    unit_id: string;
    unit_number?: number;
    unit_title?: string;
    topic_id?: string | null;
    difficulty: string;
    question_type: string;
    verification_status: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : null;
    const session = searchParams.get('exam_session') || searchParams.get('session');
    const patternId = searchParams.get('pattern_id');

    // Group occurrences by paper key: `${subject_id}_${year}_${exam_session}_${pattern_id}`
    const paperMap = new Map<string, ExamPaper>();

    for (const occ of dbStore.questionOccurrences) {
      const q = dbStore.questions.find((quest) => quest.id === occ.question_id && !quest.deleted_at && quest.content_status === 'PUBLISHED');
      if (!q) continue;

      const sub = dbStore.subjects.find((s) => s.id === occ.subject_id || s.id === q.subject_id);
      if (!sub) continue;

      const pat = dbStore.patterns.find((p) => p.id === occ.pattern_id || p.id === sub.pattern_id);
      const unit = dbStore.units.find((u) => u.id === q.unit_id);

      const paperKey = `${sub.id}_${occ.year}_${occ.exam_session}_${occ.pattern_id}`;

      if (!paperMap.has(paperKey)) {
        const sessionLabel = occ.exam_session === 'IN_SEM' ? 'In-Semester' : occ.exam_session === 'END_SEM' ? 'End-Semester' : 'Supplementary';
        const patLabel = pat ? pat.name : 'SPPU Pattern';
        
        paperMap.set(paperKey, {
          id: `paper-${sub.short_name.toLowerCase()}-${occ.year}-${occ.exam_session.toLowerCase()}`,
          title: `SPPU ${occ.year} ${sessionLabel} Examination - ${sub.name} (${sub.code})`,
          subject_id: sub.id,
          subject_name: sub.name,
          subject_short_name: sub.short_name,
          subject_code: sub.code,
          year: occ.year,
          exam_session: occ.exam_session,
          pattern_id: occ.pattern_id,
          pattern_name: patLabel,
          total_marks: 0,
          question_count: 0,
          questions: [],
        });
      }

      const paper = paperMap.get(paperKey)!;
      paper.total_marks += occ.marks;
      paper.question_count += 1;
      paper.questions.push({
        id: q.id,
        occurrence_id: occ.id,
        question_number: occ.question_number,
        question_text: q.question_text,
        marks: occ.marks,
        unit_id: q.unit_id,
        unit_number: unit?.unit_number,
        unit_title: unit?.title,
        topic_id: q.topic_id,
        difficulty: q.difficulty,
        question_type: q.question_type,
        verification_status: occ.verification_status || q.verification_status,
      });
    }

    let papers = Array.from(paperMap.values());

    if (subjectId) {
      papers = papers.filter((p) => p.subject_id === subjectId || p.subject_short_name.toLowerCase() === subjectId.toLowerCase());
    }
    if (year) {
      papers = papers.filter((p) => p.year === year);
    }
    if (session) {
      papers = papers.filter((p) => p.exam_session === session);
    }
    if (patternId) {
      papers = papers.filter((p) => p.pattern_id === patternId);
    }

    for (const paper of papers) {
      paper.questions.sort((a, b) => a.question_number.localeCompare(b.question_number, undefined, { numeric: true }));
    }

    papers.sort((a, b) => b.year - a.year || a.subject_short_name.localeCompare(b.subject_short_name));

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(papers, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve examination papers', 500, err instanceof Error ? err.message : undefined);
  }
}
