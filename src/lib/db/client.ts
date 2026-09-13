import {
  University,
  Pattern,
  Branch,
  AcademicYear,
  Semester,
  Subject,
  Unit,
  Topic,
  SyllabusItem,
  ContentSource,
  Question,
  QuestionOccurrence,
  QuestionCluster,
  QuestionClusterMember,
  Answer,
  Note,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  StudentProgress,
  StudyPlan,
  StudyPlanTask,
  Product,
  Order,
  Payment,
  Entitlement,
  VerificationRecord,
  User,
  StudySession,
  ExamModeRecord,
  RevisionRecord,
  PaginatedResult,
  AnalyticsEvent,
  UserStudyFile,
  StudyFileChunk,
  AISession,
  AIMessage,
} from './types';
import {
  SEED_UNIVERSITIES,
  SEED_PATTERNS,
  SEED_BRANCHES,
  SEED_ACADEMIC_YEARS,
  SEED_SEMESTERS,
  SEED_SUBJECTS,
  SEED_UNITS,
  SEED_TOPICS,
  SEED_SYLLABUS_ITEMS,
  SEED_CONTENT_SOURCES,
  SEED_QUESTIONS,
  SEED_QUESTION_OCCURRENCES,
  SEED_QUESTION_CLUSTERS,
  SEED_CLUSTER_MEMBERS,
  SEED_ANSWERS,
  SEED_NOTES,
  SEED_QUIZZES,
  SEED_QUIZ_QUESTIONS,
  SEED_PRODUCTS,
  SEED_USERS,
  SEED_ENTITLEMENTS,
  SEED_PROGRESS,
  SEED_STUDY_PLANS,
  SEED_STUDY_PLAN_TASKS,
  SEED_ORDERS,
  SEED_PAYMENTS,
  SEED_QUIZ_ATTEMPTS,
  SEED_STUDY_SESSIONS,
  SEED_EXAM_MODE_RECORDS,
  SEED_REVISION_RECORDS,
  SEED_VERIFICATION_RECORDS,
  SEED_ANALYTICS_EVENTS,
} from './seedData';

class DatabaseStore {
  private static instance: DatabaseStore;

  public universities: University[] = [...SEED_UNIVERSITIES];
  public patterns: Pattern[] = [...SEED_PATTERNS];
  public branches: Branch[] = [...SEED_BRANCHES];
  public academicYears: AcademicYear[] = [...SEED_ACADEMIC_YEARS];
  public semesters: Semester[] = [...SEED_SEMESTERS];
  public subjects: Subject[] = [...SEED_SUBJECTS];
  public units: Unit[] = [...SEED_UNITS];
  public topics: Topic[] = [...SEED_TOPICS];
  public syllabusItems: SyllabusItem[] = [...SEED_SYLLABUS_ITEMS];
  public contentSources: ContentSource[] = [...SEED_CONTENT_SOURCES];
  public questions: Question[] = [...SEED_QUESTIONS];
  public questionOccurrences: QuestionOccurrence[] = [...SEED_QUESTION_OCCURRENCES];
  public questionClusters: QuestionCluster[] = [...SEED_QUESTION_CLUSTERS];
  public questionClusterMembers: QuestionClusterMember[] = [...SEED_CLUSTER_MEMBERS];
  public answers: Answer[] = [...SEED_ANSWERS];
  public notes: Note[] = [...SEED_NOTES];
  public quizzes: Quiz[] = [...SEED_QUIZZES];
  public quizQuestions: QuizQuestion[] = [...SEED_QUIZ_QUESTIONS];
  public quizAttempts: QuizAttempt[] = [...SEED_QUIZ_ATTEMPTS];
  public studentProgress: StudentProgress[] = [...SEED_PROGRESS];
  public studyPlans: StudyPlan[] = [...SEED_STUDY_PLANS];
  public studyPlanTasks: StudyPlanTask[] = [...SEED_STUDY_PLAN_TASKS];
  public studySessions: StudySession[] = [...SEED_STUDY_SESSIONS];
  public examModeRecords: ExamModeRecord[] = [...SEED_EXAM_MODE_RECORDS];
  public revisionRecords: RevisionRecord[] = [...SEED_REVISION_RECORDS];
  public products: Product[] = [...SEED_PRODUCTS];
  public orders: Order[] = [...SEED_ORDERS];
  public payments: Payment[] = [...SEED_PAYMENTS];
  public entitlements: Entitlement[] = [...SEED_ENTITLEMENTS];
  public verificationRecords: VerificationRecord[] = [...SEED_VERIFICATION_RECORDS];
  public analyticsEvents: AnalyticsEvent[] = [...SEED_ANALYTICS_EVENTS];
  public users: User[] = [...SEED_USERS];
  public passwordResets: Array<{ email: string; token: string; expires_at: number }> = [];
  public userStudyFiles: UserStudyFile[] = [];
  public studyFileChunks: StudyFileChunk[] = [];
  public aiSessions: AISession[] = [];
  public aiMessages: AIMessage[] = [];

