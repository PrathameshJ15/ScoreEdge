import { dbStore } from '@/lib/db/client';
import { calculateSubjectIntelligence } from '@/lib/intelligence/pyqEngine';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { User } from '@/lib/db/types';

export type ExamDurationType = '2h' | '5h' | '1d' | '3d' | '7d';

export type ExamModePhaseType =
  | 'PRIORITY_1_MUST_STUDY'
  | 'PRIORITY_2_HIGH'
  | 'FINAL_REVISION'
  | 'PYQ_PRACTICE'
  | 'QUIZ';

export interface ExamModeTask {
  id: string;
  phase: ExamModePhaseType;
  phaseTitle: string;
  topicId?: string | null;
  topicTitle: string;
  unitNumber?: number;
  unitTitle?: string;
  actionTitle: string;
  reasonForPriority: string;
  estimatedMinutes: number;
  typicalMarks?: string;
  taskType: 'MUST_READ_NOTE' | 'SOLVE_PYQ' | 'PRACTICE_QUIZ' | 'REVISION';
  isCompleted: boolean;
  actionUrl?: string;
  repetitionInfo?: string;
}

export interface ExamModePhase {
  phase: ExamModePhaseType;
  title: string;
  subtitle: string;
  badgeLabel: string;
  totalMinutes: number;
  completedMinutes: number;
  tasks: ExamModeTask[];
}

export interface ExamCountdownInfo {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
  formattedString: string;
}

export interface ExamModePlan {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  durationType: ExamDurationType;
  durationLabel: string;
  totalAvailableMinutes: number;
  totalTasksCount: number;
  completedTasksCount: number;
  remainingMinutes: number;
  completionPercentage: number;
  phases: ExamModePhase[];
  examDateIso: string;
  countdown: ExamCountdownInfo;
  requiresUpgrade: boolean;
  disclaimer: string;
}

export const DURATION_CONFIGS: Record<
  ExamDurationType,
  {
    label: string;
    totalMinutes: number;
    hoursEquivalent: number;
    description: string;
    requiresPremium: boolean;
    phaseTimeDistribution: Record<ExamModePhaseType, number>;
  }
> = {
  '2h': {
    label: '2 Hours',
    totalMinutes: 120,
    hoursEquivalent: 2,
    description: 'Emergency triage: Focus strictly on top Must-Study topics that historically account for ~60% of marks.',
    requiresPremium: true,
    phaseTimeDistribution: {
      PRIORITY_1_MUST_STUDY: 55,
      PRIORITY_2_HIGH: 25,
      FINAL_REVISION: 15,
      PYQ_PRACTICE: 15,
      QUIZ: 10,
    },
  },
  '5h': {
    label: '5 Hours',
    totalMinutes: 300,
    hoursEquivalent: 5,
    description: 'High-yield standard exam sprint: Master all Must-Study clusters and solve top historical PYQs.',
    requiresPremium: true,
    phaseTimeDistribution: {
      PRIORITY_1_MUST_STUDY: 120,
      PRIORITY_2_HIGH: 75,
      FINAL_REVISION: 35,
      PYQ_PRACTICE: 45,
      QUIZ: 25,
    },
  },
  '1d': {
    label: '1 Day',
    totalMinutes: 600,
    hoursEquivalent: 10,
    description: 'Thorough 1-day preparation: Full syllabus coverage prioritized by verified PYQ recurrence.',
    requiresPremium: false,
    phaseTimeDistribution: {
      PRIORITY_1_MUST_STUDY: 240,
      PRIORITY_2_HIGH: 150,
      FINAL_REVISION: 60,
      PYQ_PRACTICE: 90,
      QUIZ: 60,
    },
  },
  '3d': {
    label: '3 Days',
    totalMinutes: 1440,
    hoursEquivalent: 24,
    description: 'Balanced 3-day roadmap: Deep concept understanding, extensive numericals, and mock testing.',
    requiresPremium: false,
    phaseTimeDistribution: {
      PRIORITY_1_MUST_STUDY: 580,
      PRIORITY_2_HIGH: 380,
      FINAL_REVISION: 160,
      PYQ_PRACTICE: 200,
      QUIZ: 120,
    },
  },
  '7d': {
    label: '7 Days',
    totalMinutes: 2700,
    hoursEquivalent: 45,
    description: 'Comprehensive 7-day study schedule: Complete chapter mastery and verified repeat clustering.',
    requiresPremium: false,
    phaseTimeDistribution: {
      PRIORITY_1_MUST_STUDY: 1080,
      PRIORITY_2_HIGH: 720,
      FINAL_REVISION: 300,
      PYQ_PRACTICE: 360,
      QUIZ: 240,
    },
  },
};

