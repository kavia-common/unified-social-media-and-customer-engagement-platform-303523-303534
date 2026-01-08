import { HttpErrorResponse } from '@angular/common/http';

/**
 * Normalized API error shape for use across the UI.
 * Keeps a stable surface regardless of backend error variations.
 */
export interface ApiError {
  /** HTTP status code. 0 typically indicates a network or CORS error. */
  status: number;
  /** Short, user-friendly message. */
  message: string;
  /** Optional backend error payload for debugging/telemetry. */
  details?: unknown;
  /** Optional correlation/request id if the backend provides one. */
  requestId?: string;
}

/**
 * PUBLIC_INTERFACE
 * Convert an Angular HttpErrorResponse into a normalized ApiError.
 */
export function normalizeHttpError(err: unknown): ApiError {
  if (!(err instanceof HttpErrorResponse)) {
    return {
      status: 0,
      message: 'Unexpected error.',
      details: err,
    };
  }

  const requestId =
    err.headers?.get('x-request-id') ??
    err.headers?.get('x-correlation-id') ??
    err.headers?.get('traceparent') ??
    undefined;

  // Common patterns:
  // - ASP.NET ProblemDetails: { title, status, detail, traceId, errors? }
  // - Custom: { message, errorCode, ... }
  const payload = err.error;
  const payloadAny = payload as any;

  const message =
    (typeof payloadAny?.title === 'string' && payloadAny.title) ||
    (typeof payloadAny?.message === 'string' && payloadAny.message) ||
    (typeof payloadAny?.error === 'string' && payloadAny.error) ||
    err.statusText ||
    (err.status === 0 ? 'Network error. Please check your connection.' : 'Request failed.');

  return {
    status: err.status ?? 0,
    message,
    details: payload,
    requestId: requestId || payloadAny?.traceId,
  };
}
