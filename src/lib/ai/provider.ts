/**
 * Provider abstraction for ScoreEdge Cloud AI.
 * Enables changing the AI provider (e.g., OpenAI, Anthropic, Gemini, local models)
 * without rewriting business logic, retrieval layers, or client components.
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIChatOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface AIUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIChatResponse {
  content: string;
  provider: string;
  model: string;
  usage?: AIUsageStats;
  finishReason?: string;
}

export interface AIProvider {
  name: string;
  chat(options: AIChatOptions): Promise<AIChatResponse>;
  isAvailable(): boolean;
}

/**
 * Groq Cloud Provider implementation using ultra-fast LPUs and OpenAI-compatible API.
 * Uses native fetch with timeout AbortController; no heavy external SDK dependency required.
 */
export class GroqProvider implements AIProvider {
  public name = 'GROQ';
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(options?: { apiKey?: string; baseURL?: string; defaultModel?: string }) {
    this.apiKey = options?.apiKey || process.env.GROQ_API_KEY || '';
    this.baseURL = options?.baseURL || process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
    this.defaultModel = options?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('placeholder'));
  }

  public async chat(options: AIChatOptions): Promise<AIChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('Groq API key is missing or not configured. Set GROQ_API_KEY in .env.local');
    }

    const timeoutMs = options.timeoutMs || 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const model = options.model || this.defaultModel;
    const maxTokens = options.maxTokens || 1500;
    const temperature = options.temperature !== undefined ? options.temperature : 0.2;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData?.error?.message || `Groq API returned status ${status}`;

        if (status === 429) {
          throw new Error(`Groq rate limit exceeded: ${msg}`);
        }
        if (status === 401) {
          throw new Error(`Groq authentication failed: Invalid GROQ_API_KEY.`);
        }
        throw new Error(`Groq API error (${status}): ${msg}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content || '';

      const usage: AIUsageStats | undefined = data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined;

      return {
        content,
        provider: this.name,
        model: data.model || model,
        usage,
        finishReason: choice?.finish_reason || 'stop',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Groq request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * OpenAI Cloud Provider implementation using standard Chat Completions API.
 * Uses native fetch with timeout AbortController; no heavy external SDK dependency required.
 */
export class OpenAIProvider implements AIProvider {
  public name = 'OPENAI';
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(options?: { apiKey?: string; baseURL?: string; defaultModel?: string }) {
    this.apiKey = options?.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseURL = options?.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.defaultModel = options?.defaultModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('placeholder'));
  }

  public async chat(options: AIChatOptions): Promise<AIChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key is missing or not configured.');
    }

    const timeoutMs = options.timeoutMs || 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const model = options.model || this.defaultModel;
    const maxTokens = options.maxTokens || 1000;
    const temperature = options.temperature !== undefined ? options.temperature : 0.2;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData?.error?.message || `OpenAI API returned status ${status}`;

        if (status === 429) {
          throw new Error(`OpenAI rate limit exceeded or quota exhausted: ${msg}`);
        }
        if (status === 401) {
          throw new Error(`OpenAI authentication failed: Invalid API key.`);
        }
        throw new Error(`OpenAI API error (${status}): ${msg}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content || '';

      const usage: AIUsageStats | undefined = data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined;

      return {
        content,
        provider: this.name,
        model: data.model || model,
        usage,
        finishReason: choice?.finish_reason || 'stop',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`OpenAI request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Deterministic Mock & Fallback Provider.
 * Used for automated test suites, offline development, or when cloud provider has an outage.
 * Adheres strictly to grounding rules and formatting.
 */
export class MockAIProvider implements AIProvider {
  public name = 'MOCK_FALLBACK';

  public isAvailable(): boolean {
    return true;
  }

  public async chat(options: AIChatOptions): Promise<AIChatResponse> {
    const userMessage = options.messages.find((m) => m.role === 'user')?.content || '';
    const systemMessage = options.messages.find((m) => m.role === 'system')?.content || '';

    // Check if context contains grounding data
    const hasContext =
      systemMessage.includes('<retrieved_academic_context>') &&
      !systemMessage.includes('No verified SPPU records were matched') &&
      !systemMessage.includes('No verified') &&
      !systemMessage.includes('records were matched') &&
      !systemMessage.includes('No verified records found');

    let responseContent: string;

    if (!hasContext) {
      responseContent = 'This specific detail is not available in the verified SPPU exam records on ScoreEdge.';
    } else {
      const is2M = systemMessage.includes('2-MARK');
      const is10M = systemMessage.includes('10-MARK');
      const is5M = systemMessage.includes('5-MARK') || (!is2M && !is10M && systemMessage.includes('SPPU examiners'));
      const isTeachMe = systemMessage.includes('Socratic tutorial style') || systemMessage.includes('Teach this concept');
      const isQuizMe = systemMessage.includes('diagnostic practice quiz');
      const isStudyPlan = systemMessage.includes('time-budgeted study plan');
      const isRevise = systemMessage.includes('rapid revision sheet');

      const hasHistory =
        systemMessage.includes('[VERIFIED HISTORICAL PYQS') ||
        systemMessage.includes('[REPEATED QUESTION CLUSTERS') ||
        systemMessage.includes('[EMPIRICAL PYQ INTELLIGENCE');

      const historySection = hasHistory
        ? `\n\n### Historical Examination Evidence\n• **Verified Occurrences:** Appeared in verified SPPU examination papers. High recurrence observed in university records.\n• **Empirical Note:** Recommendations and marks weightage are based on historical PYQ patterns; not an official prediction.`
        : `\n\n### Historical Examination Evidence\n• No historical PYQ occurrences are recorded for this specific subtopic in the current verified database.`;

      if (is2M) {
        responseContent =
          `### 2-Mark Exam Solution\n\n` +
          `**Definition:** A fundamental concept in university engineering curriculum ensuring consistent operational execution.\n\n` +
          `**Core Key Points:**\n` +
          `1. Enforces formal structural correctness and prevents abnormal runtime anomalies.\n` +
          `2. Implements standard mathematical formulation: $\\text{State}_{n+1} = f(\\text{State}_n, \\text{Input})$.\n\n` +
          `**Real-World Application:** Applied in production database query execution and distributed protocol coordination.` +
          historySection;
      } else if (is10M) {
        responseContent =
          `### 10-Mark Comprehensive Exam Solution\n\n` +
          `#### Part 1: Academic Definition & System Purpose\n` +
          `This concept serves as a cornerstone architectural standard within the SPPU syllabus, governing state transitions and system invariants under concurrent loads.\n\n` +
          `#### Part 2: Technical Architecture & Mechanics\n` +
          `1. **Structural Integrity:** Guarantees isolation barriers between transaction boundaries.\n` +
          `2. **Protocol Sequencing:** Synchronous two-phase validation ensures zero loss of serializability.\n` +
          `3. **Failure Recovery:** Checkpoint logging preserves atomicity across node interruptions.\n\n` +
          `#### Part 3: Schematic Diagram Guidelines\n` +
          `Draw a three-tier block architecture on your answer sheet:\n` +
          `\`\`\`\n` +
          `[ Client Application ] ---> [ Transaction Coordinator ] ---> [ Storage Subsystem ]\n` +
          `                                  | (Write-Ahead Log)\n` +
          `                                  v\n` +
          `                           [ Stable Storage ]\n` +
          `\`\`\`\n` +
          `*Ensure clear labeling of control flow arrows and buffer pool boundaries.*\n\n` +
          `#### Part 4: Step-by-Step Algorithm & Operational Phases\n` +
          `• **Phase 1 (Preparation):** Validate prerequisites, acquire semantic read/write locks, and record intent locks.\n` +
          `• **Phase 2 (Execution):** Apply state transformations within isolated buffer memory space.\n` +
          `• **Phase 3 (Commit/Abort):** Flush transaction records to durable storage and release acquired locks.\n\n` +
          `#### Part 5: Engineering Case Study\n` +
          `Consider a banking balance ledger update: atomicity ensures debit and credit happen together or neither takes effect, preventing financial inconsistencies.\n\n` +
          `#### Part 6: SPPU Evaluator Marking Rubric\n` +
          `• Definition & Formal Scope: 2 Marks\n` +
          `• Schematic Architecture Diagram: 3 Marks\n` +
          `• Algorithmic Phases & Explanation: 3 Marks\n` +
          `• Practical Case Study & Examiner Keywords: 2 Marks` +
          historySection;
      } else if (is5M) {
        responseContent =
          `### 5-Mark Model Solution\n\n` +
          `**Definition:** A core engineering standard evaluated in SPPU university papers that establishes invariant boundaries and structural integrity.\n\n` +
          `**Key Evaluation Points for SPPU Examiners:**\n` +
          `1. **Formal Principle:** Establishes formal mathematical and architectural rules.\n` +
          `2. **System Mechanism:** Mediates state transitions without introducing deadlock or loss of data.\n` +
          `3. **Operational Guarantees:** Ensures consistency across concurrent operations.\n` +
          `4. **Practical Use:** Widely deployed across enterprise DBMS and distributed computational nodes.\n\n` +
          `**Schematic Diagram to Draw:**\n` +
          `Illustrate a block diagram showing inputs flowing through validation phases into the storage engine with feedback status loops.\n\n` +
          `**Evaluator Tip:** Examiners look for explicit mention of formal constraints, schematic diagrams, and real-world industrial examples to award the full 5 marks.` +
          historySection;
      } else if (isTeachMe) {
        responseContent =
          `### Interactive Study Breakdown (Teach Me Mode)\n\n` +
          `#### 1. The Intuitive Real-World Analogy\n` +
          `Think of this concept like a bank ATM withdrawal. When you withdraw cash, two things must happen: money is dispensed, and your bank balance decreases. If the power cuts out mid-way, you either get both or neither—never half a transaction! That is the core intuition behind this principle.\n\n` +
          `#### 2. Three Progressive Learning Milestones\n` +
          `• **Milestone 1 (The Core Problem):** Without formal constraints, concurrent system operations corrupt shared data structures.\n` +
          `• **Milestone 2 (The Solution Mechanism):** Mathematical invariants define legal versus illegal states.\n` +
          `• **Milestone 3 (Advanced Nuance):** Trade-offs between absolute consistency and operational throughput.\n\n` +
          `#### 3. Pause & Think Checkpoint\n` +
          `*Question:* What would happen if a transaction committed to memory but failed before flushing to stable disk? How does the database recovery manager address this?\n\n` +
          `#### 4. Syllabus Prerequisites\n` +
          `Review Unit 1 foundations (File Systems vs DBMS) before diving deeper into Unit 4 transaction schedules.` +
          historySection;
      } else if (isQuizMe) {
        responseContent =
          `### Targeted Diagnostic Drill (Quiz Me Mode)\n\n` +
          `**Question 1 (Core Recall):**\n` +
          `Which property guarantees that all operations within a transaction unit are completed successfully or none are preserved?\n` +
          `• A) Consistency\n` +
          `• B) Atomicity\n` +
          `• C) Isolation\n` +
          `• D) Durability\n` +
          `*Correct Answer:* **B) Atomicity**. *Explanation:* Atomicity mandates an all-or-nothing execution policy.\n\n` +
          `**Question 2 (SPPU Exam Standard):**\n` +
          `In SPPU question papers, which protocol is most frequently tested for preventing lost updates in concurrent schedules?\n` +
          `• A) Two-Phase Locking (2PL)\n` +
          `• B) First-In-First-Out Queueing\n` +
          `• C) Round-Robin Scheduling\n` +
          `• D) Uncontrolled Read Uncommitted\n` +
          `*Correct Answer:* **A) Two-Phase Locking (2PL)**. *Explanation:* 2PL guarantees serializability by separating lock acquisition and release phases.\n\n` +
          `**Question 3 (Analytical):**\n` +
          `What is the primary trade-off when increasing isolation levels from Read Committed to Serializable?\n` +
          `• A) Storage overhead decreases\n` +
          `• B) Concurrency and throughput decrease while consistency guarantees increase\n` +
          `• C) Crash recovery becomes impossible\n` +
          `• D) Network bandwidth is doubled\n` +
          `*Correct Answer:* **B**. *Explanation:* Stricter isolation reduces parallelism due to longer lock durations.` +
          historySection;
      } else if (isStudyPlan) {
        responseContent =
          `### Empirical Study Plan & Revision Roadmap\n\n` +
          `Based on verified SPPU question frequency and weightage analysis:\n\n` +
          `| Priority Tier | Topic Name | Est. Study Time | Exam Focus Strategy |\n` +
          `| :--- | :--- | :--- | :--- |\n` +
          `| 🔴 **MUST STUDY** | Normalization & Decomposition | 2.5 Hours | Master 3NF vs BCNF proofs and 10M synthesis problems |\n` +
          `| 🔴 **MUST STUDY** | Transactions & Concurrency | 2.0 Hours | Draw 2PL timing diagrams and ACID definitions |\n` +
          `| 🟠 **HIGH** | ER Modeling & Relational Algebra | 1.5 Hours | Practice translation algorithms and schema mapping |\n` +
          `| 🟡 **MEDIUM** | Query Optimization & Indexing | 1.0 Hours | Focus on B-Trees vs B+ Trees comparative tables |\n\n` +
          `**Recommended Action Plan:**\n` +
          `1. Spend the first 60% of your time on MUST STUDY topics to lock in high-probability marks.\n` +
          `2. Solve at least 3 historical PYQ numericals without looking at the solutions.\n` +
          `3. Complete the rapid 15-minute diagnostic quiz before exam day.` +
          historySection;
      } else if (isRevise) {
        responseContent =
          `### Rapid High-Yield Revision Sheet\n\n` +
          `#### 1. Essential Definitions & Formulas\n` +
          `• **Functional Dependency:** $X \\rightarrow Y$ holds if whenever two tuples agree on $X$, they must agree on $Y$.\n` +
          `• **3NF Condition:** For every non-trivial $X \\rightarrow A$, either $X$ is a superkey or $A$ is a prime attribute.\n` +
          `• **BCNF Condition:** For every non-trivial $X \\rightarrow A$, $X$ MUST be a superkey.\n\n` +
          `#### 2. High-Frequency Exam Question Variations\n` +
          `• "Differentiate between 3NF and BCNF with a suitable example." (Appeared in 4 of last 5 papers)\n` +
          `• "Explain lossy vs lossless decomposition." (Frequently tested as a 5M short answer)\n\n` +
          `#### 3. Top 3 Mistakes to Avoid in the Exam Hall\n` +
          `1. Forgetting to test for Dependency Preservation when decomposing into BCNF.\n` +
          `2. Writing generic textbook paragraphs without drawing the required schematic diagram.\n` +
          `3. Confusing Serial Schedule with Serializable Schedule.\n\n` +
          `#### 4. 5-Minute Exam Hall Checklist\n` +
          `✓ Remember that BCNF is strictly stronger than 3NF.\n` +
          `✓ Always define prime attributes when discussing normal forms.` +
          historySection;
      } else {
        // Default Explain / Ask ScoreEdge
        responseContent =
          `### Academic Explanation & Solution\n\n` +
          `Based on verified SPPU engineering syllabus records and historical exam patterns:\n\n` +
          `• **Key Exam Concept:** Evaluated directly from verified course material.\n` +
          `• **Evaluator Key Points:** Structure answers with formal definitions, schematic diagrams, and step-by-step algorithms.\n` +
          `• **Historical Examination Pattern:** This topic frequently appears in university question papers.` +
          historySection;
      }
    }

    // Estimate simulated token usage (~4 chars / token)
    const promptLen = options.messages.reduce((acc, m) => acc + m.content.length, 0);
    const completionLen = responseContent.length;

    return {
      content: responseContent,
      provider: this.name,
      model: 'scoreedge-mock-v1',
      usage: {
        promptTokens: Math.ceil(promptLen / 4),
        completionTokens: Math.ceil(completionLen / 4),
        totalTokens: Math.ceil((promptLen + completionLen) / 4),
      },
      finishReason: 'stop',
    };
  }
}

/**
 * Factory for creating the active AI provider.
 * Swappable via environment variable AI_PROVIDER ('groq' | 'openai' | 'mock' | 'fallback').
 * Automatically defaults to Groq or OpenAI if their respective API keys are detected.
 */
export function getAIProvider(overrideProvider?: string): AIProvider {
  const providerType = (
    overrideProvider ||
    process.env.AI_PROVIDER ||
    (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('placeholder')
      ? 'groq'
      : process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')
      ? 'openai'
      : 'mock')
  ).toLowerCase();

  if (providerType === 'groq') {
    const groq = new GroqProvider();
    if (groq.isAvailable()) {
      return groq;
    }
    // If Groq is requested but key missing, fallback to Mock in non-prod
    if (process.env.NODE_ENV !== 'production') {
      return new MockAIProvider();
    }
    return groq;
  }

  if (providerType === 'openai') {
    const openai = new OpenAIProvider();
    if (openai.isAvailable()) {
      return openai;
    }
    // If OpenAI is requested but no key exists, fallback to Mock in non-prod
    if (process.env.NODE_ENV !== 'production') {
      return new MockAIProvider();
    }
    return openai;
  }

  return new MockAIProvider();
}
