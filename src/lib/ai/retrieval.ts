import { dbStore } from '@/lib/db/client';
import { calculateSubjectIntelligence } from '@/lib/intelligence/pyqEngine';
import { normalizeQuestionText, extractContentTokens } from '@/lib/intelligence/clusteringEngine';
import { getFullAcademicLineage } from '@/lib/curriculum/hierarchy';

export interface RetrievedSyllabusItem {
  id: string;
  unitNumber: number;
  unitTitle: string;
  content: string;
  referenceMaterials?: string | null;
  relevanceScore: number;
}

export interface RetrievedTopic {
  topicId: string;
  title: string;
  unitNumber: number;
  unitTitle: string;
  importanceLevel: string;
  relevanceScore: number;
}

export interface RetrievedPYQ {
  questionId: string;
  questionText: string;
  marks: number;
  difficulty: string;
  unitTitle: string;
  topicTitle?: string;
  occurrences: Array<{
    year: number;
    session: string;
    questionNumber: string;
    marks: number;
  }>;
  relevanceScore: number;
}

export interface RetrievedAnswer {
  answerId: string;
  questionId: string;
  questionText: string;
  marksTarget: 2 | 5 | 10;
  heading: string;
  summary: string;
  keyPoints: string[];
  evaluatorTips?: string | null;
  diagramDescription?: string | null;
  relevanceScore: number;
}

export interface RetrievedNote {
  noteId: string;
  title: string;
  summary: string;
  bodyExcerpt: string;
  unitTitle: string;
  relevanceScore: number;
}

export interface RetrievedCluster {
  clusterId: string;
  canonicalName: string;
  canonicalQuestion: string;
  occurrenceCount: number;
  years: number[];
  typicalMarks: string;
  repetitionSummary: string;
  confidenceScore: number;
  primaryRepetitionType?: string;
  variations: string[];
  relevanceScore: number;
}

export interface RetrievedPriorityData {
  topicId: string;
  topicTitle: string;
  priority: string;
  frequencyRatio: string;
  trend: string;
  explanation: string;
  typicalMarks: string;
  relevanceScore: number;
}

export interface RetrievedStudentProgress {
  userId: string;
  completedTopicsCount: number;
  completedTopicsTitles: string[];
  completedNotesCount: number;
  quizAttemptsCount: number;
  averageQuizScore?: number;
  weakTopics: string[];
}

export interface GroundedAcademicContext {
  query: string;
  subject_id?: string;
  subject_name?: string;
  university_id?: string;
  university_name?: string;
  pattern_id?: string;
  pattern_name?: string;
  branch_id?: string;
  branch_name?: string;
  syllabus: RetrievedSyllabusItem[];
  topics: RetrievedTopic[];
  pyqs: RetrievedPYQ[];
  verified_answers: RetrievedAnswer[];
  notes: RetrievedNote[];
  question_clusters: RetrievedCluster[];
  priority_data: RetrievedPriorityData[];
  student_progress?: RetrievedStudentProgress;
  total_sources_count: number;
  is_empty: boolean;
  citations: Array<{
    type: 'SYLLABUS' | 'TOPIC' | 'PYQ' | 'ANSWER' | 'NOTE' | 'CLUSTER' | 'PRIORITY';
    id: string;
    title: string;
    relevance: number;
  }>;
  // Prepared for pgvector semantic search
  vector_searched?: boolean;
}

export interface StructuredRetrievalOptions {
  query: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  userId?: string;
  maxItemsPerSource?: number;
  // Prepared for pgvector integration
  vectorEmbedding?: number[];
  vectorSimilarityThreshold?: number;
}

/**
 * Calculates a lexical / token relevance score [0.0 to 1.0] for a target text against query tokens.
 */
function computeRelevance(queryTokens: string[], targetText: string, exactQuery: string): number {
  if (!targetText || queryTokens.length === 0) return 0;

  const targetLower = targetText.toLowerCase();
  const normalizedExact = exactQuery.toLowerCase().trim();

  // Exact phrase match bonus
  if (normalizedExact.length > 3 && targetLower.includes(normalizedExact)) {
    return 1.0;
  }

  let matchedTokens = 0;
  for (const token of queryTokens) {
    if (targetLower.includes(token)) {
      matchedTokens++;
    }
  }

  const tokenRatio = matchedTokens / queryTokens.length;
  return Math.round(tokenRatio * 100) / 100;
}

/**
 * Executes multi-source structured academic retrieval from PostgreSQL/dbStore.
 * Sources:
 * 1. syllabus
 * 2. topics
 * 3. PYQs
 * 4. verified answers
 * 5. notes
 * 6. question clusters
 * 7. priority data
 * 8. student progress
 */
