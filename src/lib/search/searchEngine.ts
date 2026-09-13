import { dbStore } from '@/lib/db/client';
import { PriorityLevel } from '@/lib/db/types';
import { getFilteredSubjects } from '@/lib/curriculum/hierarchy';

export type SearchCategory = 'ALL' | 'TOPICS' | 'QUESTIONS' | 'PYQS' | 'NOTES' | 'ANSWERS';

export interface SearchFilterOptions {
  university_id?: string;
  pattern_id?: string;
  branch_id?: string;
  academic_year_id?: string;
  semester_id?: string;
  subject_id?: string;
  unit_id?: string;
  category?: SearchCategory;
  priority?: PriorityLevel;
  marks?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  category: 'TOPIC' | 'QUESTION' | 'PYQ' | 'NOTE' | 'ANSWER';
  title: string;
  subtitle: string;
  snippet: string;
  url: string;
  score: number;
  priority?: PriorityLevel;
  marks?: number;
  subject_id?: string;
  subject_name?: string;
  university_id?: string;
  university_name?: string;
  branch_id?: string;
  branch_name?: string;
  unit_number?: number;
  is_pyq?: boolean;
  occurrences_count?: number;
  cluster_name?: string;
  match_type: 'EXACT' | 'TOKEN' | 'PARTIAL' | 'SEMANTIC';
}

export interface GroupedSearchResults {
  query: string;
  total_matches: number;
  search_time_ms: number;
  results: {
    topics: SearchResultItem[];
    questions: SearchResultItem[];
    pyqs: SearchResultItem[];
    notes: SearchResultItem[];
    answers: SearchResultItem[];
  };
  matched_subjects: Array<{ id: string; name: string; code: string; short_name: string }>;
  matched_units: Array<{ id: string; title: string; unit_number: number; subject_id: string }>;
  matched_clusters: Array<{ id: string; canonical_name: string; occurrence_count: number }>;
  popular_searches: string[];
  suggestions?: string[];
}

/**
 * Architecture hook for future natural language / vector embedding search.
 * AI is NOT mandatory for basic search, but this hook allows future pgvector
 * or semantic rerankers to attach seamlessly without rewriting search models.
 */
export interface SemanticSearchHook {
  vectorEmbedding?: number[];
  semanticConfidence?: number;
  semanticReranker?: (items: SearchResultItem[], vector: number[]) => SearchResultItem[];
}

export const POPULAR_SPPU_SEARCHES = [
  '3NF vs BCNF',
  'ACID Properties',
  'Two-Phase Locking (2PL)',
  'Conflict Serializability',
  'Functional Dependencies',
  'Deadlock Prevention',
  'Relational Algebra Operations',
  'Lossless Join Decomposition',
  'View Serializability',
  'Write-Ahead Logging (WAL)',
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculate relevance score between query and target strings.
 */
function scoreTextMatch(
  query: string,
  queryTokens: string[],
  target: string | undefined | null,
  fieldWeight: number = 1.0
): { score: number; matchType: 'EXACT' | 'TOKEN' | 'PARTIAL' | 'NONE' } {
  if (!target) return { score: 0, matchType: 'NONE' };

  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();

  if (q.length === 0 || t.length === 0) return { score: 0, matchType: 'NONE' };

  // 1. Exact phrase match (+120 * weight)
  if (t === q) {
    return { score: 120 * fieldWeight, matchType: 'EXACT' };
  }

  // 2. Exact substring match (+80 * weight)
  if (t.includes(q)) {
    return { score: 80 * fieldWeight, matchType: 'EXACT' };
  }

  // 3. Token-level overlap
  let tokenScore = 0;
  let matchesCount = 0;

  for (const token of queryTokens) {
    if (token.length < 2) continue;

    // Word boundary match safely escaped against regex injection
    try {
      const regex = new RegExp(`\\b${escapeRegex(token)}`, 'i');
      if (regex.test(t)) {
        tokenScore += 35 * fieldWeight;
        matchesCount++;
      } else if (t.includes(token)) {
        tokenScore += 15 * fieldWeight;
        matchesCount++;
      }
    } catch {
      if (t.includes(token)) {
        tokenScore += 15 * fieldWeight;
        matchesCount++;
      }
    }
  }

  if (matchesCount > 0) {
    // Reward matching multiple tokens in the same document
    const multiMatchBonus = matchesCount * 10;
    return { score: tokenScore + multiMatchBonus, matchType: matchesCount === queryTokens.length ? 'TOKEN' : 'PARTIAL' };
  }

  return { score: 0, matchType: 'NONE' };
}

/**
 * Extract a concise snippet around the matched terms.
 */
function extractSnippet(text: string | undefined | null, queryTokens: string[], maxLength: number = 150): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;

  const lower = clean.toLowerCase();
  let firstIdx = -1;

  for (const token of queryTokens) {
    if (token.length < 2) continue;
    const idx = lower.indexOf(token);
    if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
      firstIdx = idx;
    }
  }

  if (firstIdx === -1) {
    return clean.slice(0, maxLength) + '...';
  }

  const start = Math.max(0, firstIdx - 30);
  const end = Math.min(clean.length, start + maxLength);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < clean.length ? '...' : '';

  return prefix + clean.slice(start, end).trim() + suffix;
}

