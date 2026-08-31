export type PriorityLevel = 'MUST_STUDY' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Pattern {
  id: string;
  name: string; // e.g. "2024 Pattern", "2019 Pattern"
  effectiveYear: number;
}

export interface Branch {
  id: string;
  code: string; // e.g. "COMP", "IT", "AIDS"
  name: string; // e.g. "Computer Engineering"
  description: string;
  iconName?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "210241"
  name: string; // e.g. "Database Management Systems (DBMS)"
  shortName: string; // "DBMS"
  branchId: string;
  semester: number; // 3 or 4 for SE
  year: 'FE' | 'SE' | 'TE' | 'BE';
  patternId: string;
  totalUnits: number;
  totalPYQs: number;
  isPopular?: boolean;
  isPremiumOnly?: boolean;
  price?: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  unitNumber: number; // 1 to 6
  title: string;
  description: string;
  pyqCount: number;
  weightagePercentage: number;
}

export interface QuestionCluster {
  id: string;
  conceptName: string; // e.g. "Normalization (1NF, 2NF, 3NF, BCNF)"
  unitId: string;
  topicName: string;
  frequency: number; // e.g. 4 (appeared in 4 out of 5 papers)
  totalPapersAnalyzed: number; // e.g. 5
  typicalMarks: string; // "5–10"
  lastAskedYear: number; // 2025
  priority: PriorityLevel;
  trend: 'HIGH' | 'STABLE' | 'EMERGING';
  variationCount: number;
}

export interface ExamAnswer {
  marks: 2 | 5 | 10;
  heading: string;
  summary: string;
  keyPoints: string[];
  diagramDescription?: string;
  exampleText?: string;
}

export interface PYQQuestion {
  id: string;
  subjectId: string;
  unitId: string;
  clusterId?: string;
  questionText: string;
  marks: number;
  examYear: number;
  examSession: 'In-Sem' | 'End-Sem' | 'May/June' | 'Nov/Dec';
  questionNumber: string; // e.g. "Q3(a)"
  priority: PriorityLevel;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  verified: boolean;
  answers: ExamAnswer[];
}

export interface NoteItem {
  id: string;
  subjectId: string;
  unitId: string;
  title: string;
  readTimeMinutes: number;
  isFreePreview: boolean;
  summary: string;
  keyTakeaways: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  marks: number;
}

export interface Quiz {
  id: string;
  subjectId: string;
  unitId?: string;
  title: string;
  durationMinutes: number;
  questionsCount: number;
  difficulty: 'Basic' | 'Exam Standard' | 'Advanced';
}

export interface ExamPlanItem {
  id: string;
  topicName: string;
  unitNumber: number;
  estimatedMinutes: number;
  priority: PriorityLevel;
  type: 'MUST_READ_NOTE' | 'SOLVE_PYQ' | 'PRACTICE_QUIZ' | 'REVISION';
  completed?: boolean;
}

export interface ExamPlanPreset {
  durationLabel: '2 Hours' | '5 Hours' | '1 Day' | '3 Days' | '7 Days';
  durationKey: '2h' | '5h' | '1d' | '3d' | '7d';
  title: string;
  description: string;
  items: ExamPlanItem[];
}