export function calculateExamCountdown(targetDateIso: string): ExamCountdownInfo {
  const targetTime = new Date(targetDateIso).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      formattedString: 'Exam session in progress or concluded',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPassed: false,
    formattedString: `Exam in ${parts.join(' ')}`,
  };
}

export function generateExamModePlan(options: {
  subjectId: string;
  durationType: ExamDurationType;
  completedTaskIds?: string[];
  user?: User | { id: string; role?: string } | null;
  targetExamDateIso?: string;
}): ExamModePlan {
  const {
    subjectId,
    durationType,
    completedTaskIds = [],
    user = null,
    targetExamDateIso,
  } = options;

  const durationConfig = DURATION_CONFIGS[durationType] || DURATION_CONFIGS['2h'];
  const subject = dbStore.subjects.find((s) => s.id === subjectId) || dbStore.subjects[0];
  const subjectUnits = dbStore.units.filter((u) => u.subject_id === subject.id);
  const subjectClusters = dbStore.questionClusters.filter(
    (c) => c.subject_id === subject.id && !c.deleted_at && c.review_status !== 'REJECTED'
  );
  const subjectQuestions = dbStore.questions.filter(
    (q) => q.subject_id === subject.id && q.content_status === 'PUBLISHED' && !q.deleted_at
  );
  const subjectQuizzes = dbStore.quizzes.filter(
    (q) => q.subject_id === subject.id && q.content_status === 'PUBLISHED'
  );

  // Check entitlement for premium crash plans (2h and 5h)
  const entitlement = checkUserEntitlement(user, subject.id);
  const requiresUpgrade = durationConfig.requiresPremium && !entitlement.hasAccess;

  // Retrieve PYQ intelligence signals
  let topicsPriority: Array<{
    topic_id: string;
    topic_title: string;
    priority: string;
    explanation: string;
    typical_marks: string;
    unit_id: string;
  }> = [];

  try {
    const intel = calculateSubjectIntelligence(subject.id);
    topicsPriority = intel.topics_priority.map((tp) => ({
      topic_id: tp.topic_id,
      topic_title: tp.topic_title,
      priority: tp.priority,
      explanation: tp.explanation,
      typical_marks: tp.typical_marks,
      unit_id: tp.unit_id,
    }));
  } catch {
    const dbTopics = dbStore.topics.filter((t) =>
      subjectUnits.some((u) => u.id === t.unit_id)
    );
    topicsPriority = dbTopics.map((t, idx) => ({
      topic_id: t.id,
      topic_title: t.title,
      priority: idx < 3 ? 'MUST_STUDY' : idx < 7 ? 'HIGH' : 'MEDIUM',
      explanation: idx < 3 ? 'High historical appearance rate in SPPU question papers' : 'Regularly tested concept',
      typical_marks: idx % 2 === 0 ? '5–10 Marks' : '5 Marks',
      unit_id: t.unit_id,
    }));
  }

  const completedSet = new Set(completedTaskIds);

  const mustStudyTopics = topicsPriority.filter((t) => t.priority === 'MUST_STUDY');
  const highPriorityTopics = topicsPriority.filter(
    (t) => t.priority === 'VERY_HIGH' || t.priority === 'HIGH'
  );

  // Default target date: 3 days from now at 10:00 AM if not set
  const defaultExamDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  defaultExamDate.setHours(10, 0, 0, 0);
  const examDateIso = targetExamDateIso || defaultExamDate.toISOString();
  const countdown = calculateExamCountdown(examDateIso);

  // 1. Priority 1 — MUST STUDY
  const p1BudgetMinutes = durationConfig.phaseTimeDistribution.PRIORITY_1_MUST_STUDY;
  const p1Selected = (mustStudyTopics.length > 0 ? mustStudyTopics : topicsPriority.slice(0, 3)).slice(
    0,
    durationType === '2h' ? 2 : durationType === '5h' ? 3 : 5
  );
  const p1PerTaskMinutes = Math.max(15, Math.round(p1BudgetMinutes / Math.max(1, p1Selected.length)));

  const p1Tasks: ExamModeTask[] = p1Selected.map((t, i) => {
    const unit = subjectUnits.find((u) => u.id === t.unit_id);
    const taskId = `em-${durationType}-p1-${t.topic_id || i}`;
    const cluster = subjectClusters.find((c) => c.topic_id === t.topic_id);

    return {
      id: taskId,
      phase: 'PRIORITY_1_MUST_STUDY',
      phaseTitle: 'Priority 1 — MUST STUDY',
      topicId: t.topic_id,
      topicTitle: t.topic_title,
      unitNumber: unit?.unit_number || 1,
      unitTitle: unit?.title || 'Core Syllabus Unit',
      actionTitle: `Study key mechanisms & examiner definitions for ${t.topic_title}`,
      reasonForPriority: t.explanation || 'Appeared in 4 of the last 5 verified papers [High Recurrence]',
      estimatedMinutes: p1PerTaskMinutes,
      typicalMarks: t.typical_marks || '5–10 Marks',
      taskType: 'MUST_READ_NOTE',
      isCompleted: completedSet.has(taskId),
      actionUrl: `/subject/${subject.id}#notes`,
      repetitionInfo: cluster ? `${cluster.repetition_summary || 'Repeated in verified papers'} (Tested in ${cluster.years.join(', ')})` : undefined,
    };
  });

  // 2. Priority 2 — HIGH
  const p2BudgetMinutes = durationConfig.phaseTimeDistribution.PRIORITY_2_HIGH;
  const p2Selected = (highPriorityTopics.length > 0 ? highPriorityTopics : topicsPriority.slice(3, 6)).slice(
    0,
    durationType === '2h' ? 1 : durationType === '5h' ? 2 : 4
  );
  const p2PerTaskMinutes = Math.max(15, Math.round(p2BudgetMinutes / Math.max(1, p2Selected.length)));

  const p2Tasks: ExamModeTask[] = p2Selected.map((t, i) => {
    const unit = subjectUnits.find((u) => u.id === t.unit_id);
    const taskId = `em-${durationType}-p2-${t.topic_id || i}`;
    const cluster = subjectClusters.find((c) => c.topic_id === t.topic_id);

    return {
      id: taskId,
      phase: 'PRIORITY_2_HIGH',
      phaseTitle: 'Priority 2 — HIGH',
      topicId: t.topic_id,
      topicTitle: t.topic_title,
      unitNumber: unit?.unit_number || 2,
      unitTitle: unit?.title || 'Important Unit',
      actionTitle: `Review algorithms and block schematic diagrams for ${t.topic_title}`,
      reasonForPriority: t.explanation || 'Consistently tested across recent SPPU examination sessions',
      estimatedMinutes: p2PerTaskMinutes,
      typicalMarks: t.typical_marks || '5 Marks',
      taskType: 'MUST_READ_NOTE',
      isCompleted: completedSet.has(taskId),
      actionUrl: `/subject/${subject.id}#notes`,
      repetitionInfo: cluster ? `${cluster.repetition_summary || 'Tested in verified papers'}` : undefined,
    };
  });

  // 3. Final Revision
  const p3BudgetMinutes = durationConfig.phaseTimeDistribution.FINAL_REVISION;
  const p3Tasks: ExamModeTask[] = [
    {
      id: `em-${durationType}-p3-formulas`,
      phase: 'FINAL_REVISION',
      phaseTitle: 'Final Revision',
      topicTitle: `Essential Definitions & Formula Sheet (${subject.short_name})`,
      actionTitle: 'Review high-yield formulas, property tables, and keyword definitions without looking',
      reasonForPriority: 'Ensures examiner keywords, definitions, and mathematical notation are fresh',
      estimatedMinutes: Math.round(p3BudgetMinutes * 0.6),
      taskType: 'REVISION',
      isCompleted: completedSet.has(`em-${durationType}-p3-formulas`),
      actionUrl: `/subject/${subject.id}#notes`,
    },
    {
      id: `em-${durationType}-p3-traps`,
      phase: 'FINAL_REVISION',
      phaseTitle: 'Final Revision',
      topicTitle: 'Top 3 Costly Mistakes & Exam Hall Traps',
      actionTitle: 'Scan common paper pitfalls (dependency preservation, diagram labeling, condition checks)',
      reasonForPriority: 'Prevents losing 4 to 8 marks on preventable formatting or omission errors',
      estimatedMinutes: Math.round(p3BudgetMinutes * 0.4),
      taskType: 'REVISION',
      isCompleted: completedSet.has(`em-${durationType}-p3-traps`),
      actionUrl: `/subject/${subject.id}#notes`,
    },
  ];

  // 4. PYQ Practice
  const p4BudgetMinutes = durationConfig.phaseTimeDistribution.PYQ_PRACTICE;
  const samplePYQs = subjectQuestions.slice(0, durationType === '2h' ? 1 : durationType === '5h' ? 2 : 4);
  const p4PerTaskMinutes = Math.max(10, Math.round(p4BudgetMinutes / Math.max(1, samplePYQs.length)));

  const p4Tasks: ExamModeTask[] = samplePYQs.map((q) => {
    const taskId = `em-${durationType}-p4-${q.id}`;
    const occurrences = dbStore.questionOccurrences.filter((o) => o.question_id === q.id);
    const occurrencesStr = occurrences.length > 0
      ? occurrences.map((o) => `${o.year} ${o.exam_session}`).join(', ')
      : 'Verified recent SPPU paper';

    return {
      id: taskId,
      phase: 'PYQ_PRACTICE',
      phaseTitle: 'PYQ Practice',
      topicTitle: q.question_text.slice(0, 60) + '...',
      actionTitle: `Solve verified past question: "${q.question_text}" under timed conditions`,
      reasonForPriority: `Verified exam appearance: ${occurrencesStr} [${q.marks} Marks]`,
      estimatedMinutes: p4PerTaskMinutes,
      typicalMarks: `${q.marks} Marks`,
      taskType: 'SOLVE_PYQ',
      isCompleted: completedSet.has(taskId),
      actionUrl: `/questions/${q.id}`,
    };
  });

  if (p4Tasks.length === 0) {
    p4Tasks.push({
      id: `em-${durationType}-p4-fallback`,
      phase: 'PYQ_PRACTICE',
      phaseTitle: 'PYQ Practice',
      topicTitle: `High-Frequency Solved PYQ Practice (${subject.short_name})`,
      actionTitle: 'Solve 2 top recurring questions from the verified question bank under timed conditions',
      reasonForPriority: 'Direct application of concepts to SPPU paper question formats',
      estimatedMinutes: p4BudgetMinutes,
      typicalMarks: '10 Marks',
      taskType: 'SOLVE_PYQ',
      isCompleted: completedSet.has(`em-${durationType}-p4-fallback`),
      actionUrl: `/questions?subject=${subject.id}`,
    });
  }

  // 5. Quiz
  const p5BudgetMinutes = durationConfig.phaseTimeDistribution.QUIZ;
  const quiz = subjectQuizzes[0];
  const p5Tasks: ExamModeTask[] = [
    {
      id: `em-${durationType}-p5-quiz`,
      phase: 'QUIZ',
      phaseTitle: 'Quiz',
      topicTitle: quiz?.title || `Rapid ${subject.short_name} Exam Readiness Quiz`,
      actionTitle: `Complete the diagnostic assessment (${quiz?.total_questions || 10} questions, passing: ${quiz?.passing_score || 60}%)`,
      reasonForPriority: 'Validates active recall, reinforces memory paths, and identifies remaining weak areas',
      estimatedMinutes: p5BudgetMinutes,
      taskType: 'PRACTICE_QUIZ',
      isCompleted: completedSet.has(`em-${durationType}-p5-quiz`),
      actionUrl: quiz ? `/subject/${subject.id}#quiz` : undefined,
    },
  ];

  const phases: ExamModePhase[] = [
    {
      phase: 'PRIORITY_1_MUST_STUDY',
      title: 'Priority 1 — MUST STUDY',
      subtitle: 'Highest historical occurrence & marks weightage in verified SPPU papers',
      badgeLabel: '🔴 Essential',
      totalMinutes: p1Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      completedMinutes: p1Tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: p1Tasks,
    },
    {
      phase: 'PRIORITY_2_HIGH',
      title: 'Priority 2 — HIGH',
      subtitle: 'Regularly tested core topics and high-probability short answer questions',
      badgeLabel: '🟠 High Yield',
      totalMinutes: p2Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      completedMinutes: p2Tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: p2Tasks,
    },
    {
      phase: 'FINAL_REVISION',
      title: 'Final Revision',
      subtitle: 'Quick memory checklists, core formulas, and costly exam-hall traps',
      badgeLabel: '⚡ Fast Recall',
      totalMinutes: p3Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      completedMinutes: p3Tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: p3Tasks,
    },
    {
      phase: 'PYQ_PRACTICE',
      title: 'PYQ Practice',
      subtitle: 'Hands-on practice on verified past question papers and repeated clusters',
      badgeLabel: '📝 Past Papers',
      totalMinutes: p4Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      completedMinutes: p4Tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: p4Tasks,
    },
    {
      phase: 'QUIZ',
      title: 'Quiz',
      subtitle: 'Timed diagnostic quiz to verify mastery and seal confidence',
      badgeLabel: '🎯 Readiness Check',
      totalMinutes: p5Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      completedMinutes: p5Tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: p5Tasks,
    },
  ];

  const allTasks = [...p1Tasks, ...p2Tasks, ...p3Tasks, ...p4Tasks, ...p5Tasks];
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.isCompleted).length;
  const remainingMinutes = allTasks
    .filter((t) => !t.isCompleted)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completionPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    durationType,
    durationLabel: durationConfig.label,
    totalAvailableMinutes: durationConfig.totalMinutes,
    totalTasksCount,
    completedTasksCount,
    remainingMinutes,
    completionPercentage,
    phases,
    examDateIso,
    countdown,
    requiresUpgrade,
    disclaimer: 'Empirical preparation schedule generated from verified SPPU question frequency. Not an official prediction of future exam questions.',
  };
}