/**
 * Unified ScoreEdge Search Execution Engine
 */
export function executeUnifiedSearch(
  query: string,
  options: SearchFilterOptions = {},
  semanticHook?: SemanticSearchHook
): GroupedSearchResults {
  const startTime = performance.now();
  const trimmedQuery = (query || '').trim();
  const queryTokens = trimmedQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 1);

  // If query is empty, return empty grouped results with popular searches
  if (!trimmedQuery) {
    return {
      query: '',
      total_matches: 0,
      search_time_ms: Math.round(performance.now() - startTime),
      results: {
        topics: [],
        questions: [],
        pyqs: [],
        notes: [],
        answers: [],
      },
      matched_subjects: [],
      matched_units: [],
      matched_clusters: [],
      popular_searches: POPULAR_SPPU_SEARCHES,
      suggestions: ['Try searching: "3NF vs BCNF", "Transactions", "ACID", "2PL"'],
    };
  }

  const {
    university_id,
    pattern_id,
    branch_id,
    academic_year_id,
    semester_id,
    subject_id,
    unit_id,
    category = 'ALL',
    priority,
    marks,
    limit = 30,
  } = options;

  // Filter eligible subjects across the multi-tier hierarchy if specified
  const eligibleSubjectIds: Set<string> | null =
    university_id || pattern_id || branch_id || academic_year_id || semester_id
      ? new Set(
          getFilteredSubjects({
            university_id,
            pattern_id,
            branch_id,
            academic_year_id,
            semester_id,
          }).map((s) => s.id)
        )
      : null;

  // Cache lookup tables for fast enrichment
  const subjectsMap = new Map(dbStore.subjects.map((s) => [s.id, s]));
  const unitsMap = new Map(dbStore.units.map((u) => [u.id, u]));
  const topicsMap = new Map(dbStore.topics.map((t) => [t.id, t]));
  const questionsMap = new Map(dbStore.questions.map((q) => [q.id, q]));
  const clustersMap = new Map(dbStore.questionClusters.map((c) => [c.id, c]));
  const patternsMap = new Map(dbStore.patterns.map((p) => [p.id, p]));
  const universitiesMap = new Map(dbStore.universities.map((u) => [u.id, u]));
  const branchesMap = new Map(dbStore.branches.map((b) => [b.id, b]));

  const getAcademicContext = (subId?: string) => {
    if (!subId) return {};
    const sub = subjectsMap.get(subId);
    if (!sub) return {};
    const pat = patternsMap.get(sub.pattern_id);
    const uni = pat ? universitiesMap.get(pat.university_id) : null;
    const br = branchesMap.get(sub.branch_id);
    return {
      subject_id: sub.id,
      subject_name: sub.short_name,
      university_id: uni?.id,
      university_name: uni?.name,
      branch_id: br?.id,
      branch_name: br?.name,
    };
  };

  // Auxiliary container matches
  const matchedSubjects: Array<{ id: string; name: string; code: string; short_name: string }> = [];
  const matchedUnits: Array<{ id: string; title: string; unit_number: number; subject_id: string }> = [];
  const matchedClusters: Array<{ id: string; canonical_name: string; occurrence_count: number }> = [];

  // Categorized search result collectors
  const topicResults: SearchResultItem[] = [];
  const questionResults: SearchResultItem[] = [];
  const pyqResults: SearchResultItem[] = [];
  const noteResults: SearchResultItem[] = [];
  const answerResults: SearchResultItem[] = [];

  // 1. Search Subjects (Auxiliary Navigation Match)
  for (const s of dbStore.subjects) {
    if (eligibleSubjectIds && !eligibleSubjectIds.has(s.id)) continue;
    if (subject_id && s.id !== subject_id) continue;
    const match = scoreTextMatch(trimmedQuery, queryTokens, `${s.name} ${s.short_name} ${s.code}`, 2.0);
    if (match.score > 0) {
      matchedSubjects.push({ id: s.id, name: s.name, code: s.code, short_name: s.short_name });
    }
  }

  // 2. Search Units (Auxiliary Navigation Match)
  for (const u of dbStore.units) {
    if (eligibleSubjectIds && !eligibleSubjectIds.has(u.subject_id)) continue;
    if (subject_id && u.subject_id !== subject_id) continue;
    if (unit_id && u.id !== unit_id) continue;
    const match = scoreTextMatch(trimmedQuery, queryTokens, `Unit ${u.unit_number} ${u.title} ${u.description}`, 1.8);
    if (match.score > 0) {
      matchedUnits.push({ id: u.id, title: u.title, unit_number: u.unit_number, subject_id: u.subject_id });
    }
  }

  // 3. Search Question Clusters (Intelligence Repetition Match)
  for (const c of dbStore.questionClusters) {
    if (eligibleSubjectIds && !eligibleSubjectIds.has(c.subject_id)) continue;
    if (subject_id && c.subject_id !== subject_id) continue;
    const match = scoreTextMatch(trimmedQuery, queryTokens, `${c.canonical_name} ${c.canonical_question}`, 2.2);
    if (match.score > 0) {
      matchedClusters.push({ id: c.id, canonical_name: c.canonical_name, occurrence_count: c.occurrence_count });
    }
  }

  // 4. Search Topics (Group: Topics)
  if (category === 'ALL' || category === 'TOPICS') {
    for (const t of dbStore.topics) {
      const unit = unitsMap.get(t.unit_id);
      if (unit_id && t.unit_id !== unit_id) continue;
      if (subject_id && unit?.subject_id !== subject_id) continue;
      if (priority && t.importance_level !== priority) continue;

      const titleMatch = scoreTextMatch(trimmedQuery, queryTokens, t.title, 3.0);
      const descMatch = scoreTextMatch(trimmedQuery, queryTokens, t.description, 1.2);
      const totalScore = titleMatch.score + descMatch.score;

      if (totalScore > 0) {
        // Priority boost
        const priorityBoost =
          t.importance_level === 'MUST_STUDY' ? 20 : t.importance_level === 'HIGH' ? 10 : 0;
        const finalScore = totalScore + priorityBoost;

        const sub = unit ? subjectsMap.get(unit.subject_id) : undefined;
        if (eligibleSubjectIds && sub?.id && !eligibleSubjectIds.has(sub.id)) continue;

        topicResults.push({
          id: t.id,
          category: 'TOPIC',
          title: t.title,
          subtitle: `${sub?.short_name || 'Subject'} • Unit ${unit?.unit_number || 1} • ${t.importance_level}`,
          snippet: extractSnippet(t.description, queryTokens),
          url: `/questions?subject_id=${sub?.id || 'sub-dbms'}&unit_id=${unit?.id || ''}&topic_id=${t.id}`,
          score: finalScore,
          priority: t.importance_level,
          unit_number: unit?.unit_number,
          match_type: titleMatch.matchType === 'EXACT' ? 'EXACT' : 'TOKEN',
          ...getAcademicContext(sub?.id),
        });
      }
    }
  }

  // 5. Search Questions & PYQs (Groups: Questions and PYQs)
  if (category === 'ALL' || category === 'QUESTIONS' || category === 'PYQS') {
    for (const q of dbStore.questions) {
      const topic = q.topic_id ? topicsMap.get(q.topic_id) : undefined;
      const unit = topic ? unitsMap.get(topic.unit_id) : (q.unit_id ? unitsMap.get(q.unit_id) : undefined);
      const sub = q.subject_id ? subjectsMap.get(q.subject_id) : (unit ? subjectsMap.get(unit.subject_id) : undefined);

      if (eligibleSubjectIds && sub?.id && !eligibleSubjectIds.has(sub.id)) continue;
      if (subject_id && sub?.id !== subject_id) continue;
      if (unit_id && unit?.id !== unit_id) continue;

      const occurrences = dbStore.questionOccurrences.filter((o) => o.question_id === q.id);
      const questionPriority: PriorityLevel =
        topic?.importance_level ||
        (occurrences.length >= 3 ? 'MUST_STUDY' : occurrences.length >= 2 ? 'HIGH' : 'MEDIUM');

      if (priority && questionPriority !== priority) continue;
      if (marks && q.marks !== marks) continue;

      const textMatch = scoreTextMatch(trimmedQuery, queryTokens, q.question_text, 2.5);
      const subtopicMatch = scoreTextMatch(trimmedQuery, queryTokens, topic?.title, 1.5);
      const totalScore = textMatch.score + subtopicMatch.score;

      if (totalScore > 0) {
        const priorityBoost =
          questionPriority === 'MUST_STUDY' ? 25 : questionPriority === 'HIGH' ? 15 : 0;
        const occurrenceBoost = occurrences.length * 5;
        const finalScore = totalScore + priorityBoost + occurrenceBoost;

        const isPyq = q.is_pyq || occurrences.length > 0;

        const cluster = dbStore.questionClusterMembers.find((m) => m.question_id === q.id);
        const parentCluster = cluster ? clustersMap.get(cluster.cluster_id) : undefined;

        const item: SearchResultItem = {
          id: q.id,
          category: isPyq ? 'PYQ' : 'QUESTION',
          title: q.question_text,
          subtitle: `${sub?.short_name || 'Subject'} • ${q.marks} Marks • ${questionPriority} • ${occurrences.length > 0 ? `Repeated in ${occurrences.length} papers` : 'Exam Question'}`,
          snippet: extractSnippet(q.question_text, queryTokens),
          url: `/questions/${q.id}`,
          score: finalScore,
          priority: questionPriority,
          marks: q.marks,
          unit_number: unit?.unit_number,
          is_pyq: isPyq,
          occurrences_count: occurrences.length,
          cluster_name: parentCluster?.canonical_name,
          match_type: textMatch.matchType === 'EXACT' ? 'EXACT' : 'TOKEN',
          ...getAcademicContext(sub?.id),
        };

        if (isPyq && (category === 'ALL' || category === 'PYQS')) {
          pyqResults.push(item);
        } else if (!isPyq && (category === 'ALL' || category === 'QUESTIONS')) {
          questionResults.push(item);
        }
      }
    }
  }

  // 6. Search Notes (Group: Notes)
  if (category === 'ALL' || category === 'NOTES') {
    for (const n of dbStore.notes) {
      const topic = n.topic_id ? topicsMap.get(n.topic_id) : undefined;
      const unit = topic ? unitsMap.get(topic.unit_id) : (n.unit_id ? unitsMap.get(n.unit_id) : undefined);
      const sub = n.subject_id ? subjectsMap.get(n.subject_id) : (unit ? subjectsMap.get(unit.subject_id) : undefined);

      if (eligibleSubjectIds && sub?.id && !eligibleSubjectIds.has(sub.id)) continue;
      if (subject_id && sub?.id !== subject_id) continue;
      if (unit_id && unit?.id !== unit_id) continue;

      const titleMatch = scoreTextMatch(trimmedQuery, queryTokens, n.title, 2.8);
      const summaryMatch = scoreTextMatch(trimmedQuery, queryTokens, n.summary, 1.8);
      const bodyMatch = scoreTextMatch(trimmedQuery, queryTokens, n.content_body, 1.0);
      const totalScore = titleMatch.score + summaryMatch.score + bodyMatch.score;

      if (totalScore > 0) {
        noteResults.push({
          id: n.id,
          category: 'NOTE',
          title: n.title,
          subtitle: `${sub?.short_name || 'Subject'} • ${n.read_time_minutes} min read • Verified Note`,
          snippet: extractSnippet(n.summary || n.content_body, queryTokens),
          url: `/questions?subject_id=${sub?.id || 'sub-dbms'}&topic_id=${n.topic_id}`,
          score: totalScore,
          unit_number: unit?.unit_number,
          match_type: titleMatch.matchType === 'EXACT' ? 'EXACT' : 'TOKEN',
          ...getAcademicContext(sub?.id),
        });
      }
    }
  }

  // 7. Search Solved Answers (Group: Answers)
  if (category === 'ALL' || category === 'ANSWERS') {
    for (const a of dbStore.answers) {
      const question = questionsMap.get(a.question_id);
      const topic = question?.topic_id ? topicsMap.get(question.topic_id) : undefined;
      const unit = topic ? unitsMap.get(topic.unit_id) : (question?.unit_id ? unitsMap.get(question.unit_id) : undefined);
      const sub = question?.subject_id ? subjectsMap.get(question.subject_id) : (unit ? subjectsMap.get(unit.subject_id) : undefined);

      if (eligibleSubjectIds && sub?.id && !eligibleSubjectIds.has(sub.id)) continue;
      if (subject_id && sub?.id !== subject_id) continue;
      if (unit_id && unit?.id !== unit_id) continue;
      if (marks && a.marks_target !== marks) continue;

      const headingMatch = scoreTextMatch(trimmedQuery, queryTokens, a.heading, 2.4);
      const summaryMatch = scoreTextMatch(trimmedQuery, queryTokens, a.summary, 1.5);
      const pointsMatch = scoreTextMatch(trimmedQuery, queryTokens, a.key_points.join(' '), 1.2);
      const totalScore = headingMatch.score + summaryMatch.score + pointsMatch.score;

      if (totalScore > 0) {
        answerResults.push({
          id: a.id,
          category: 'ANSWER',
          title: `${a.marks_target}-Mark Model Answer: ${a.heading}`,
          subtitle: `${sub?.short_name || 'Subject'} • ${a.marks_target} Marks • Evaluator Points Included`,
          snippet: extractSnippet(a.summary, queryTokens),
          url: `/questions/${a.question_id}`,
          score: totalScore,
          marks: a.marks_target,
          unit_number: unit?.unit_number,
          match_type: headingMatch.matchType === 'EXACT' ? 'EXACT' : 'TOKEN',
          ...getAcademicContext(sub?.id),
        });
      }
    }
  }

  // Sort each category by descending relevance score
  const sortByScore = (a: SearchResultItem, b: SearchResultItem) => b.score - a.score;
  topicResults.sort(sortByScore);
  questionResults.sort(sortByScore);
  pyqResults.sort(sortByScore);
  noteResults.sort(sortByScore);
  answerResults.sort(sortByScore);

  // Optional Semantic Reranker execution if provided (architecture preparation)
  if (semanticHook?.vectorEmbedding && semanticHook.semanticReranker) {
    topicResults.splice(0, topicResults.length, ...semanticHook.semanticReranker(topicResults, semanticHook.vectorEmbedding));
    pyqResults.splice(0, pyqResults.length, ...semanticHook.semanticReranker(pyqResults, semanticHook.vectorEmbedding));
  }

  const totalMatches =
    topicResults.length +
    questionResults.length +
    pyqResults.length +
    noteResults.length +
    answerResults.length;

  const durationMs = Math.max(1, Math.round(performance.now() - startTime));

  return {
    query: trimmedQuery,
    total_matches: totalMatches,
    search_time_ms: durationMs,
    results: {
      topics: topicResults.slice(0, limit),
      questions: questionResults.slice(0, limit),
      pyqs: pyqResults.slice(0, limit),
      notes: noteResults.slice(0, limit),
      answers: answerResults.slice(0, limit),
    },
    matched_subjects: matchedSubjects,
    matched_units: matchedUnits,
    matched_clusters: matchedClusters,
    popular_searches: POPULAR_SPPU_SEARCHES,
    suggestions:
      totalMatches === 0
        ? [
            `Check spelling or try broader terms like "${trimmedQuery.split(' ')[0]}"`,
            'Browse official syllabus topics in the Syllabus tab',
            'Search for 2-mark or 5-mark PYQ model answers',
          ]
        : undefined,
  };
}
