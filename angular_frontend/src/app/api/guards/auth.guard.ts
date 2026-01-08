import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { SessionService } from '../session.service';

/**
 * PUBLIC_INTERFACE
 * Auth guard for protected routes.
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const session = inject(SessionService);
  if (session.isAuthenticated()) return true;

  const router = inject(Router);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
