import { NextResponse } from 'next/server';

export interface ApiSuccessEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccessEnvelope<T> = { data };
  if (meta) {
    body.meta = meta;
  }
  return NextResponse.json(body, { status });
}

export function apiError(code: string, message: string, status = 400, details?: unknown) {
  const body: ApiErrorEnvelope = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}
