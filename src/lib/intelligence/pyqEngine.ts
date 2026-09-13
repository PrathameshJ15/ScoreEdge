import { dbStore } from '@/lib/db/client';
import {
  PriorityLevel,
  TrendDirection,
  QuestionOccurrence,
  Question,
  Unit,
  Topic,
} from '@/lib/db/types';
import { getFullAcademicLineage } from '@/lib/curriculum/hierarchy';

export type PriorityCategory = PriorityLevel;

export interface PYQSignals {
  occurrenceFrequency: {
    totalOccurrences: number;
    distinctPapersCount: number;
    totalPapersAnalyzed: number;
    frequencyRatio: number; // e.g. 0.8 (4 out of 5 papers)
    frequencyPercentage: number; // 80%
  };
  recentAppearance: {
    lastAppearedYear: number | null;
    lastAppearedSession: string | null;
    recencyWeight: number; // 0 to 1 scale
    recentPapersCount: number; // in last 3 years
    isRecent: boolean;
  };
  historicalConsistency: {
    consistencyIndex: number; // 0 to 1
    spanYears: number; // years between earliest and latest appearance
    consecutiveYearStreak: number;
    isConsistentlyTested: boolean;
  };
  marksPattern: {
    minMarks: number;
    maxMarks: number;
    avgMarks: number;
    typicalMarksRange: string; // e.g. "6–8 Marks"
    totalMarksContributed: number;
    marksDistribution: Record<string, number>; // { '2M': 1, '5M': 0, '6M': 2, '8M': 1, '10M': 0 }
  };
  topicImportance: {
    syllabusImportance: PriorityLevel;
    syllabusBaseScore: number;
    empiricalImportanceScore: number;
  };
  unitWeightage: {
    unitId: string;
    unitNumber: number;
    unitTitle: string;
    unitMarksTotal: number;
    unitMarksPercentage: number;
  };
  recurrence: {
    isRecurring: boolean;
    recurrenceRate: number;
    repeatPattern: string; // e.g. "Appears every examination cycle"
  };
  trend: {
    direction: TrendDirection;
    trendScore: number;
    trendExplanation: string;
  };
}

export interface TopicPriorityReport {
  topic_id: string;
  topic_title: string;
  unit_id: string;
  unit_number: number;
  unit_title: string;
  subject_id: string;
  priority: PriorityCategory;
  composite_score: number; // 0 to 100
  signals: PYQSignals;
  explanation: string; // e.g. "Appeared in 4 of the last 5 verified papers."
  recommendation: string; // Academic revision recommendation
  typical_marks: string;
  question_count: number;
  suggested_prep_time_minutes: number;
}

export interface PYQFrequencyReport {
  question_id: string;
  canonical_question: string;
  cluster_id?: string | null;
  unit_id: string;
  unit_number: number;
  topic_id?: string | null;
  topic_title?: string | null;
  frequency: number;
  total_papers: number;
  frequency_percentage: number;
  years: number[];
  sessions: string[];
  typical_marks: string;
  marks_range: { min: number; max: number; avg: number };
  priority: PriorityCategory;
  trend: TrendDirection;
  explanation: string;
  occurrences: Array<{
    id: string;
    year: number;
    exam_session: string;
    question_number: string;
    marks: number;
  }>;
}

export interface UnitAnalysisReport {
  unit_id: string;
  unit_number: number;
  unit_title: string;
  total_marks: number;
  weightage_percentage: number;
  pyq_count: number;
  occurrences_count: number;
  avg_question_marks: number;
  must_study_topics_count: number;
  priority_distribution: Record<PriorityCategory, number>;
  difficulty_breakdown: { EASY: number; MEDIUM: number; HARD: number };
  top_recurring_topics: string[];
  text_interpretation: string; // Accessible text explanation of the unit's weightage
}

export interface MarksTrendReport {
  subject_id: string;
  marks_buckets: Array<{
    marks: number;
    count: number;
    percentage: number;
    label: string;
  }>;
  year_by_year_marks: Array<{
    year: number;
    total_marks: number;
    question_count: number;
    avg_marks: number;
  }>;
  question_type_distribution: Array<{
    question_type: string;
    count: number;
    percentage: number;
    typical_marks: number;
  }>;
  text_interpretation: string; // Text interpretation of the marks distribution
}

