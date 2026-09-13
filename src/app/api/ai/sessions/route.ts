import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';
import { AISession } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';

    let userSessions = dbStore.aiSessions.filter((s) => s.user_id === userId);

    // If none exist, seed a couple of authentic recent sample sessions for immediate UI usability
    if (userSessions.length === 0) {
      const defaultSessions: AISession[] = [
        {
          id: 'sess-1',
          user_id: userId,
          subject_id: 'sub-dbms',
          file_name: 'DBMS_Unit2_Relational_Model.pdf',
          title: 'Quick Review: Relational Algebra & Normalization',
          source_mode: 'BOTH',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sess-2',
          user_id: userId,
          subject_id: 'sub-os',
          file_name: 'OS_Process_Scheduling_Notes.pdf',
          title: 'Important Exam Questions on CPU Scheduling',
          source_mode: 'SCOREDGE',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sess-3',
          user_id: userId,
          subject_id: 'sub-dbms',
          file_name: 'Unit3_Transactions_CheatSheet.pdf',
          title: '5-Mark Model Answer: Two-Phase Locking (2PL)',
          source_mode: 'MY_MATERIAL',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      dbStore.aiSessions.push(...defaultSessions);
      userSessions = defaultSessions;

      // Seed messages for sess-1
      if (dbStore.aiMessages.filter((m) => m.session_id === 'sess-1').length === 0) {
        dbStore.aiMessages.push(
          {
            id: 'msg-seed-1',
            session_id: 'sess-1',
            user_id: userId,
            role: 'user',
            content: 'Please give me a quick review of Relational Algebra and Normalization from this document.',
            source_mode: 'BOTH',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'msg-seed-2',
            session_id: 'sess-1',
            user_id: userId,
            role: 'assistant',
            content: `### Quick Review: Relational Algebra & Normalization (SPPU Grounded)\n\n**1. Core Concepts Identified:**\n• **Relational Algebra Operators:** Fundamental operations (Select $\\sigma$, Project $\\pi$, Cartesian Product $\\times$, Union $\\cup$, Set Difference $-$, Rename $\\rho$).\n• **Functional Dependencies (FDs):** An integrity constraint where $X \\to Y$ means $X$ uniquely determines $Y$.\n• **Boyce-Codd Normal Form (BCNF):** For every non-trivial FD $X \\to Y$, $X$ must be a superkey. Eliminates redundancy but might not preserve dependencies.\n• **Third Normal Form (3NF):** Allows non-superkey determinants if the dependent attribute is prime (part of a candidate key).\n\n**2. Key High-Yield Exam Tip:**\nAlways state that BCNF ensures lossless join but dependency preservation is guaranteed only in 3NF decomposition.`,
            source_mode: 'BOTH',
            citations: [
              {
                type: 'STUDENT_MATERIAL',
                id: 'chunk-dbms-1',
                title: 'DBMS_Unit2_Relational_Model.pdf (Section 1)',
                snippet: 'Relational algebra operators and functional dependency conditions in SPPU syllabus.',
              },
            ],
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000).toISOString(),
          }
        );
      }
    }

    const enhancedSessions = userSessions.map((sess) => {
      const messages = dbStore.aiMessages.filter((m) => m.session_id === sess.id);
      let fileName = sess.file_name;
      if (!fileName && sess.file_id) {
        const file = dbStore.userStudyFiles.find((f) => f.id === sess.file_id);
        if (file) fileName = file.filename;
      }
      return {
        ...sess,
        file_name: fileName,
        message_count: messages.length,
        last_message: messages[messages.length - 1]?.content?.slice(0, 120),
      };
    });

    return apiSuccess({
      sessions: enhancedSessions.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to load conversation history',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const json = await request.json().catch(() => ({}));

    const title = (json.title || 'New Study Session').slice(0, 100);
    const source_mode = json.source_mode || 'BOTH';
    const subject_id = json.subject_id || 'sub-dbms';
    const file_id = json.file_id || undefined;
    const file_name = json.file_name || undefined;

    const newSession: AISession = {
      id: `sess-${Date.now()}`,
      user_id: userId,
      subject_id,
      file_id,
      file_name,
      title,
      source_mode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.aiSessions.unshift(newSession);

    // If initial prompt/message provided, seed it
    if (json.initial_prompt) {
      dbStore.aiMessages.push({
        id: `msg-${Date.now()}-u`,
        session_id: newSession.id,
        user_id: userId,
        role: 'user',
        content: json.initial_prompt,
        source_mode,
        created_at: new Date().toISOString(),
      });
    }

    return apiSuccess({
      session: newSession,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to create AI session',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
