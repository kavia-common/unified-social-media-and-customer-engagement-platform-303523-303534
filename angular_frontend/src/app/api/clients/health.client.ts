import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { HealthDto } from '../dtos/common.dto';

/**
 * Example API client. This is mainly scaffolding to establish patterns.
 * Update paths once backend endpoints are confirmed.
 */
@Injectable({ providedIn: 'root' })
export class HealthClient {
  constructor(private readonly api: ApiService) {}

  /**
   * PUBLIC_INTERFACE
   * Fetch backend health (endpoint path may change when backend is finalized).
   */
  getHealth(): Observable<HealthDto> {
    // Common backend patterns: /health or /api/health.
    // Keep as a placeholder; consumers can override once real route exists.
    return this.api.get<HealthDto>('/health');
  }
}
