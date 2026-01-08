import { Injectable, signal } from '@angular/core';

/**
 * Tenant context holder. This is a simple in-memory store for now.
 * Future: hydrate from user profile / route / subdomain and persist as needed.
 */
@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly _tenantId = signal<string | null>(null);

  /**
   * PUBLIC_INTERFACE
   * Current tenant id (nullable).
   */
  tenantId(): string | null {
    return this._tenantId();
  }

  /**
   * PUBLIC_INTERFACE
   * Update tenant id.
   */
  setTenantId(tenantId: string | null): void {
    this._tenantId.set(tenantId);
  }
}
