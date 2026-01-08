import { Injectable } from '@angular/core';
import { AuthTokenService } from './auth-token.service';

/**
 * Minimal session helper:
 * - today: just checks if a JWT exists
 * - future: parse JWT claims, refresh tokens, load /api/me profile, etc.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private readonly tokens: AuthTokenService) {}

  // PUBLIC_INTERFACE
  isAuthenticated(): boolean {
    /** True if a JWT exists in storage. */
    return Boolean(this.tokens.getToken());
  }
}
