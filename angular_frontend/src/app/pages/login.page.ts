import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiError } from '../api/api-error';
import { AuthClient } from '../api/clients/auth.client';
import { PageComponent } from '../shared/page.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageComponent],
  template: `
    <app-page [title]="'Sign in'" [description]="'Enter tenant + credentials to access the app.'">
      <div class="card">
        <form (ngSubmit)="onSubmit()" class="form" aria-label="Login form">
          <label class="lbl">
            <span class="k">Tenant</span>
            <input class="input" name="tenantId" [(ngModel)]="tenantId" autocomplete="organization" required />
          </label>

          <label class="lbl">
            <span class="k">Email</span>
            <input class="input" name="email" [(ngModel)]="email" autocomplete="email" required />
          </label>

          <label class="lbl">
            <span class="k">Password</span>
            <input class="input" name="password" [(ngModel)]="password" type="password" autocomplete="current-password" required />
          </label>

          @if (error()) {
            <div class="err" role="alert">
              {{ error() }}
            </div>
          }

          <div class="row">
            <button class="btn btn-primary" type="submit" [disabled]="busy()">Sign in</button>
          </div>
        </form>

        <div class="hint">
          Note: this is a basic login flow for development. JWT is stored in localStorage as <code>uep.jwt</code>.
        </div>
      </div>
    </app-page>
  `,
  styles: [
    `
      .card {
        border: 1px solid var(--border);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: var(--shadow-sm);
        padding: 14px;
        max-width: 520px;
      }
      .form {
        display: grid;
        gap: 10px;
      }
      .lbl {
        display: grid;
        gap: 6px;
      }
      .k {
        font-weight: 800;
        font-size: 12px;
        color: var(--muted);
      }
      .input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.95);
      }
      .row {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .btn {
        appearance: none;
        border: 1px solid rgba(37, 99, 235, 0.3);
        background: rgba(37, 99, 235, 0.1);
        color: var(--text);
        font-weight: 800;
        border-radius: 12px;
        padding: 10px 12px;
        cursor: pointer;
      }
      .btn.btn-primary {
        border-color: rgba(37, 99, 235, 0.5);
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(37, 99, 235, 0.1));
      }
      .btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .err {
        border: 1px solid rgba(239, 68, 68, 0.25);
        background: rgba(239, 68, 68, 0.08);
        color: #991b1b;
        padding: 10px 12px;
        border-radius: 12px;
        font-weight: 700;
      }
      .hint {
        margin-top: 12px;
        font-size: 12px;
        color: var(--muted);
        line-height: 1.4;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      }
    `,
  ],
})
export class LoginPage {
  tenantId = 'dev';
  email = '';
  password = '';

  busy = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  // PUBLIC_INTERFACE
  onSubmit(): void {
    /** Submit login form and redirect to returnUrl (or /dashboard). */
    if (this.busy()) return;
    this.error.set(null);

    const tenantId = this.tenantId.trim();
    const email = this.email.trim();
    const password = this.password;

    if (!tenantId || !email || !password) {
      this.error.set('Please provide tenant, email, and password.');
      return;
    }

    this.busy.set(true);
    this.auth.login({ tenantId, email, password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl).catch(() => {});
      },
      error: (err: ApiError) => {
        this.error.set(err?.message ?? 'Login failed.');
        this.busy.set(false);
      },
    });
  }
}