export interface ImportantTopicLists {
  must_study: TopicPriorityReport[];
  very_high: TopicPriorityReport[];
  high: TopicPriorityReport[];
  medium: TopicPriorityReport[];
  low: TopicPriorityReport[];
  summary_text: string;
}

export interface SubjectIntelligenceReport {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  university_id?: string;
  university_name?: string;
  pattern_id?: string;
  pattern_name?: string;
  branch_id?: string;
  branch_name?: string;
  total_papers_analyzed: number;
  total_verified_questions: number;
  total_occurrences: number;
  years_analyzed: number[];
  topics_priority: TopicPriorityReport[];
  important_topic_lists: ImportantTopicLists;
  pyq_frequency: PYQFrequencyReport[];
  unit_analysis: UnitAnalysisReport[];
  marks_trends: MarksTrendReport;
  overall_text_interpretation: string;
  disclaimer: string;
  generated_at: string;
}

const MANDATORY_ETHICAL_DISCLAIMER =
  'Historical pattern analysis for strategic revision. ScoreEdge provides academic trend analysis based on verified past papers and does not guarantee specific exam questions.';

// Banned claim phrases safety checker to enforce ethical guardrails
const BANNED_CLAIM_PATTERNS = [
  /guaranteed\s+question/i,
  /100%\s+prediction/i,
  /certain\s+exam\s+question/i,
  /sure[\s-]shot/i,
  /leak/i,
  /paper\s+leak/i,
  /will\s+definitely\s+appear/i,
];

export function sanitizeIntelligenceText(text: string): string {
  let sanitized = text;
  for (const pattern of BANNED_CLAIM_PATTERNS) {
    sanitized = sanitized.replace(pattern, 'high-probability historical pattern');
  }
  return sanitized;
}

/**
 * Helper to identify distinct papers (by year, exam_session, pattern_id)
 */
export function getDistinctVerifiedPapers(occurrences: QuestionOccurrence[]): Array<{
  paperKey: string;
  year: number;
  session: string;
  patternId: string;
}> {
  const paperMap = new Map<string, { paperKey: string; year: number; session: string; patternId: string }>();

  for (const occ of occurrences) {
    if (occ.verification_status !== 'VERIFIED') continue;
    const paperKey = `${occ.year}_${occ.exam_session}_${occ.pattern_id}`;
    if (!paperMap.has(paperKey)) {
      paperMap.set(paperKey, {
        paperKey,
        year: occ.year,
        session: occ.exam_session,
        patternId: occ.pattern_id,
      });
    }
  }

  return Array.from(paperMap.values()).sort((a, b) => b.year - a.year);
}

/**
 * Calculate recency score on a 0 to 1 scale given an array of years
 */
function calculateRecencyWeight(years: number[], latestExamYear: number): number {
  if (years.length === 0) return 0;
  const maxYear = Math.max(...years);
  const diff = Math.max(0, latestExamYear - maxYear);

  if (diff === 0) return 1.0;
  if (diff === 1) return 0.85;
  if (diff === 2) return 0.7;
  if (diff === 3) return 0.5;
  return 0.3;
}

/**
 * Formats a concise typical marks range (e.g. "6–8 Marks" or "10 Marks")
 */
function formatTypicalMarks(marks: number[]): string {
  if (marks.length === 0) return '—';
  const min = Math.min(...marks);
  const max = Math.max(...marks);
  if (min === max) {
    return `${min} Marks`;
  }
  return `${min}–${max} Marks`;
}

/**
 * Calculates historical consistency streak across consecutive years
 */
