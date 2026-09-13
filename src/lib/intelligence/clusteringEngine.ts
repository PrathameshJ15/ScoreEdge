import { dbStore } from '@/lib/db/client';
import {
  Question,
  QuestionOccurrence,
  QuestionCluster,
  QuestionClusterMember,
  RepetitionType,
  ClusteringAlgorithm,
  ClusterReviewStatus,
  TrendDirection,
} from '@/lib/db/types';

// Stopwords and academic exam boilerplate tokens to strip during normalization
const EXAM_BOILERPLATE_WORDS = new Set([
  'what',
  'is',
  'are',
  'the',
  'explain',
  'describe',
  'define',
  'discuss',
  'differentiate',
  'between',
  'comparison',
  'compare',
  'with',
  'suitable',
  'example',
  'examples',
  'write',
  'short',
  'note',
  'notes',
  'on',
  'and',
  'or',
  'of',
  'in',
  'for',
  'an',
  'a',
  'to',
  'how',
  'does',
  'give',
  'neat',
  'sketch',
  'diagram',
  'briefly',
  'state',
  'algorithm',
  'algorithms',
  'step',
  'steps',
  'trace',
]);

/**
 * Normalizes question text by stripping marks, question numbers, and boilerplate phrasing.
 */
export function normalizeQuestionText(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove question numbers like Q1(a), Q. 3 (b), 1., (a)
      .replace(/Q(?:uestion)?\.?\s*\d+\s*\([a-z0-9]+\)/gi, '')
      .replace(/Q(?:uestion)?\.?\s*\d+/gi, '')
      .replace(/^\s*\d+[\.\)]\s*/g, '')
      .replace(/^\s*\([a-z0-9]+\)\s*/gi, '')
      // Remove marks notations like [8 Marks], (7M), [10M], 6 Marks
      .replace(/\[\s*\d+\s*(?:marks?|m)\s*\]/gi, '')
      .replace(/\(\s*\d+\s*(?:marks?|m)\s*\)/gi, '')
      .replace(/\b\d+\s*(?:marks?|m)\b/gi, '')
      // Remove non-alphanumeric characters except spaces
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      // Lowercase and trim
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Extracts essential conceptual keywords from normalized question text.
 */
export function extractContentTokens(text: string): string[] {
  const normalized = normalizeQuestionText(text);
  const rawTokens = normalized.split(/\s+/).filter((t) => t.length > 1);
  return rawTokens.filter((token) => !EXAM_BOILERPLATE_WORDS.has(token));
}

/**
 * Levenshtein distance on strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }

  return dp[m][n];
}

/**
 * Normalized Lexical Similarity [0.0 to 1.0]
 */
export function calculateLexicalSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1.0 - dist / maxLen);
}

/**
 * Jaccard Similarity on token sets [0.0 to 1.0]
 */
export function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (setB.has(token)) intersectionCount++;
  });

  const unionSet = new Set<string>();
  tokensA.forEach((t) => unionSet.add(t));
  tokensB.forEach((t) => unionSet.add(t));
  return intersectionCount / unionSet.size;
}

/**
 * Multi-factor similarity comparison between two questions.
 * Enforces rule: "Do not automatically treat every text similarity as a true repetition."
 */
