import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, normalizeHttpError } from './api-error';

/**
 * Central handler for HTTP errors. Keeps UI code free of repetitive try/catch logic.
 * Today it logs to console; later we can plug in a toast/notification service and telemetry.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorHandlerService {
  /**
   * PUBLIC_INTERFACE
   * Handle an error originating from an HTTP call (typically via interceptor).
   */
  handle(error: unknown): ApiError {
    const apiError = normalizeHttpError(error);

    // Minimal default behavior: log helpful info.
    // Future: integrate notification center + structured telemetry.
    if (error instanceof HttpErrorResponse) {
      // eslint-disable-next-line no-console
      console.error('[HTTP ERROR]', {
        status: apiError.status,
        message: apiError.message,
        url: error.url,
        requestId: apiError.requestId,
        details: apiError.details,
      });
    } else {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', apiError);
    }

    return apiError;
  }
}