function calculateConsecutiveYearStreak(sortedYears: number[]): number {
  if (sortedYears.length === 0) return 0;
  const uniqueYears = Array.from(new Set(sortedYears)).sort((a, b) => b - a);
  let streak = 1;

  for (let i = 0; i < uniqueYears.length - 1; i++) {
    if (uniqueYears[i] - uniqueYears[i + 1] === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Generates an explainable text rationale based purely on historical occurrence facts
 */
function generateExplainabilityText(params: {
  paperCount: number;
  totalPapers: number;
  recentYears: number[];
  avgMarks: number;
  unitNumber: number;
  streak: number;
}): string {
  const { paperCount, totalPapers, recentYears, avgMarks, streak } = params;

  if (paperCount === 0) {
    return 'Theoretical syllabus topic with no recorded appearances in analyzed verified papers.';
  }

  const parts: string[] = [];

  // Primary occurrence frequency statement
  if (totalPapers > 0) {
    parts.push(`Appeared in ${paperCount} of the last ${totalPapers} verified papers.`);
  } else {
    parts.push(`Recorded in ${paperCount} verified exam occurrence${paperCount > 1 ? 's' : ''}.`);
  }

  // Multi-year streak or recent presence
  if (streak >= 2) {
    parts.push(`Consistently asked across ${streak} consecutive examination cycles.`);
  } else if (recentYears.length > 0) {
    const latestYear = Math.max(...recentYears);
    parts.push(`Most recently examined in ${latestYear}.`);
  }

  // Marks pattern observation
  parts.push(`Typically evaluated at ${Math.round(avgMarks)} marks.`);

  return parts.join(' ');
}

/**
 * Computes Priority Category and Composite Intelligence Score (0 to 100)
 */
function calculateCompositeScore(params: {
  frequencyRatio: number;
  recencyWeight: number;
  avgMarks: number;
  streak: number;
  syllabusImportance: PriorityLevel;
}): { score: number; priority: PriorityCategory } {
  const { frequencyRatio, recencyWeight, avgMarks, streak, syllabusImportance } = params;

  // 1. Frequency weight (35 points)
  const freqComponent = Math.min(1.0, frequencyRatio) * 35;

  // 2. Recency weight (25 points)
  const recencyComponent = recencyWeight * 25;

  // 3. Marks weight (20 points) - higher marks questions demand more preparation
  const marksComponent = Math.min(1.0, avgMarks / 10) * 20;

  // 4. Consecutive streak / recurrence (10 points)
  const streakComponent = Math.min(1.0, streak / 3) * 10;

  // 5. Syllabus importance baseline (10 points)
  const baselineScores: Record<PriorityLevel, number> = {
    MUST_STUDY: 10,
    VERY_HIGH: 8,
    HIGH: 6,
    MEDIUM: 4,
    LOW: 2,
  };
  const baselineComponent = baselineScores[syllabusImportance] || 5;

  const totalScore = Math.round(freqComponent + recencyComponent + marksComponent + streakComponent + baselineComponent);
  const normalizedScore = Math.min(100, Math.max(0, totalScore));

  let priority: PriorityCategory;
  if (normalizedScore >= 75) {
    priority = 'MUST_STUDY';
  } else if (normalizedScore >= 60) {
    priority = 'VERY_HIGH';
  } else if (normalizedScore >= 45) {
    priority = 'HIGH';
  } else if (normalizedScore >= 30) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  return { score: normalizedScore, priority };
}

/**
 * Comprehensive PYQ Intelligence calculation for a subject
 */
export function calculateSubjectIntelligence(subjectId: string): SubjectIntelligenceReport {
  const subject = dbStore.subjects.find((s) => s.id === subjectId && !s.deleted_at);
  if (!subject) {
    throw new Error(`Subject with ID ${subjectId} not found`);
  }

  // 1. Retrieve all verified question occurrences for this subject
  const subjectOccurrences = dbStore.questionOccurrences.filter(
    (occ) => occ.subject_id === subjectId && occ.verification_status === 'VERIFIED'
  );

  // 2. Identify distinct verified papers analyzed
  const distinctPapers = getDistinctVerifiedPapers(subjectOccurrences);
  const totalPapersAnalyzed = Math.max(distinctPapers.length, 1);
  const latestExamYear = distinctPapers.length > 0 ? Math.max(...distinctPapers.map((p) => p.year)) : 2024;
  const yearsAnalyzed = Array.from(new Set(distinctPapers.map((p) => p.year))).sort((a, b) => b - a);

  // 3. Retrieve units and topics
  const subjectUnits = dbStore.units.filter((u) => u.subject_id === subjectId);
  const unitMap = new Map<string, Unit>();
  for (const u of subjectUnits) {
    unitMap.set(u.id, u);
  }

  const subjectTopics = dbStore.topics.filter((t) => {
    const unit = unitMap.get(t.unit_id);
    return !!unit;
  });

  // 4. Retrieve published verified questions
  const subjectQuestions = dbStore.questions.filter(
    (q) => q.subject_id === subjectId && q.is_pyq && q.content_status === 'PUBLISHED' && !q.deleted_at
  );

  // Calculate overall marks pool across papers for unit weightage
  const totalMarksAllOccurrences = subjectOccurrences.reduce((acc, o) => acc + o.marks, 0);

  // -------------------------------------------------------------
  // Calculate Topic Priority Reports
  // -------------------------------------------------------------
  const topicsPriority: TopicPriorityReport[] = subjectTopics.map((topic) => {
    const unit = unitMap.get(topic.unit_id);
    const unitNumber = unit ? unit.unit_number : 1;
    const unitTitle = unit ? unit.title : 'General Unit';

    // Find questions for this topic
    const topicQuestions = subjectQuestions.filter((q) => q.topic_id === topic.id);
    const topicQuestionIds = new Set(topicQuestions.map((q) => q.id));

    // Find occurrences for questions of this topic
    const topicOccurrences = subjectOccurrences.filter((occ) => topicQuestionIds.has(occ.question_id));

    // Calculate distinct papers where this topic was asked
    const topicPapers = getDistinctVerifiedPapers(topicOccurrences);
    const paperCount = topicPapers.length;
    const frequencyRatio = totalPapersAnalyzed > 0 ? paperCount / totalPapersAnalyzed : 0;
    const frequencyPercentage = Math.round(frequencyRatio * 100);

    // Years and sessions
    const years = topicOccurrences.map((o) => o.year);
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
    const lastAppearedYear = uniqueYears.length > 0 ? uniqueYears[0] : null;
    const lastOcc = topicOccurrences.find((o) => o.year === lastAppearedYear);
    const lastAppearedSession = lastOcc ? lastOcc.exam_session : null;

    const recencyWeight = calculateRecencyWeight(years, latestExamYear);
    const recentPapersCount = topicOccurrences.filter((o) => o.year >= latestExamYear - 2).length;
    const streak = calculateConsecutiveYearStreak(years);

    // Marks patterns
    const marksList = topicOccurrences.map((o) => o.marks);
    const minMarks = marksList.length > 0 ? Math.min(...marksList) : 0;
    const maxMarks = marksList.length > 0 ? Math.max(...marksList) : 0;
    const totalMarks = marksList.reduce((a, b) => a + b, 0);
    const avgMarks = marksList.length > 0 ? totalMarks / marksList.length : topicQuestions[0]?.marks || 6;
    const typicalMarksRange = formatTypicalMarks(marksList.length > 0 ? marksList : [topicQuestions[0]?.marks || 6]);

    const marksDistribution: Record<string, number> = {
      '2M': topicOccurrences.filter((o) => o.marks === 2).length,
      '5M': topicOccurrences.filter((o) => o.marks === 5).length,
      '6M': topicOccurrences.filter((o) => o.marks === 6).length,
      '7M': topicOccurrences.filter((o) => o.marks === 7).length,
      '8M': topicOccurrences.filter((o) => o.marks === 8).length,
      '10M': topicOccurrences.filter((o) => o.marks >= 10).length,
    };

    // Unit weightage
    const unitOccurrences = subjectOccurrences.filter((o) => {
      const q = subjectQuestions.find((qu) => qu.id === o.question_id);
      return q && q.unit_id === topic.unit_id;
    });
    const unitMarksTotal = unitOccurrences.reduce((acc, o) => acc + o.marks, 0);
    const unitMarksPercentage =
      totalMarksAllOccurrences > 0 ? Math.round((unitMarksTotal / totalMarksAllOccurrences) * 100) : 0;

    // Recurrence
    const isRecurring = paperCount >= 2;
    const recurrenceRate = totalPapersAnalyzed > 0 ? Math.min(1.0, topicOccurrences.length / totalPapersAnalyzed) : 0;
    const repeatPattern =
      paperCount >= 4
        ? 'Consistent regular occurrence across almost all exam papers'
        : paperCount >= 2
        ? 'Repeated across multiple examination sessions'
        : paperCount === 1
        ? 'Single verified past paper occurrence'
        : 'Syllabus concept without verified past paper occurrence';

    // Trend
    let trendDirection: TrendDirection = 'STABLE';
    if (recentPapersCount >= 2 || streak >= 2) {
      trendDirection = 'HIGH';
    } else if (years.includes(latestExamYear) && paperCount <= 2) {
      trendDirection = 'EMERGING';
    }

    const trendScore = trendDirection === 'HIGH' ? 0.9 : trendDirection === 'EMERGING' ? 0.75 : 0.6;
    const trendExplanation =
      trendDirection === 'HIGH'
        ? 'Strong historical recurrence observed across recent university papers.'
        : trendDirection === 'EMERGING'
        ? 'Recent presence in latest examination cycles indicates growing evaluation focus.'
        : 'Maintains steady occasional testing pattern.';

    // Calculate composite score & priority
    const { score, priority } = calculateCompositeScore({
      frequencyRatio,
      recencyWeight,
      avgMarks,
      streak,
      syllabusImportance: topic.importance_level,
    });

    const explanation = generateExplainabilityText({
      paperCount,
      totalPapers: totalPapersAnalyzed,
      recentYears: uniqueYears,
      avgMarks,
      unitNumber,
      streak,
    });

    // Academic Recommendation
    let recommendation = '';
    if (priority === 'MUST_STUDY') {
      recommendation = `High priority based on historical PYQ patterns. Allocate dedicated revision for full ${Math.round(
        avgMarks
      )}-mark questions, formal definitions, and diagram walkthroughs.`;
    } else if (priority === 'VERY_HIGH') {
      recommendation = `Frequently examined concept based on past papers. Prepare step-by-step solutions and model comparisons.`;
    } else if (priority === 'HIGH') {
      recommendation = `Important examination topic. Practice solving 5-to-8 mark descriptive answers and standard numericals.`;
    } else if (priority === 'MEDIUM') {
      recommendation = `Moderate recurrence. Review key summary notes and standard short-answer definitions.`;
    } else {
      recommendation = `Low frequency. Familiarize with fundamental definitions and syllabus coverage points.`;
    }

    // Prep time
    const suggested_prep_time_minutes =
      priority === 'MUST_STUDY' ? 90 : priority === 'VERY_HIGH' ? 60 : priority === 'HIGH' ? 45 : 30;

    const signals: PYQSignals = {
      occurrenceFrequency: {
        totalOccurrences: topicOccurrences.length,
        distinctPapersCount: paperCount,
        totalPapersAnalyzed,
        frequencyRatio: Math.round(frequencyRatio * 100) / 100,
        frequencyPercentage,
      },
      recentAppearance: {
        lastAppearedYear,
        lastAppearedSession,
        recencyWeight,
        recentPapersCount,
        isRecent: lastAppearedYear !== null && lastAppearedYear >= latestExamYear - 1,
      },
      historicalConsistency: {
        consistencyIndex: Math.round((paperCount / totalPapersAnalyzed) * 100) / 100,
        spanYears: uniqueYears.length > 1 ? Math.max(...uniqueYears) - Math.min(...uniqueYears) : 0,
        consecutiveYearStreak: streak,
        isConsistentlyTested: streak >= 2 || paperCount >= 3,
      },
      marksPattern: {
        minMarks,
        maxMarks,
        avgMarks: Math.round(avgMarks * 10) / 10,
        typicalMarksRange,
        totalMarksContributed: totalMarks,
        marksDistribution,
      },
      topicImportance: {
        syllabusImportance: topic.importance_level,
        syllabusBaseScore: topic.importance_level === 'MUST_STUDY' ? 10 : 7,
        empiricalImportanceScore: score,
      },
      unitWeightage: {
        unitId: topic.unit_id,
        unitNumber,
        unitTitle,
        unitMarksTotal,
        unitMarksPercentage,
      },
      recurrence: {
        isRecurring,
        recurrenceRate: Math.round(recurrenceRate * 100) / 100,
        repeatPattern,
      },
      trend: {
        direction: trendDirection,
        trendScore,
        trendExplanation,
      },
    };

    return {
      topic_id: topic.id,
      topic_title: topic.title,
      unit_id: topic.unit_id,
      unit_number: unitNumber,
      unit_title: unitTitle,
      subject_id: subjectId,
      priority,
      composite_score: score,
      signals,
      explanation: sanitizeIntelligenceText(explanation),
      recommendation: sanitizeIntelligenceText(recommendation),
      typical_marks: typicalMarksRange,
      question_count: topicQuestions.length,
      suggested_prep_time_minutes,
    };
  });

  // Sort topics by composite score descending
  topicsPriority.sort((a, b) => b.composite_score - a.composite_score);

  // -------------------------------------------------------------
  // Group into Important Topic Lists
  // -------------------------------------------------------------
  const important_topic_lists: ImportantTopicLists = {
    must_study: topicsPriority.filter((t) => t.priority === 'MUST_STUDY'),
    very_high: topicsPriority.filter((t) => t.priority === 'VERY_HIGH'),
    high: topicsPriority.filter((t) => t.priority === 'HIGH'),
    medium: topicsPriority.filter((t) => t.priority === 'MEDIUM'),
    low: topicsPriority.filter((t) => t.priority === 'LOW'),
    summary_text: `Identified ${
      topicsPriority.filter((t) => t.priority === 'MUST_STUDY').length
    } MUST STUDY topics and ${
      topicsPriority.filter((t) => t.priority === 'VERY_HIGH').length
    } VERY HIGH priority topics across ${subjectUnits.length} syllabus units based on ${totalPapersAnalyzed} verified past papers.`,
  };

  // -------------------------------------------------------------
  // Calculate Question Frequency Reports
  // -------------------------------------------------------------
  const pyq_frequency: PYQFrequencyReport[] = subjectQuestions.map((q) => {
    const unit = unitMap.get(q.unit_id);
    const unitNumber = unit ? unit.unit_number : 1;
    const topic = subjectTopics.find((t) => t.id === q.topic_id);

    const occurrences = subjectOccurrences.filter((o) => o.question_id === q.id);
    const distinctPapersForQ = getDistinctVerifiedPapers(occurrences);
    const frequency = distinctPapersForQ.length;
    const frequency_percentage = Math.round((frequency / totalPapersAnalyzed) * 100);

    const years = occurrences.map((o) => o.year).sort((a, b) => b - a);
    const sessions = Array.from(new Set(occurrences.map((o) => o.exam_session)));
    const marksList = occurrences.map((o) => o.marks);
    const minMarks = marksList.length > 0 ? Math.min(...marksList) : q.marks;
    const maxMarks = marksList.length > 0 ? Math.max(...marksList) : q.marks;
    const avgMarks = marksList.length > 0 ? marksList.reduce((a, b) => a + b, 0) / marksList.length : q.marks;
    const typical_marks = formatTypicalMarks(marksList.length > 0 ? marksList : [q.marks]);

    // Priority for question
    let priority: PriorityCategory = 'MEDIUM';
    if (frequency >= 3 || (frequency >= 2 && avgMarks >= 8)) {
      priority = 'MUST_STUDY';
    } else if (frequency >= 2) {
      priority = 'VERY_HIGH';
    } else if (frequency === 1 && avgMarks >= 7) {
      priority = 'HIGH';
    } else if (frequency === 1) {
      priority = 'MEDIUM';
    } else {
      priority = 'LOW';
    }

    // Trend
    let trend: TrendDirection = 'STABLE';
    if (years.includes(latestExamYear) && frequency >= 2) {
      trend = 'HIGH';
    } else if (years.includes(latestExamYear)) {
      trend = 'EMERGING';
    }

    const explanation =
      frequency >= 2
        ? `Appeared in ${frequency} of the last ${totalPapersAnalyzed} verified papers (Years: ${years.join(', ')}).`
        : frequency === 1
        ? `Verified in ${years[0] || 2024} ${sessions[0] || 'End-Sem'} exam paper for ${q.marks} marks.`
        : `Verified syllabus question bank item.`;

    return {
      question_id: q.id,
      canonical_question: q.question_text,
      cluster_id: null,
      unit_id: q.unit_id,
      unit_number: unitNumber,
      topic_id: q.topic_id,
      topic_title: topic ? topic.title : null,
      frequency,
      total_papers: totalPapersAnalyzed,
      frequency_percentage,
      years,
      sessions,
      typical_marks,
      marks_range: {
        min: minMarks,
        max: maxMarks,
        avg: Math.round(avgMarks * 10) / 10,
      },
      priority,
      trend,
      explanation: sanitizeIntelligenceText(explanation),
      occurrences: occurrences.map((o) => ({
        id: o.id,
        year: o.year,
        exam_session: o.exam_session,
        question_number: o.question_number,
        marks: o.marks,
      })),
    };
  });

  pyq_frequency.sort((a, b) => b.frequency - a.frequency || b.marks_range.avg - a.marks_range.avg);

  // -------------------------------------------------------------
  // Calculate Unit Analysis Reports
  // -------------------------------------------------------------
  const unit_analysis: UnitAnalysisReport[] = subjectUnits.map((u) => {
    const unitQuestions = subjectQuestions.filter((q) => q.unit_id === u.id);
    const unitQuestionIds = new Set(unitQuestions.map((q) => q.id));
    const unitOccurrences = subjectOccurrences.filter((o) => unitQuestionIds.has(o.question_id));

    const totalMarks = unitOccurrences.reduce((sum, o) => sum + o.marks, 0);
    const weightage_percentage =
      totalMarksAllOccurrences > 0 ? Math.round((totalMarks / totalMarksAllOccurrences) * 100) : 0;
    const avg_question_marks =
      unitOccurrences.length > 0 ? Math.round((totalMarks / unitOccurrences.length) * 10) / 10 : 6;

    const unitTopics = topicsPriority.filter((t) => t.unit_id === u.id);
    const must_study_topics_count = unitTopics.filter((t) => t.priority === 'MUST_STUDY').length;

    const priority_distribution: Record<PriorityCategory, number> = {
      MUST_STUDY: unitTopics.filter((t) => t.priority === 'MUST_STUDY').length,
      VERY_HIGH: unitTopics.filter((t) => t.priority === 'VERY_HIGH').length,
      HIGH: unitTopics.filter((t) => t.priority === 'HIGH').length,
      MEDIUM: unitTopics.filter((t) => t.priority === 'MEDIUM').length,
      LOW: unitTopics.filter((t) => t.priority === 'LOW').length,
    };

    const difficulty_breakdown = {
      EASY: unitQuestions.filter((q) => q.difficulty === 'EASY').length,
      MEDIUM: unitQuestions.filter((q) => q.difficulty === 'MEDIUM').length,
      HARD: unitQuestions.filter((q) => q.difficulty === 'HARD').length,
    };

    const top_recurring_topics = unitTopics
      .filter((t) => t.signals.occurrenceFrequency.distinctPapersCount > 0)
      .slice(0, 3)
      .map((t) => t.topic_title);

    // Text Interpretation for unit chart / breakdown
    const text_interpretation = `Unit ${u.unit_number} (${u.title}) accounts for approximately ${weightage_percentage}% of total historical marks with ${unitOccurrences.length} verified exam appearances. ${
      must_study_topics_count > 0
        ? `Contains ${must_study_topics_count} MUST STUDY topic${must_study_topics_count > 1 ? 's' : ''} requiring prioritized revision.`
        : 'Balanced distribution across foundational topics.'
    } Primary marks concentration is in the ${avg_question_marks >= 7 ? 'long-answer (7–10 marks)' : 'standard descriptive (5–6 marks)'} category.`;

    return {
      unit_id: u.id,
      unit_number: u.unit_number,
      unit_title: u.title,
      total_marks: totalMarks,
      weightage_percentage,
      pyq_count: unitQuestions.length,
      occurrences_count: unitOccurrences.length,
      avg_question_marks,
      must_study_topics_count,
      priority_distribution,
      difficulty_breakdown,
      top_recurring_topics,
      text_interpretation: sanitizeIntelligenceText(text_interpretation),
    };
  });

  unit_analysis.sort((a, b) => a.unit_number - b.unit_number);

  // -------------------------------------------------------------
  // Calculate Marks Trends & Distributions
  // -------------------------------------------------------------
  const marksDistributionBuckets: Record<number, number> = {
    2: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    10: 0,
  };

  for (const occ of subjectOccurrences) {
    if (occ.marks <= 2) marksDistributionBuckets[2] = (marksDistributionBuckets[2] || 0) + 1;
    else if (occ.marks <= 5) marksDistributionBuckets[5] = (marksDistributionBuckets[5] || 0) + 1;
    else if (occ.marks === 6) marksDistributionBuckets[6] = (marksDistributionBuckets[6] || 0) + 1;
    else if (occ.marks === 7) marksDistributionBuckets[7] = (marksDistributionBuckets[7] || 0) + 1;
    else if (occ.marks === 8) marksDistributionBuckets[8] = (marksDistributionBuckets[8] || 0) + 1;
    else marksDistributionBuckets[10] = (marksDistributionBuckets[10] || 0) + 1;
  }

  const totalOcc = Math.max(subjectOccurrences.length, 1);
  const marks_buckets = [2, 5, 6, 7, 8, 10].map((m) => {
    const count = marksDistributionBuckets[m] || 0;
    return {
      marks: m,
      count,
      percentage: Math.round((count / totalOcc) * 100),
      label: m >= 10 ? '10+ Marks' : `${m} Marks`,
    };
  });

  // Year by year marks trend
  const yearMarksMap = new Map<number, { total_marks: number; question_count: number }>();
  for (const occ of subjectOccurrences) {
    const cur = yearMarksMap.get(occ.year) || { total_marks: 0, question_count: 0 };
    cur.total_marks += occ.marks;
    cur.question_count += 1;
    yearMarksMap.set(occ.year, cur);
  }

  const year_by_year_marks = Array.from(yearMarksMap.entries())
    .map(([year, data]) => ({
      year,
      total_marks: data.total_marks,
      question_count: data.question_count,
      avg_marks: data.question_count > 0 ? Math.round((data.total_marks / data.question_count) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.year - b.year);

  // Question type breakdown
  const qTypeMap = new Map<string, { count: number; totalMarks: number }>();
  for (const q of subjectQuestions) {
    const cur = qTypeMap.get(q.question_type) || { count: 0, totalMarks: 0 };
    cur.count += 1;
    cur.totalMarks += q.marks;
    qTypeMap.set(q.question_type, cur);
  }

  const question_type_distribution = Array.from(qTypeMap.entries()).map(([qType, val]) => ({
    question_type: qType,
    count: val.count,
    percentage: Math.round((val.count / Math.max(subjectQuestions.length, 1)) * 100),
    typical_marks: val.count > 0 ? Math.round(val.totalMarks / val.count) : 6,
  }));

  // Text Interpretation for marks trend
  const highWeightageCount = (marksDistributionBuckets[8] || 0) + (marksDistributionBuckets[10] || 0);
  const highWeightagePercentage = Math.round((highWeightageCount / totalOcc) * 100);
  const shortAnswerPercentage = Math.round(((marksDistributionBuckets[2] || 0) / totalOcc) * 100);

  const marks_text_interpretation = `Historical marks distribution shows ${highWeightagePercentage}% of exam questions carry 8 to 10 marks, making comprehensive long-answer structures critical for maximum scoring. Short 2-mark definitions comprise ${shortAnswerPercentage}% of occurrences, predominantly appearing in In-Sem assessments.`;

  const marks_trends: MarksTrendReport = {
    subject_id: subjectId,
    marks_buckets,
    year_by_year_marks,
    question_type_distribution,
    text_interpretation: sanitizeIntelligenceText(marks_text_interpretation),
  };

  // Overall Interpretation
  const topUnit = [...unit_analysis].sort((a, b) => b.weightage_percentage - a.weightage_percentage)[0];
  const lineage = getFullAcademicLineage(subjectId);
  const overall_text_interpretation = `Based on empirical analysis of ${totalPapersAnalyzed} verified examination papers (${yearsAnalyzed.join(
    ', '
  )}), ${subject.name} features heavy concentration in ${
    topUnit ? `Unit ${topUnit.unit_number} (${topUnit.unit_title}, ~${topUnit.weightage_percentage}%)` : 'core syllabus areas'
  }. Students focusing on the ${
    important_topic_lists.must_study.length
  } MUST STUDY and ${
    important_topic_lists.very_high.length
  } VERY HIGH priority topics address the majority of recurring university examination question patterns.`;

  return {
    subject_id: subjectId,
    subject_name: subject.name,
    subject_code: subject.code,
    university_id: lineage?.university?.id,
    university_name: lineage?.university?.name,
    pattern_id: lineage?.pattern?.id,
    pattern_name: lineage?.pattern?.name,
    branch_id: lineage?.branch?.id,
    branch_name: lineage?.branch?.name,
    total_papers_analyzed: totalPapersAnalyzed,
    total_verified_questions: subjectQuestions.length,
    total_occurrences: subjectOccurrences.length,
    years_analyzed: yearsAnalyzed,
    topics_priority: topicsPriority,
    important_topic_lists,
    pyq_frequency,
    unit_analysis,
    marks_trends,
    overall_text_interpretation: sanitizeIntelligenceText(overall_text_interpretation),
    disclaimer: MANDATORY_ETHICAL_DISCLAIMER,
    generated_at: new Date().toISOString(),
  };
}
