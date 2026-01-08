import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpErrorHandlerService } from '../http-error-handler.service';

/**
 * PUBLIC_INTERFACE
 * Global error interceptor:
 * - Normalizes and logs errors via HttpErrorHandlerService
 * - Re-throws a normalized ApiError so callers can handle consistently
 */
export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const handler = inject(HttpErrorHandlerService);

  return next(req).pipe(
    catchError((err) => {
      const normalized = handler.handle(err);
      return throwError(() => normalized);
    }),
  );
}
