import { AIMessage } from './provider';
import { GroundedAcademicContext } from './retrieval';
import {
  SCOREEDGE_CORE_SYSTEM_PROMPT,
  buildScoreEdgeSystemPrompt,
  GROQ_STUDY_TUTOR_SYSTEM_PROMPT,
  buildGroqStudyTutorSystemPrompt,
  AITaskType,
  QuickActionType,
  getTaskSpecificInstruction,
  PROMPT_INJECTION_DEFENSE_INSTRUCTION,
} from './prompts';
import { KnowledgeSourceMode } from '@/lib/db/types';

export interface ContextBuilderOptions {
  taskType?: AITaskType;
  marksTarget?: number;
  maxContextTokens?: number; // default: 3000 tokens (~12,000 characters)
  quickAction?: QuickActionType;
  sourceMode?: KnowledgeSourceMode;
  studentMaterialChunks?: Array<{
    filename: string;
    chunkIndex: number;
    content: string;
    pageNumber?: number;
  }>;
  chatHistory?: AIMessage[];
}

/**
 * Approximate token count helper (~4 characters per token for English/code).
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Builds grounded system prompt and user query messages conforming to token budgets.
 */
export function buildGroundedPromptMessages(
  context: GroundedAcademicContext,
  userQuery: string,
  options?: ContextBuilderOptions
): {
  messages: AIMessage[];
  estimatedTokens: number;
  isTruncated: boolean;
} {
  const taskType = options?.taskType || 'GENERAL_QUERY';
  const marksTarget = options?.marksTarget;
  const maxContextTokens = options?.maxContextTokens || 3000;
  const sourceMode: KnowledgeSourceMode = options?.sourceMode || 'BOTH';
  const studentChunks = options?.studentMaterialChunks || [];

  const taskInstruction = getTaskSpecificInstruction(taskType, marksTarget, options?.quickAction);

  // Build the XML-formatted retrieved context block
  const contextChunks: string[] = [];
  const universityLabel = context.university_name || 'SPPU';

  // 1. STUDENT UPLOADED MATERIAL (If source is MY_MATERIAL or BOTH)
  const studentMaterialBlocks: string[] = [];
  if (sourceMode === 'MY_MATERIAL' || sourceMode === 'BOTH') {
    if (studentChunks.length > 0) {
      studentChunks.forEach((chunk, i) => {
        const pageLabel = chunk.pageNumber ? `Page ${chunk.pageNumber} | ` : '';
        studentMaterialBlocks.push(
          `[Document: ${chunk.filename} | ${pageLabel}Section ${chunk.chunkIndex + 1}]\n${chunk.content}`
        );
      });
    } else if (sourceMode === 'MY_MATERIAL') {
      studentMaterialBlocks.push(
        `[No student material currently indexed or uploaded for this session. The student should upload study material first.]`
      );
    }
  }

  // 2. SCOREDGE ACADEMIC CONTEXT (If source is SCOREDGE or BOTH)
  if (sourceMode === 'SCOREDGE' || sourceMode === 'BOTH') {
    if (!context.is_empty) {
      if (context.university_name) {
        contextChunks.push(`University: ${context.university_name}`);
      }
      if (context.pattern_name) {
        contextChunks.push(`Curriculum Pattern: ${context.pattern_name}`);
      }
      if (context.branch_name) {
        contextChunks.push(`Branch / Discipline: ${context.branch_name}`);
      }
      if (context.subject_name) {
        contextChunks.push(`Subject: ${context.subject_name}`);
      }

      // 1. Syllabus Items
      if (context.syllabus.length > 0) {
        contextChunks.push(`\n[VERIFIED SYLLABUS RECORDS]`);
        context.syllabus.forEach((s) => {
          contextChunks.push(`• Unit ${s.unitNumber} (${s.unitTitle}): ${s.content}`);
          if (s.referenceMaterials) {
            contextChunks.push(`  Reference: ${s.referenceMaterials}`);
          }
        });
      }

      // 2. Verified Topics
      if (context.topics.length > 0) {
        contextChunks.push(`\n[SYLLABUS TOPICS]`);
        context.topics.forEach((t) => {
          contextChunks.push(`• ${t.title} (Unit ${t.unitNumber}: ${t.unitTitle}) - Importance: ${t.importanceLevel}`);
        });
      }

      // 3. Verified Past Exam Questions (PYQs)
      if (context.pyqs.length > 0) {
        contextChunks.push(`\n[VERIFIED HISTORICAL PYQS & OCCURRENCES]`);
        context.pyqs.forEach((q) => {
          const occurrencesStr = q.occurrences
            .map((o) => `${o.year} ${o.session} (${o.questionNumber}, ${o.marks}M)`)
            .join(', ');
          contextChunks.push(
            `• Question: "${q.questionText}" [${q.marks} Marks, ${q.difficulty}]\n  Past Appearances: ${occurrencesStr || 'Recorded verified paper'}`
          );
        });
      }

      // 4. Verified Model Answers
      if (context.verified_answers.length > 0) {
        contextChunks.push(`\n[VERIFIED MODEL ANSWERS & EVALUATOR TIPS]`);
        context.verified_answers.forEach((a) => {
          contextChunks.push(`• For Question: "${a.questionText}" (${a.marksTarget} Marks Target)`);
          contextChunks.push(`  Summary: ${a.summary}`);
          contextChunks.push(`  Key Evaluation Points: ${a.keyPoints.join('; ')}`);
          if (a.diagramDescription) {
            contextChunks.push(`  Schematic/Diagram: ${a.diagramDescription}`);
          }
          if (a.evaluatorTips) {
            contextChunks.push(`  Evaluator Tips: ${a.evaluatorTips}`);
          }
        });
      }

      // 5. Notes Excerpts
      if (context.notes.length > 0) {
        contextChunks.push(`\n[ACADEMIC CHAPTER NOTES]`);
        context.notes.forEach((n) => {
          contextChunks.push(`• Note: "${n.title}" (${n.unitTitle})\n  Summary: ${n.summary}\n  Key Excerpt: ${n.bodyExcerpt}`);
        });
      }

      // 6. Repeated Question Clusters
      if (context.question_clusters.length > 0) {
        contextChunks.push(`\n[REPEATED QUESTION CLUSTERS & CONCEPT VARIATIONS]`);
        context.question_clusters.forEach((c) => {
          contextChunks.push(
            `• Concept: "${c.canonicalName}" (${c.repetitionSummary}, ${Math.round(c.confidenceScore * 100)}% Confidence)`
          );
          contextChunks.push(`  Canonical Question: "${c.canonicalQuestion}" (Typical: ${c.typicalMarks}, Tested: ${c.years.join(', ')})`);
          if (c.variations.length > 0) {
            contextChunks.push(`  Known Exam Variations: ${c.variations.slice(0, 2).join(' | ')}`);
          }
        });
      }

      // 7. Intelligence Priority Data
      if (context.priority_data.length > 0) {
        contextChunks.push(`\n[EMPIRICAL PYQ INTELLIGENCE & PRIORITY RANKINGS]`);
        context.priority_data.forEach((p) => {
          contextChunks.push(
            `• Topic: ${p.topicTitle} -> Priority: ${p.priority} (Frequency: ${p.frequencyRatio}, Trend: ${p.trend}, Weight: ${p.typicalMarks})\n  Reasoning: ${p.explanation}`
          );
        });
      }

      // 8. Student Progress
      if (context.student_progress) {
        const sp = context.student_progress;
        contextChunks.push(`\n[STUDENT LEARNING CONTEXT]`);
        contextChunks.push(
          `• Progress: ${sp.completedTopicsCount} topics completed, ${sp.completedNotesCount} notes completed.`
        );
        if (sp.weakTopics.length > 0) {
          contextChunks.push(`• Weak Focus Areas (Quiz Score < 60%): ${sp.weakTopics.join(', ')}`);
        }
      }
    }
  }

  // Source Mode Directive
  let sourceModeDirective = '';
  if (sourceMode === 'MY_MATERIAL') {
    sourceModeDirective = `=== KNOWLEDGE SOURCE MODE: MY MATERIAL ONLY ===
You MUST base your response strictly on the text provided inside <<<STUDENT_DOCUMENT_UNTRUSTED_CONTENT>>>.
If the requested concept, definition, formula, or question is NOT present in the student's uploaded material, you MUST explicitly state:
"This specific detail is not available in your uploaded study material."
Do NOT extrapolate from memory or invent exam patterns.`;
  } else if (sourceMode === 'SCOREDGE') {
    sourceModeDirective = `=== KNOWLEDGE SOURCE MODE: SCOREDGE VERIFIED ONLY ===
You MUST base your response strictly on the verified academic records in <retrieved_academic_context>.
Do not use unverified external assumptions. State if details are not in verified records.`;
  } else {
    sourceModeDirective = `=== KNOWLEDGE SOURCE MODE: BOTH (MY MATERIAL + SCOREDGE VERIFIED) ===
Synthesize the student's uploaded study material with verified ScoreEdge curriculum and PYQ intelligence.
Clearly indicate which parts of your explanation are corroborated by the student's notes and which are enriched by ScoreEdge's verified exam patterns.
Never make unsupported predictions.`;
  }

  // Empty state handling
  let rawScoreEdgeContext = contextChunks.join('\n');
  if (!rawScoreEdgeContext && (sourceMode === 'SCOREDGE' || sourceMode === 'BOTH')) {
    rawScoreEdgeContext = `No verified ${universityLabel} records were matched for this specific query in the ScoreEdge database.`;
  }

  let rawStudentContext = studentMaterialBlocks.join('\n\n');

  // Token budget enforcement
  let isTruncated = false;
  let combinedChars = rawScoreEdgeContext.length + rawStudentContext.length;
  const maxChars = maxContextTokens * 4;

  if (combinedChars > maxChars) {
    isTruncated = true;
    if (rawStudentContext.length > maxChars * 0.6) {
      rawStudentContext = rawStudentContext.slice(0, Math.floor(maxChars * 0.6)) + '\n[...context truncated to stay within strict token budget...]';
    }
    if (rawScoreEdgeContext.length > maxChars * 0.4) {
      rawScoreEdgeContext = rawScoreEdgeContext.slice(0, Math.floor(maxChars * 0.4)) + '\n[...context truncated to stay within strict token budget...]';
    }
  }

  const baseSystemPrompt = context.university_name
    ? buildGroqStudyTutorSystemPrompt(context.university_name, context.pattern_name, context.branch_name)
    : GROQ_STUDY_TUTOR_SYSTEM_PROMPT;

  const systemContent = `${baseSystemPrompt}

${PROMPT_INJECTION_DEFENSE_INSTRUCTION}

${sourceModeDirective}

=== TASK INSTRUCTION ===
${taskInstruction}

=== STUDENT UPLOADED STUDY MATERIAL ===
<<<STUDENT_DOCUMENT_UNTRUSTED_CONTENT>>>
${rawStudentContext || 'No student material provided for this query.'}
<<<END_STUDENT_DOCUMENT_UNTRUSTED_CONTENT>>>

=== RETRIEVED ACADEMIC CONTEXT ===
<retrieved_academic_context>
${rawScoreEdgeContext || 'No verified academic records provided for this query.'}
</retrieved_academic_context>`;

  const userContent = userQuery;

  // Include recent multi-turn conversation history for continuity
  const historyMessages = (options?.chatHistory || [])
    .filter((m) => m && m.content && m.content.trim().length > 0)
    .slice(-8);

  const messages: AIMessage[] = [
    { role: 'system', content: systemContent },
    ...historyMessages,
    { role: 'user', content: userContent },
  ];

  const totalTokens = estimateTokenCount(systemContent) + estimateTokenCount(userContent);

  return {
    messages,
    estimatedTokens: totalTokens,
    isTruncated,
  };
}