export function compareQuestions(
  q1: Question,
  q2: Question
): {
  isRepetition: boolean;
  repetitionType?: RepetitionType;
  confidenceScore: number;
  confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  lexicalSimilarity: number;
  jaccardSimilarity: number;
  matchExplanation: string;
} {
  // Guardrail 1: Questions must be from the same subject and unit to prevent cross-topic false positives
  if (q1.subject_id !== q2.subject_id || q1.unit_id !== q2.unit_id) {
    return {
      isRepetition: false,
      confidenceScore: 0,
      confidenceLevel: 'LOW',
      lexicalSimilarity: 0,
      jaccardSimilarity: 0,
      matchExplanation: 'Questions belong to different subjects or syllabus units.',
    };
  }

  const norm1 = normalizeQuestionText(q1.question_text);
  const norm2 = normalizeQuestionText(q2.question_text);

  const tokens1 = extractContentTokens(q1.question_text);
  const tokens2 = extractContentTokens(q2.question_text);

  const lexical = calculateLexicalSimilarity(norm1, norm2);
  const jaccard = calculateJaccardSimilarity(tokens1, tokens2);

  // 1. EXACT REPETITION: Character-for-character identical or normalized exact match
  if (norm1 === norm2 || (lexical >= 0.96 && jaccard >= 0.95)) {
    return {
      isRepetition: true,
      repetitionType: 'EXACT_REPETITION',
      confidenceScore: 1.0,
      confidenceLevel: 'VERY_HIGH',
      lexicalSimilarity: Math.round(lexical * 100) / 100,
      jaccardSimilarity: Math.round(jaccard * 100) / 100,
      matchExplanation: 'Identical question text repeated across examination papers.',
    };
  }

  // 2. NEAR REPETITION: Minor grammatical variations or synonymous terms
  if (jaccard >= 0.82 || (lexical >= 0.85 && jaccard >= 0.70)) {
    const combinedScore = Math.round((jaccard * 0.6 + lexical * 0.4) * 100) / 100;
    return {
      isRepetition: true,
      repetitionType: 'NEAR_REPETITION',
      confidenceScore: Math.min(0.95, Math.max(0.85, combinedScore)),
      confidenceLevel: 'VERY_HIGH',
      lexicalSimilarity: Math.round(lexical * 100) / 100,
      jaccardSimilarity: Math.round(jaccard * 100) / 100,
      matchExplanation: 'Near-identical question with minor phrasing differences.',
    };
  }

  // 3. WORDING VARIATION: Rephrased wording testing the exact same concept/solution
  if (q1.topic_id && q2.topic_id && q1.topic_id === q2.topic_id && jaccard >= 0.55) {
    const combinedScore = Math.round((jaccard * 0.7 + lexical * 0.3) * 100) / 100;
    return {
      isRepetition: true,
      repetitionType: 'WORDING_VARIATION',
      confidenceScore: Math.min(0.84, Math.max(0.70, combinedScore)),
      confidenceLevel: 'HIGH',
      lexicalSimilarity: Math.round(lexical * 100) / 100,
      jaccardSimilarity: Math.round(jaccard * 100) / 100,
      matchExplanation: 'Wording variation testing the exact same concept and solution structure.',
    };
  }

  // 4. CONCEPT REPETITION: Same core topic/unit concept, moderate keyword overlap
  if (jaccard >= 0.50 || (q1.topic_id === q2.topic_id && tokens1.some((t) => tokens2.includes(t)))) {
    const combinedScore = Math.round((jaccard * 0.8 + lexical * 0.2) * 100) / 100;
    return {
      isRepetition: true,
      repetitionType: 'CONCEPT_REPETITION',
      confidenceScore: Math.min(0.74, Math.max(0.60, combinedScore)),
      confidenceLevel: 'MEDIUM',
      lexicalSimilarity: Math.round(lexical * 100) / 100,
      jaccardSimilarity: Math.round(jaccard * 100) / 100,
      matchExplanation: 'Related conceptual variation on the same underlying syllabus concept.',
    };
  }

  // Guardrail 2: Not a true repetition if similarity is insufficient
  return {
    isRepetition: false,
    confidenceScore: Math.round(jaccard * 100) / 100,
    confidenceLevel: 'LOW',
    lexicalSimilarity: Math.round(lexical * 100) / 100,
    jaccardSimilarity: Math.round(jaccard * 100) / 100,
    matchExplanation: 'Low semantic overlap; does not meet the verified repetition threshold.',
  };
}

/**
 * Recalculates statistical aggregations for a cluster (occurrences, distinct years, typical marks).
 */