  private constructor() {}

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  public reset(): void {
    this.universities = SEED_UNIVERSITIES.map(x => ({ ...x }));
    this.patterns = SEED_PATTERNS.map(x => ({ ...x }));
    this.branches = SEED_BRANCHES.map(x => ({ ...x }));
    this.academicYears = SEED_ACADEMIC_YEARS.map(x => ({ ...x }));
    this.semesters = SEED_SEMESTERS.map(x => ({ ...x }));
    this.subjects = SEED_SUBJECTS.map(x => ({ ...x }));
    this.units = SEED_UNITS.map(x => ({ ...x }));
    this.topics = SEED_TOPICS.map(x => ({ ...x }));
    this.syllabusItems = SEED_SYLLABUS_ITEMS.map(x => ({ ...x }));
    this.contentSources = SEED_CONTENT_SOURCES.map(x => ({ ...x }));
    this.questions = SEED_QUESTIONS.map(x => ({ ...x }));
    this.questionOccurrences = SEED_QUESTION_OCCURRENCES.map(x => ({ ...x }));
    this.questionClusters = SEED_QUESTION_CLUSTERS.map(x => ({ ...x }));
    this.questionClusterMembers = SEED_CLUSTER_MEMBERS.map(x => ({ ...x }));
    this.answers = SEED_ANSWERS.map(x => ({ ...x }));
    this.notes = SEED_NOTES.map(x => ({ ...x }));
    this.quizzes = SEED_QUIZZES.map(x => ({ ...x }));
    this.quizQuestions = SEED_QUIZ_QUESTIONS.map(x => ({ ...x }));
    this.quizAttempts = SEED_QUIZ_ATTEMPTS.map(x => ({ ...x }));
    this.studentProgress = SEED_PROGRESS.map(x => ({ ...x }));
    this.studyPlans = SEED_STUDY_PLANS.map(x => ({ ...x }));
    this.studyPlanTasks = SEED_STUDY_PLAN_TASKS.map(x => ({ ...x }));
    this.studySessions = SEED_STUDY_SESSIONS.map(x => ({ ...x }));
    this.examModeRecords = SEED_EXAM_MODE_RECORDS.map(x => ({ ...x }));
    this.revisionRecords = SEED_REVISION_RECORDS.map(x => ({ ...x }));
    this.products = SEED_PRODUCTS.map(x => ({ ...x }));
    this.orders = SEED_ORDERS.map(x => ({ ...x }));
    this.payments = SEED_PAYMENTS.map(x => ({ ...x }));
    this.entitlements = SEED_ENTITLEMENTS.map(x => ({ ...x }));
    this.verificationRecords = SEED_VERIFICATION_RECORDS.map(x => ({ ...x }));
    this.analyticsEvents = SEED_ANALYTICS_EVENTS.map(x => ({ ...x, properties: { ...x.properties } }));
    this.users = SEED_USERS.map(x => ({ ...x }));
    this.passwordResets = [];
    this.userStudyFiles = [];
    this.studyFileChunks = [];
    this.aiSessions = [];
    this.aiMessages = [];
  }
}

export const dbStore = DatabaseStore.getInstance();

export function paginateArray<T>(items: T[], page = 1, limit = 20): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const total = items.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const startIndex = (safePage - 1) * safeLimit;
  const paginatedData = items.slice(startIndex, startIndex + safeLimit);

  return {
    data: paginatedData,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}