export async function retrieveGroundedAcademicContext(
  options: StructuredRetrievalOptions
): Promise<GroundedAcademicContext> {
  const { query, subjectId, unitId, topicId, userId, maxItemsPerSource = 3 } = options;

  let queryTokens = extractContentTokens(query);
  const normalizedQuery = normalizeQuestionText(query);

  const subject = subjectId ? dbStore.subjects.find((s) => s.id === subjectId) : null;
  const subjectName = subject ? `${subject.name} (${subject.code})` : undefined;

  // Resolve 9-tier lineage for subject if present
  const lineage = subjectId ? getFullAcademicLineage(subjectId) : null;
  const universityId = lineage?.university?.id;
  const universityName = lineage?.university?.name;
  const patternId = lineage?.pattern?.id;
  const patternName = lineage?.pattern?.name;
  const branchId = lineage?.branch?.id;
  const branchName = lineage?.branch?.name;

  // Filter subject-level identifiers from queryTokens when subject context is explicit
  if (subject) {
    const subjectTokens = new Set(
      extractContentTokens(`${subject.name} ${subject.code} ${subject.id}`)
    );
    if (subject.name.toLowerCase().includes('database')) subjectTokens.add('dbms');
    if (subject.name.toLowerCase().includes('computation')) subjectTokens.add('toc');
    if (subject.name.toLowerCase().includes('network')) subjectTokens.add('cns').add('cn');

    const filtered = queryTokens.filter((t) => !subjectTokens.has(t));
    if (filtered.length > 0) {
      queryTokens = filtered;
    }
  }

  // 1. RETRIEVE SYLLABUS
  let syllabusCandidates = dbStore.syllabusItems.filter((item) => {
    const unit = dbStore.units.find((u) => u.id === item.unit_id);
    if (subjectId && unit && unit.subject_id !== subjectId) return false;
    if (unitId && item.unit_id !== unitId) return false;
    return true;
  });

  const retrievedSyllabus: RetrievedSyllabusItem[] = syllabusCandidates
    .map((item) => {
      const unit = dbStore.units.find((u) => u.id === item.unit_id);
      const score = Math.max(
        computeRelevance(queryTokens, item.content, query),
        computeRelevance(queryTokens, unit?.title || '', query)
      );
      return {
        id: item.id,
        unitNumber: unit?.unit_number || 1,
        unitTitle: unit?.title || 'Core Syllabus Unit',
        content: item.content,
        referenceMaterials: item.reference_materials,
        relevanceScore: score,
      };
    })
    .filter((s) => s.relevanceScore > 0 || queryTokens.length === 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItemsPerSource);

  // 2. RETRIEVE TOPICS
  let topicCandidates = dbStore.topics.filter((t) => {
    const unit = dbStore.units.find((u) => u.id === t.unit_id);
    if (subjectId && unit && unit.subject_id !== subjectId) return false;
    if (unitId && t.unit_id !== unitId) return false;
    if (topicId && t.id !== topicId) return false;
    return true;
  });

  const retrievedTopics: RetrievedTopic[] = topicCandidates
    .map((t) => {
      const unit = dbStore.units.find((u) => u.id === t.unit_id);
      const score = Math.max(
        computeRelevance(queryTokens, t.title, query),
        computeRelevance(queryTokens, t.description, query)
      );
      return {
        topicId: t.id,
        title: t.title,
        unitNumber: unit?.unit_number || 1,
        unitTitle: unit?.title || 'Unit',
        importanceLevel: t.importance_level,
        relevanceScore: score,
      };
    })
    .filter((t) => t.relevanceScore > 0 || queryTokens.length === 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItemsPerSource);

  // 3. RETRIEVE PYQS
  let questionCandidates = dbStore.questions.filter((q) => {
    if (q.content_status !== 'PUBLISHED' || q.deleted_at) return false;
    if (subjectId && q.subject_id !== subjectId) return false;
    if (unitId && q.unit_id !== unitId) return false;
    if (topicId && q.topic_id !== topicId) return false;
    return true;
  });

  const retrievedPYQs: RetrievedPYQ[] = questionCandidates
    .map((q) => {
      const unit = dbStore.units.find((u) => u.id === q.unit_id);
      const topic = dbStore.topics.find((t) => t.id === q.topic_id);
      const occurrences = dbStore.questionOccurrences.filter(
        (occ) => occ.question_id === q.id && occ.verification_status === 'VERIFIED'
      );

      const score = Math.max(
        computeRelevance(queryTokens, q.question_text, query),
        computeRelevance(queryTokens, q.normalized_question, query),
        computeRelevance(queryTokens, topic?.title || '', query)
      );

      return {
        questionId: q.id,
        questionText: q.question_text,
        marks: q.marks,
        difficulty: q.difficulty,
        unitTitle: unit ? `Unit ${unit.unit_number}: ${unit.title}` : 'Core Unit',
        topicTitle: topic?.title,
        occurrences: occurrences.map((o) => ({
          year: o.year,
          session: o.exam_session,
          questionNumber: o.question_number,
          marks: o.marks,
        })),
        relevanceScore: score,
      };
    })
    .filter((q) => q.relevanceScore > 0 || queryTokens.length === 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItemsPerSource);

  // 4. RETRIEVE VERIFIED MODEL ANSWERS
  const retrievedQuestionIds = new Set(retrievedPYQs.map((q) => q.questionId));
  const answerCandidates = dbStore.answers.filter(
    (a) => a.content_status === 'PUBLISHED' && (!subjectId || retrievedQuestionIds.has(a.question_id) || true)
  );

  const retrievedAnswers: RetrievedAnswer[] = answerCandidates
    .filter((a) => {
      const question = dbStore.questions.find((q) => q.id === a.question_id);
      return !subjectId || !question || question.subject_id === subjectId;
    })
    .map((a) => {
      const question = dbStore.questions.find((q) => q.id === a.question_id);
      const score = Math.max(
        computeRelevance(queryTokens, a.heading, query),
        computeRelevance(queryTokens, a.summary, query),
        computeRelevance(queryTokens, a.key_points.join(' '), query),
        computeRelevance(queryTokens, question?.question_text || '', query)
      );

      return {
        answerId: a.id,
        questionId: a.question_id,
        questionText: question?.question_text || 'Exam Question',
        marksTarget: a.marks_target,
        heading: a.heading,
        summary: a.summary,
        keyPoints: a.key_points,
        evaluatorTips: a.evaluator_tips,
        diagramDescription: a.diagram_description,
        relevanceScore: score,
      };
    })
    .filter((a) => a.relevanceScore > 0 || queryTokens.length === 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItemsPerSource);

  // 5. RETRIEVE NOTES
  let noteCandidates = dbStore.notes.filter((n) => {
    if (n.content_status !== 'PUBLISHED') return false;
    if (subjectId && n.subject_id !== subjectId) return false;
    if (unitId && n.unit_id !== unitId) return false;
    return true;
  });

  const retrievedNotes: RetrievedNote[] = noteCandidates
    .map((n) => {
      const unit = dbStore.units.find((u) => u.id === n.unit_id);
      const score = Math.max(
        computeRelevance(queryTokens, n.title, query),
        computeRelevance(queryTokens, n.summary, query),
        computeRelevance(queryTokens, n.content_body, query)
      );

      return {
        noteId: n.id,
        title: n.title,
        summary: n.summary,
        bodyExcerpt: n.content_body.slice(0, 400),
        unitTitle: unit?.title || 'Unit',
        relevanceScore: score,
      };
    })
    .filter((n) => n.relevanceScore > 0 || queryTokens.length === 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItemsPerSource);

  // 6. RETRIEVE QUESTION CLUSTERS
  let clusterCandidates = dbStore.questionClusters.filter((c) => {
    if (c.deleted_at || c.review_status === 'REJECTED') return false;
    if (subjectId && c.subject_id !== subjectId) return false;
    if (unitId && c.unit_id !== unitId) return false;
    return true;
  });

  const retrievedClusters: RetrievedCluster[] = clusterCandidates
    .map((c) => {
      const members = dbStore.questionClusterMembers.filter((m) => m.cluster_id === c.id);
      const variationTexts = members
        .map((m) => dbStore.questions.find((qu) => qu.id === m.question_id)?.question_text)
        .filter((t): t is string => Boolean(t));

      const score = Math.max(
        computeRelevance(queryTokens, c.canonical_name, query),
        computeRelevance(queryTokens, c.canonical_question, query),
        computeRelevance(queryTokens, variationTexts.join(' '), query)
      );

      return {
        clusterId: c.id,
        canonicalName: c.canonical_name,
        canonicalQuestion: c.canonical_question,
        occurrenceCount: c.occurrence_count,
        years: c.years,
        typicalMarks: c.typical_marks,
        repetitionSummary: c.repetition_summary || `Repeated/Similar in ${c.occurrence_count} verified papers`,
        confidenceScore: c.confidence_score,
        primaryRepetitionType: c.primary_repetition_type,
        variations: variationTexts,
        relevanceScore: score,
      };
    })
    .filter((c) => c.relevanceScore > 0 || queryTokens.length === 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItemsPerSource);

  // 7. RETRIEVE PRIORITY DATA (via Intelligence Engine)
  const retrievedPriority: RetrievedPriorityData[] = [];
  if (subjectId) {
    try {
      const intel = calculateSubjectIntelligence(subjectId);
      for (const topicPri of intel.topics_priority) {
        const score = computeRelevance(queryTokens, topicPri.topic_title, query);
        if (score > 0 || (queryTokens.length === 0 && retrievedPriority.length < maxItemsPerSource)) {
          retrievedPriority.push({
            topicId: topicPri.topic_id,
            topicTitle: topicPri.topic_title,
            priority: topicPri.priority,
            frequencyRatio: `${topicPri.signals.occurrenceFrequency.distinctPapersCount}/${topicPri.signals.occurrenceFrequency.totalPapersAnalyzed} Papers`,
            trend: topicPri.signals.trend.direction,
            explanation: topicPri.explanation,
            typicalMarks: topicPri.typical_marks,
            relevanceScore: score,
          });
        }
      }
      retrievedPriority.sort((a, b) => b.relevanceScore - a.relevanceScore);
      retrievedPriority.splice(maxItemsPerSource);
    } catch {
      // Fall through gracefully
    }
  }

  // 8. RETRIEVE STUDENT PROGRESS (if userId provided)
  let studentProgress: RetrievedStudentProgress | undefined;
  if (userId) {
    const userProgressRecords = dbStore.studentProgress.filter((p) => p.user_id === userId);
    const completedTopicIds = userProgressRecords
      .filter((p) => p.item_type === 'TOPIC' && p.is_completed)
      .map((p) => p.item_id);
    const completedNoteIds = userProgressRecords
      .filter((p) => p.item_type === 'NOTE' && p.is_completed)
      .map((p) => p.item_id);

    const completedTitles = completedTopicIds
      .map((id) => dbStore.topics.find((t) => t.id === id)?.title)
      .filter((t): t is string => Boolean(t));

    const attempts = dbStore.quizAttempts.filter((a) => a.user_id === userId);
    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : undefined;

    // Detect weak topics (quiz score < 60%)
    const weakTopicTitles = attempts
      .filter((a) => a.percentage < 60)
      .map((a) => {
        const quiz = dbStore.quizzes.find((q) => q.id === a.quiz_id);
        return quiz?.title || 'Quiz Topic';
      });

    studentProgress = {
      userId,
      completedTopicsCount: completedTopicIds.length,
      completedTopicsTitles: completedTitles,
      completedNotesCount: completedNoteIds.length,
      quizAttemptsCount: attempts.length,
      averageQuizScore: avgScore,
      weakTopics: Array.from(new Set(weakTopicTitles)),
    };
  }

  // Build Citations
  const citations: GroundedAcademicContext['citations'] = [];

  retrievedSyllabus.forEach((s) => citations.push({ type: 'SYLLABUS', id: s.id, title: `${s.unitTitle} Syllabus`, relevance: s.relevanceScore }));
  retrievedTopics.forEach((t) => citations.push({ type: 'TOPIC', id: t.topicId, title: t.title, relevance: t.relevanceScore }));
  retrievedPYQs.forEach((q) => citations.push({ type: 'PYQ', id: q.questionId, title: q.questionText, relevance: q.relevanceScore }));
  retrievedAnswers.forEach((a) => citations.push({ type: 'ANSWER', id: a.answerId, title: a.heading, relevance: a.relevanceScore }));
  retrievedNotes.forEach((n) => citations.push({ type: 'NOTE', id: n.noteId, title: n.title, relevance: n.relevanceScore }));
  retrievedClusters.forEach((c) => citations.push({ type: 'CLUSTER', id: c.clusterId, title: c.canonicalName, relevance: c.relevanceScore }));
  retrievedPriority.forEach((p) => citations.push({ type: 'PRIORITY', id: p.topicId, title: `${p.topicTitle} (${p.priority})`, relevance: p.relevanceScore }));

  const totalSourcesCount =
    retrievedSyllabus.length +
    retrievedTopics.length +
    retrievedPYQs.length +
    retrievedAnswers.length +
    retrievedNotes.length +
    retrievedClusters.length +
    retrievedPriority.length;

  return {
    query,
    subject_id: subjectId,
    subject_name: subjectName,
    university_id: universityId,
    university_name: universityName,
    pattern_id: patternId,
    pattern_name: patternName,
    branch_id: branchId,
    branch_name: branchName,
    syllabus: retrievedSyllabus,
    topics: retrievedTopics,
    pyqs: retrievedPYQs,
    verified_answers: retrievedAnswers,
    notes: retrievedNotes,
    question_clusters: retrievedClusters,
    priority_data: retrievedPriority,
    student_progress: studentProgress,
    total_sources_count: totalSourcesCount,
    is_empty: totalSourcesCount === 0,
    citations,
    vector_searched: Boolean(options.vectorEmbedding && options.vectorEmbedding.length > 0),
  };
}
