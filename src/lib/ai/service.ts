import { getAIProvider, AIProvider, AIChatResponse } from './provider';
import { retrieveGroundedAcademicContext, StructuredRetrievalOptions, GroundedAcademicContext } from './retrieval';
import { buildGroundedPromptMessages } from './contextBuilder';
import { AITaskType, QuickActionType } from './prompts';
import {
  validateAIBoundary,
  AIBoundaryViolationError,
  checkAIRateLimit,
  logAIOperation,
} from './guardrails';
import { KnowledgeSourceMode } from '@/lib/db/types';
import { searchStudentDocumentChunks } from '@/lib/files/processor';

export interface AIExecutionParams {
  query: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  userId?: string;
  isPremiumUser?: boolean;
  taskType?: AITaskType;
  marksTarget?: number;
  requestedAction?: string; // e.g. for boundary check
  maxTokens?: number;
  timeoutMs?: number;
  providerOverride?: string;
  sourceMode?: KnowledgeSourceMode;
  fileIds?: string[];
  quickAction?: QuickActionType;
}

export interface AIGroundedResult {
  content: string;
  provider: string;
  model: string;
  source_mode: KnowledgeSourceMode;
  source_label: string;
  grounded_sources_count: number;
  student_sources_count: number;
  citations: Array<{
    type: string;
    id: string;
    title: string;
    relevance: number;
    snippet?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
  is_fallback: boolean;
  is_grounded: boolean;
  disclaimer: string;
}

/**
 * Deterministic fallback generator when cloud AI providers are unavailable,
 * network times out, or quota is exhausted.
 * Synthesizes grounded academic explanation strictly from verified records and student notes.
 */
function buildDeterministicAcademicFallback(
  context: GroundedAcademicContext,
  query: string,
  taskType?: AITaskType,
  marksTarget?: number,
  studentChunks?: Array<{ filename: string; chunkIndex: number; content: string }>,
  sourceMode: KnowledgeSourceMode = 'BOTH'
): string {
  const sections: string[] = [];

  // 1. Student Material Synthesis
  if ((sourceMode === 'MY_MATERIAL' || sourceMode === 'BOTH') && studentChunks && studentChunks.length > 0) {
    sections.push(`### Analysis from Your Uploaded Study Material`);
    studentChunks.forEach((sc) => {
      sections.push(`• **Source:** *${sc.filename}* (Section ${sc.chunkIndex + 1})`);
      sections.push(`> ${sc.content.slice(0, 300)}...`);
    });
    sections.push('');
  } else if (sourceMode === 'MY_MATERIAL') {
    return (
      `This specific detail is not available in your uploaded study material.\n\n` +
      `Under ScoreEdge academic safety rules, ungrounded speculation is strictly prevented. Please verify that your uploaded documents cover this topic, or switch Knowledge Source to 'ScoreEdge' or 'Both'.`
    );
  }

  // 2. ScoreEdge Academic Synthesis
  if (sourceMode === 'SCOREDGE' || sourceMode === 'BOTH') {
    if (!context.is_empty) {
      sections.push(`### Verified SPPU Academic Synthesis (ScoreEdge Fallback Engine)`);
      if (context.subject_name) {
        sections.push(`**Subject:** ${context.subject_name}`);
      }

      // Model Answers
      if (context.verified_answers.length > 0) {
        const topAnswer = context.verified_answers[0];
        sections.push(`\n#### Model Solution (${topAnswer.marksTarget}M Target: ${topAnswer.heading})`);
        sections.push(`${topAnswer.summary}\n`);
        sections.push(`**Key Evaluation Points for SPPU Examiners:**`);
        topAnswer.keyPoints.forEach((pt, i) => sections.push(`${i + 1}. ${pt}`));

        if (topAnswer.diagramDescription) {
          sections.push(`\n**Diagram Required:** ${topAnswer.diagramDescription}`);
        }
        if (topAnswer.evaluatorTips) {
          sections.push(`\n**Evaluator Tip:** ${topAnswer.evaluatorTips}`);
        }
      }

      // Verified PYQ recurrence
      if (context.pyqs.length > 0) {
        const topPYQ = context.pyqs[0];
        sections.push(`\n#### Verified Historical Examination Pattern`);
        sections.push(`• **Reference Question:** "${topPYQ.questionText}" [${topPYQ.marks} Marks, ${topPYQ.difficulty}]`);
        if (topPYQ.occurrences.length > 0) {
          const occurrencesStr = topPYQ.occurrences
            .map((o) => `${o.year} ${o.session} (${o.questionNumber})`)
            .join(', ');
          sections.push(`• **Verified Appearances:** ${occurrencesStr}`);
        }
      }

      // Question Clusters
      if (context.question_clusters.length > 0) {
        const cluster = context.question_clusters[0];
        sections.push(`\n#### Concept Repetition Intelligence`);
        sections.push(`• **Exam Concept:** ${cluster.canonicalName}`);
        sections.push(`• **Repetition Evidence:** ${cluster.repetitionSummary} (Tested in ${cluster.years.join(', ')})`);
      }

      // Priority Data
      if (context.priority_data.length > 0) {
        const priority = context.priority_data[0];
        sections.push(`\n#### Topic Priority`);
        sections.push(`• **Classification:** ${priority.priority} (${priority.frequencyRatio})`);
        sections.push(`• **Academic Note:** ${priority.explanation}`);
      }
    } else if (sourceMode === 'SCOREDGE') {
      return (
        `This specific detail is not available in the verified SPPU exam records on ScoreEdge.\n\n` +
        `Under ScoreEdge academic safety rules, ungrounded speculation or simulated exam statistics are strictly prevented.`
      );
    }
  }

  if (sections.length === 0) {
    return (
      `Information for this query is not available in the selected knowledge source (${sourceMode.replace('_', ' ')}).\n\n` +
      `Under ScoreEdge academic safety rules, ungrounded speculation is strictly prevented.`
    );
  }

  return sections.join('\n');
}

/**
 * ScoreEdge AI Execution Pipeline with Multi-Source Knowledge & Prompt Injection Defense:
 * 1. Boundary & Safety Check
 * 2. Rate Limiter (Token bucket per client)
 * 3. Student Material Chunk Retrieval (RAG)
 * 4. PostgreSQL Multi-Source Structured Retrieval
 * 5. Grounded Context & Token Budget Assembly
 * 6. Cloud AI Provider / Fallback Dispatch
 * 7. Sanitized Telemetry Logging
 */
export async function executeGroundedAIQuery(params: AIExecutionParams): Promise<AIGroundedResult> {
  const startTime = Date.now();
  const sourceMode = params.sourceMode || 'BOTH';

  // 1. BOUNDARY VALIDATION
  if (params.requestedAction) {
    const boundaryCheck = validateAIBoundary(params.requestedAction);
    if (!boundaryCheck.allowed) {
      throw new AIBoundaryViolationError(
        boundaryCheck.violationDomain!,
        `ScoreEdge AI cannot execute operations in domain '${boundaryCheck.violationDomain}'. AI is restricted to academic reasoning and generation.`
      );
    }
  }

  // 2. RATE LIMIT CHECK
  const rateLimitIdentifier = params.userId || 'anonymous-client';
  const rateLimit = checkAIRateLimit(rateLimitIdentifier, Boolean(params.isPremiumUser));
  if (!rateLimit.allowed) {
    throw new Error(
      `AI request limit exceeded. Maximum ${rateLimit.limit} queries per minute allowed. Please try again in ${rateLimit.retryAfterSeconds}s.`
    );
  }

  // 3. STUDENT MATERIAL RETRIEVAL (If source is MY_MATERIAL or BOTH)
  let studentMatches: ReturnType<typeof searchStudentDocumentChunks> = [];
  if (sourceMode === 'MY_MATERIAL' || sourceMode === 'BOTH') {
    studentMatches = searchStudentDocumentChunks(
      params.userId || 'usr-student-1',
      params.query,
      params.fileIds
    );
  }

  const studentChunksForPrompt = studentMatches.map((m) => ({
    filename: m.file.filename,
    chunkIndex: m.chunk.chunk_index,
    content: m.chunk.content,
  }));

  const studentCitations = studentMatches.map((m) => ({
    type: 'STUDENT_MATERIAL',
    id: m.chunk.id,
    title: `${m.file.filename} (Section ${m.chunk.chunk_index + 1})`,
    relevance: Math.min(1.0, Math.round((m.score / 10) * 100) / 100),
    snippet: m.chunk.content.slice(0, 150),
  }));

  // Anti-hallucination check: if MY_MATERIAL was selected and student has no files or matches
  if (sourceMode === 'MY_MATERIAL' && studentMatches.length === 0) {
    return {
      content:
        `This specific detail is not available in your uploaded study material.\n\n` +
        `Under ScoreEdge academic safety rules, ungrounded speculation is strictly prevented. Please ensure your study notes cover this topic, or switch Knowledge Source to 'ScoreEdge' or 'Both'.`,
      provider: 'scoreedge-grounding-engine',
      model: 'scoreedge-anti-hallucination-v1',
      source_mode: 'MY_MATERIAL',
      source_label: 'My Material',
      grounded_sources_count: 0,
      student_sources_count: 0,
      citations: [],
      latency_ms: Date.now() - startTime,
      is_fallback: false,
      is_grounded: false,
      disclaimer: 'Grounded strictly in your uploaded study material.',
    };
  }

  // 4. STRUCTURED MULTI-SOURCE RETRIEVAL (If source is SCOREDGE or BOTH)
  const retrievalOptions: StructuredRetrievalOptions = {
    query: params.query,
    subjectId: params.subjectId,
    unitId: params.unitId,
    topicId: params.topicId,
    userId: params.userId,
    maxItemsPerSource: 3,
  };

  const context = (sourceMode === 'SCOREDGE' || sourceMode === 'BOTH')
    ? await retrieveGroundedAcademicContext(retrievalOptions)
    : {
        query: params.query,
        syllabus: [],
        topics: [],
        pyqs: [],
        verified_answers: [],
        notes: [],
        question_clusters: [],
        priority_data: [],
        citations: [],
        total_sources_count: 0,
        is_empty: true,
      };

  // 5. CONTEXT ASSEMBLY & PROMPT PREPARATION
  const { messages, estimatedTokens } = buildGroundedPromptMessages(context, params.query, {
    taskType: params.taskType,
    marksTarget: params.marksTarget,
    maxContextTokens: 3000,
    sourceMode,
    quickAction: params.quickAction,
    studentMaterialChunks: studentChunksForPrompt,
  });

  // 6. PROVIDER DISPATCH WITH TIMEOUT & FALLBACK
  const provider = getAIProvider(params.providerOverride);
  const timeoutMs = params.timeoutMs || 15000;

  let responseContent = '';
  let modelUsed = 'scoreedge-academic-v1';
  let isFallback = false;
  let usage: AIChatResponse['usage'] | undefined;

  try {
    const chatResponse = await provider.chat({
      messages,
      temperature: 0.2,
      maxTokens: params.maxTokens || 1000,
      timeoutMs,
    });

    responseContent = chatResponse.content;
    modelUsed = chatResponse.model;
    usage = chatResponse.usage;
  } catch (err: unknown) {
    // Graceful Fallback: Generate grounded response from verified DB records and student chunks
    isFallback = true;
    responseContent = buildDeterministicAcademicFallback(
      context,
      params.query,
      params.taskType,
      params.marksTarget,
      studentChunksForPrompt,
      sourceMode
    );
    modelUsed = 'scoreedge-deterministic-fallback';
  }

  const latencyMs = Date.now() - startTime;

  // Source Label mapping
  const sourceLabel =
    sourceMode === 'MY_MATERIAL'
      ? 'My Material'
      : sourceMode === 'SCOREDGE'
      ? 'ScoreEdge Verified'
      : 'My Material + ScoreEdge';

  // Combine citations
  const allCitations = [...studentCitations, ...context.citations];

  // 7. SANITIZED TELEMETRY LOGGING
  logAIOperation({
    queryLength: params.query.length,
    subjectId: params.subjectId,
    unitId: params.unitId,
    provider: provider.name,
    model: modelUsed,
    latencyMs,
    promptTokens: usage?.promptTokens || estimatedTokens,
    completionTokens: usage?.completionTokens,
    totalTokens: usage?.totalTokens,
    groundedSourcesCount: context.total_sources_count + studentMatches.length,
    isGrounded: !context.is_empty || studentMatches.length > 0,
    status: isFallback ? 'FALLBACK' : 'SUCCESS',
  });

  return {
    content: responseContent,
    provider: provider.name,
    model: modelUsed,
    source_mode: sourceMode,
    source_label: sourceLabel,
    grounded_sources_count: context.total_sources_count,
    student_sources_count: studentMatches.length,
    citations: allCitations,
    usage: usage
      ? {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.totalTokens,
        }
      : undefined,
    latency_ms: latencyMs,
    is_fallback: isFallback,
    is_grounded: !context.is_empty || studentMatches.length > 0,
    disclaimer:
      sourceMode === 'MY_MATERIAL'
        ? 'Grounded strictly in your uploaded study material. Not an official prediction.'
        : sourceMode === 'SCOREDGE'
        ? 'Grounded strictly in verified SPPU examination records and historical PYQ patterns. Not an official prediction.'
        : 'Grounded in your uploaded study material and verified SPPU examination records. Not an official prediction.',
  };
}