export function recomputeClusterStats(clusterId: string): QuestionCluster | null {
  const cluster = dbStore.questionClusters.find((c) => c.id === clusterId && !c.deleted_at);
  if (!cluster) return null;

  const members = dbStore.questionClusterMembers.filter((m) => m.cluster_id === clusterId);
  const memberQuestionIds = new Set(members.map((m) => m.question_id));

  // Find all occurrences for member questions
  const occurrences = dbStore.questionOccurrences.filter(
    (occ) => memberQuestionIds.has(occ.question_id) && occ.verification_status === 'VERIFIED'
  );

  // Distinct verified papers
  const paperKeys = new Set(occurrences.map((o) => `${o.year}_${o.exam_session}_${o.pattern_id}`));
  const paperCount = paperKeys.size;

  const years = Array.from(new Set(occurrences.map((o) => o.year))).sort((a, b) => b - a);
  const marksList = occurrences.map((o) => o.marks);

  let typicalMarks = cluster.typical_marks;
  if (marksList.length > 0) {
    const minM = Math.min(...marksList);
    const maxM = Math.max(...marksList);
    typicalMarks = minM === maxM ? `${minM} Marks` : `${minM}–${maxM} Marks`;
  }

  // Display: "Repeated/Similar in X verified papers"
  const repetitionSummary = `Repeated/Similar in ${paperCount} verified paper${paperCount !== 1 ? 's' : ''}`;

  // Predominant repetition type
  const typeCounts: Record<string, number> = {};
  for (const m of members) {
    if (m.repetition_type) {
      typeCounts[m.repetition_type] = (typeCounts[m.repetition_type] || 0) + 1;
    }
  }
  let primaryType: RepetitionType = 'CONCEPT_REPETITION';
  let maxCount = 0;
  for (const [type, cnt] of Object.entries(typeCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      primaryType = type as RepetitionType;
    }
  }

  // Confidence score: average of member similarities
  const avgSimilarity =
    members.length > 0
      ? members.reduce((sum, m) => sum + m.similarity_score, 0) / members.length
      : cluster.confidence_score;

  // Trend direction
  const latestYear = years.length > 0 ? years[0] : 2024;
  let trend: TrendDirection = 'STABLE';
  if (paperCount >= 3 || years.includes(latestYear)) {
    trend = 'HIGH';
  } else if (years.includes(latestYear) && paperCount <= 2) {
    trend = 'EMERGING';
  }

  // Update in place
  cluster.occurrence_count = paperCount;
  cluster.years = years;
  cluster.typical_marks = typicalMarks;
  cluster.repetition_summary = repetitionSummary;
  cluster.primary_repetition_type = primaryType;
  cluster.confidence_score = Math.round(avgSimilarity * 100) / 100;
  cluster.trend = trend;
  cluster.updated_at = new Date().toISOString();

  return cluster;
}

/**
 * Proposes new question clusters by analyzing unclustered verified questions.
 * Does not automatically approve them; puts them into PENDING_REVIEW for admin approval.
 */
