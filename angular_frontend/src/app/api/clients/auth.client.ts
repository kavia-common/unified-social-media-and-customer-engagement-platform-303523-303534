import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api.service';
import { AuthTokenService } from '../auth-token.service';

export interface LoginRequestDto {
  email: string;
  password: string;
  tenantId?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: 'Bearer' | string;
  expiresInSeconds: number;
  tenantId: string;
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Auth API client for basic login flow.
 * Stores the returned JWT in AuthTokenService for interceptors + SignalR usage.
 */
@Injectable({ providedIn: 'root' })
export class AuthClient {
  constructor(
    private readonly api: ApiService,
    private readonly tokens: AuthTokenService,
  ) {}

  // PUBLIC_INTERFACE
  login(request: LoginRequestDto): Observable<LoginResponseDto> {
    /** Logs in against POST /api/auth/login and stores the returned access token. */
    return this.api.post<LoginResponseDto, LoginRequestDto>('/api/auth/login', request).pipe(
      tap((resp) => {
        const token = resp?.accessToken?.trim();
        if (token) this.tokens.setToken(token);
      }),
    );
  }

  // PUBLIC_INTERFACE
  logout(): void {
    /** Clears local JWT. */
    this.tokens.setToken(null);
  }
}
