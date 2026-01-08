import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthTokenService } from '../auth-token.service';
import { TenantContextService } from '../tenant-context.service';

/**
 * PUBLIC_INTERFACE
 * Interceptor that attaches:
 * - Authorization: Bearer <jwt> (if available)
 * - X-Tenant-Id: <tenantId> (if available)
 *
 * Note: This is implemented as a functional interceptor for Angular standalone apps.
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const tokenService = inject(AuthTokenService);
  const tenantContext = inject(TenantContextService);

  const token = tokenService.getToken();
  const tenantId = tenantContext.tenantId();

  // Only add headers when we have values; never overwrite an explicitly set header.
  let headers = req.headers;

  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (tenantId && !headers.has('X-Tenant-Id')) {
    headers = headers.set('X-Tenant-Id', tenantId);
  }

  // Optional: helps backend know this is an AJAX request
  if (!headers.has('X-Requested-With')) {
    headers = headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  const cloned = req.clone({ headers });
  return next(cloned);
}