export function autoDiscoverClusters(subjectId: string): QuestionCluster[] {
  const subjectQuestions = dbStore.questions.filter(
    (q) => q.subject_id === subjectId && q.is_pyq && q.content_status === 'PUBLISHED' && !q.deleted_at
  );

  const existingMemberQIds = new Set(dbStore.questionClusterMembers.map((m) => m.question_id));
  const candidateQuestions = subjectQuestions.filter((q) => !existingMemberQIds.has(q.id));

  const discoveredClusters: QuestionCluster[] = [];

  for (let i = 0; i < candidateQuestions.length; i++) {
    const q1 = candidateQuestions[i];
    const matchingMembers: Array<{
      question: Question;
      comparison: ReturnType<typeof compareQuestions>;
    }> = [];

    for (let j = i + 1; j < candidateQuestions.length; j++) {
      const q2 = candidateQuestions[j];
      const comparison = compareQuestions(q1, q2);

      // Require high enough similarity score for cluster recommendation
      if (comparison.isRepetition && comparison.confidenceScore >= 0.65) {
        matchingMembers.push({ question: q2, comparison });
      }
    }

    if (matchingMembers.length > 0) {
      // Create new proposed cluster
      const allClusterQuestions = [q1, ...matchingMembers.map((m) => m.question)];
      // Select canonical question (highest marks or longest question text)
      const canonical = allClusterQuestions.reduce((best, cur) =>
        cur.marks > best.marks || (cur.marks === best.marks && cur.question_text.length > best.question_text.length)
          ? cur
          : best
      );

      const topic = dbStore.topics.find((t) => t.id === canonical.topic_id);
      const canonicalName = topic ? topic.title : `Exam Concept (Unit ${canonical.unit_id.split('-').pop()})`;

      const clusterId = `cluster-${Date.now()}-${discoveredClusters.length + 1}`;
      const newCluster: QuestionCluster = {
        id: clusterId,
        subject_id: subjectId,
        unit_id: canonical.unit_id,
        topic_id: canonical.topic_id || null,
        canonical_name: canonicalName,
        canonical_question: canonical.question_text,
        occurrence_count: 0,
        years: [],
        typical_marks: `${canonical.marks} Marks`,
        confidence_score: 0.85,
        human_approved: false,
        review_status: 'PENDING_REVIEW',
        repetition_summary: 'Pending verified review',
        clustering_algorithm: 'HYBRID',
        embedding_model: null, // Ready for future AI embeddings
        trend: 'STABLE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add members to dbStore
      const member1: QuestionClusterMember = {
        id: `mem-${Date.now()}-1`,
        cluster_id: clusterId,
        question_id: q1.id,
        repetition_type: 'EXACT_REPETITION',
        similarity_score: 1.0,
        confidence_level: 'VERY_HIGH',
        match_explanation: 'Canonical reference question for the cluster.',
        created_at: new Date().toISOString(),
      };
      dbStore.questionClusterMembers.push(member1);

      for (let idx = 0; idx < matchingMembers.length; idx++) {
        const item = matchingMembers[idx];
        const mem: QuestionClusterMember = {
          id: `mem-${Date.now()}-${idx + 2}`,
          cluster_id: clusterId,
          question_id: item.question.id,
          repetition_type: item.comparison.repetitionType,
          similarity_score: item.comparison.confidenceScore,
          lexical_similarity: item.comparison.lexicalSimilarity,
          jaccard_similarity: item.comparison.jaccardSimilarity,
          confidence_level: item.comparison.confidenceLevel,
          match_explanation: item.comparison.matchExplanation,
          created_at: new Date().toISOString(),
        };
        dbStore.questionClusterMembers.push(mem);
      }

      dbStore.questionClusters.push(newCluster);
      recomputeClusterStats(clusterId);
      discoveredClusters.push(newCluster);
    }
  }

  return discoveredClusters;
}

/**
 * Admin action: Approve a question cluster.
 */
export function approveCluster(clusterId: string, adminUserId: string): QuestionCluster {
  const cluster = dbStore.questionClusters.find((c) => c.id === clusterId && !c.deleted_at);
  if (!cluster) {
    throw new Error(`Cluster with ID ${clusterId} not found`);
  }

  cluster.human_approved = true;
  cluster.review_status = 'APPROVED';
  cluster.approved_by = adminUserId;
  cluster.approved_at = new Date().toISOString();
  cluster.updated_at = new Date().toISOString();

  // Record audit verification
  dbStore.verificationRecords.push({
    id: `ver-cluster-${Date.now()}`,
    entity_type: 'CLUSTER',
    entity_id: clusterId,
    status_from: 'PENDING_REVIEW',
    status_to: 'APPROVED',
    reviewer_id: adminUserId,
    review_notes: `Admin approved question repetition cluster: ${cluster.canonical_name} (${cluster.repetition_summary}).`,
    created_at: new Date().toISOString(),
  });

  return cluster;
}

/**
 * Admin action: Reject a question cluster.
 */
export function rejectCluster(clusterId: string, adminUserId: string, reason?: string): QuestionCluster {
  const cluster = dbStore.questionClusters.find((c) => c.id === clusterId && !c.deleted_at);
  if (!cluster) {
    throw new Error(`Cluster with ID ${clusterId} not found`);
  }

  cluster.human_approved = false;
  cluster.review_status = 'REJECTED';
  cluster.approved_by = adminUserId;
  cluster.approved_at = new Date().toISOString();
  cluster.updated_at = new Date().toISOString();

  // Record audit verification
  dbStore.verificationRecords.push({
    id: `ver-cluster-${Date.now()}`,
    entity_type: 'CLUSTER',
    entity_id: clusterId,
    status_from: 'PENDING_REVIEW',
    status_to: 'REJECTED',
    reviewer_id: adminUserId,
    review_notes: reason || 'Admin rejected question cluster repetition.',
    created_at: new Date().toISOString(),
  });

  return cluster;
}

/**
 * Admin action: Add question member to cluster.
 */
export function addMemberToCluster(
  clusterId: string,
  questionId: string,
  repetitionType: RepetitionType = 'WORDING_VARIATION',
  adminUserId: string = 'usr-admin-1'
): QuestionClusterMember {
  const cluster = dbStore.questionClusters.find((c) => c.id === clusterId && !c.deleted_at);
  if (!cluster) {
    throw new Error(`Cluster ${clusterId} not found`);
  }
  const question = dbStore.questions.find((q) => q.id === questionId && !q.deleted_at);
  if (!question) {
    throw new Error(`Question ${questionId} not found`);
  }

  // Avoid duplicates
  const existing = dbStore.questionClusterMembers.find(
    (m) => m.cluster_id === clusterId && m.question_id === questionId
  );
  if (existing) {
    return existing;
  }

  const member: QuestionClusterMember = {
    id: `mem-${Date.now()}`,
    cluster_id: clusterId,
    question_id: questionId,
    repetition_type: repetitionType,
    similarity_score: 0.9,
    confidence_level: 'VERY_HIGH',
    match_explanation: 'Manually verified cluster member added by subject matter expert.',
    added_by: adminUserId,
    created_at: new Date().toISOString(),
  };

  dbStore.questionClusterMembers.push(member);
  recomputeClusterStats(clusterId);
  return member;
}

/**
 * Admin action: Remove member from cluster.
 */
export function removeMemberFromCluster(clusterId: string, memberId: string): boolean {
  const idx = dbStore.questionClusterMembers.findIndex(
    (m) => m.id === memberId && m.cluster_id === clusterId
  );
  if (idx === -1) return false;

  dbStore.questionClusterMembers.splice(idx, 1);
  recomputeClusterStats(clusterId);
  return true;
}

/**
 * Enriches a cluster for student or admin consumption.
 */
export function enrichCluster(cluster: QuestionCluster, includeUnapprovedMembers = false) {
  const members = dbStore.questionClusterMembers.filter((m) => m.cluster_id === cluster.id);
  const memberQuestions = members
    .map((m) => {
      const q = dbStore.questions.find((qu) => qu.id === m.question_id && !qu.deleted_at);
      if (!q) return null;
      const occurrences = dbStore.questionOccurrences.filter((occ) => occ.question_id === q.id);
      return {
        member_id: m.id,
        question_id: q.id,
        question_text: q.question_text,
        marks: q.marks,
        difficulty: q.difficulty,
        repetition_type: m.repetition_type || 'CONCEPT_REPETITION',
        similarity_score: m.similarity_score,
        confidence_level: m.confidence_level || 'HIGH',
        match_explanation: m.match_explanation || 'Verified conceptual match.',
        occurrences: occurrences.map((o) => ({
          id: o.id,
          year: o.year,
          exam_session: o.exam_session,
          question_number: o.question_number,
          marks: o.marks,
        })),
      };
    })
    .filter(Boolean);

  const topic = dbStore.topics.find((t) => t.id === cluster.topic_id);
  const unit = dbStore.units.find((u) => u.id === cluster.unit_id);

  return {
    ...cluster,
    unit_number: unit ? unit.unit_number : 1,
    unit_title: unit ? unit.title : 'Core Unit',
    topic_title: topic ? topic.title : null,
    members: memberQuestions,
    display_tag: cluster.repetition_summary || `Repeated/Similar in ${cluster.occurrence_count} verified papers`,
  };
}
