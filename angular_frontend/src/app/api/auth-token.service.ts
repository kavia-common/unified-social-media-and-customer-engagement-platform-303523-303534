import { Injectable } from '@angular/core';

/**
 * Simple token accessor used by the auth interceptor.
 * Future: replace with a full auth module (OIDC/PKCE) and refresh token logic.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly storageKey = 'uep.jwt';

  /**
   * PUBLIC_INTERFACE
   * Return current JWT (if any).
   */
  getToken(): string | null {
    try {
      return globalThis?.localStorage?.getItem(this.storageKey) ?? null;
    } catch {
      // SSR / storage disabled
      return null;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Set or clear JWT.
   */
  setToken(token: string | null): void {
    try {
      if (!globalThis?.localStorage) return;
      if (token) globalThis.localStorage.setItem(this.storageKey, token);
      else globalThis.localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
  }
}
