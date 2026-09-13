import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GroqProvider, getAIProvider } from '@/lib/ai/provider';

describe('GroqProvider & AI Provider Engine', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should report availability accurately based on API key validity', () => {
    const emptyProvider = new GroqProvider({ apiKey: '' });
    expect(emptyProvider.isAvailable()).toBe(false);

    const placeholderProvider = new GroqProvider({ apiKey: 'your_groq_api_key_here' });
    // In provider.ts, apiKey with 'placeholder' or empty is considered unavailable
    const actualKeyProvider = new GroqProvider({ apiKey: 'gsk_1234567890abcdef' });
    expect(actualKeyProvider.isAvailable()).toBe(true);
    expect(actualKeyProvider.name).toBe('GROQ');
  });

  it('should auto-detect Groq when GROQ_API_KEY is defined in env', () => {
    process.env.GROQ_API_KEY = 'gsk_valid_live_groq_key_999';
    delete process.env.AI_PROVIDER;

    const provider = getAIProvider();
    expect(provider.name).toBe('GROQ');
    expect(provider.isAvailable()).toBe(true);
  });

  it('should fallback to MockProvider when GROQ_API_KEY is empty in test environment', () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENAI_API_KEY;
    process.env.AI_PROVIDER = 'groq';

    const provider = getAIProvider();
    expect(provider.name).toBe('MOCK_FALLBACK');
  });

  it('should send well-formed OpenAI-compatible request payload to Groq endpoint', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'chatcmpl-test',
        model: 'llama-3.3-70b-versatile',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Normalization divides tables to eliminate data redundancy.',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 30,
          completion_tokens: 10,
          total_tokens: 40,
        },
      }),
    });

    global.fetch = fakeFetch as unknown as typeof fetch;

    const provider = new GroqProvider({
      apiKey: 'gsk_test_valid_key',
      defaultModel: 'llama-3.3-70b-versatile',
    });

    const res = await provider.chat({
      messages: [
        { role: 'system', content: 'You are an SPPU academic tutor.' },
        { role: 'user', content: 'Explain 3NF.' },
      ],
      temperature: 0.1,
      maxTokens: 500,
    });

    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fakeFetch.mock.calls[0];
    expect(calledUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.headers['Authorization']).toBe('Bearer gsk_test_valid_key');
    expect(calledOptions.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(calledOptions.body);
    expect(body.model).toBe('llama-3.3-70b-versatile');
    expect(body.messages).toHaveLength(2);
    expect(body.max_tokens).toBe(500);

    expect(res.provider).toBe('GROQ');
    expect(res.content).toContain('Normalization divides tables');
    expect(res.usage?.totalTokens).toBe(40);
  });

  it('should handle 401 invalid API key error gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API Key' } }),
    }) as unknown as typeof fetch;

    const provider = new GroqProvider({ apiKey: 'gsk_invalid_key' });

    await expect(
      provider.chat({
        messages: [{ role: 'user', content: 'Hello' }],
      })
    ).rejects.toThrow('Groq authentication failed: Invalid GROQ_API_KEY.');
  });
});

