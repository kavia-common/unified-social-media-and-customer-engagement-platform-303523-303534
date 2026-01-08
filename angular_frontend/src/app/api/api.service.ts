import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Base API service:
 * - Centralizes API baseUrl
 * - Provides typed helper methods
 * - Keeps a consistent place to later switch to OpenAPI-generated clients/types
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * PUBLIC_INTERFACE
   * Build a full URL from an API path. Accepts either '/v1/foo' or 'v1/foo'.
   */
  url(path: string): string {
    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  /**
   * PUBLIC_INTERFACE
   * Perform a GET request with optional query params.
   */
  get<TResponse>(path: string, query?: Record<string, string | number | boolean | null | undefined>): Observable<TResponse> {
    return this.http.get<TResponse>(this.url(path), { params: toHttpParams(query) });
  }

  /**
   * PUBLIC_INTERFACE
   * Perform a POST request.
   */
  post<TResponse, TBody = unknown>(path: string, body: TBody): Observable<TResponse> {
    return this.http.post<TResponse>(this.url(path), body);
  }

  /**
   * PUBLIC_INTERFACE
   * Perform a PUT request.
   */
  put<TResponse, TBody = unknown>(path: string, body: TBody): Observable<TResponse> {
    return this.http.put<TResponse>(this.url(path), body);
  }

  /**
   * PUBLIC_INTERFACE
   * Perform a PATCH request.
   */
  patch<TResponse, TBody = unknown>(path: string, body: TBody): Observable<TResponse> {
    return this.http.patch<TResponse>(this.url(path), body);
  }

  /**
   * PUBLIC_INTERFACE
   * Perform a DELETE request.
   */
  delete<TResponse>(path: string, query?: Record<string, string | number | boolean | null | undefined>): Observable<TResponse> {
    return this.http.delete<TResponse>(this.url(path), { params: toHttpParams(query) });
  }
}

function toHttpParams(query?: Record<string, string | number | boolean | null | undefined>): HttpParams {
  let params = new HttpParams();
  if (!query) return params;

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    params = params.set(key, String(value));
  }
  return params;
}
