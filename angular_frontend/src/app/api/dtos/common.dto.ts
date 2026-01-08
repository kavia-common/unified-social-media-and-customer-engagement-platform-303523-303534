/**
 * Common DTOs and conventions.
 * These will be progressively replaced/augmented by OpenAPI-generated types.
 */

export interface PagedResultDto<T> {
  items: T[];
  total: number;
}

export interface HealthDto {
  status: 'ok' | 'degraded' | 'down' | string;
  version?: string;
  timestamp?: string;
}
