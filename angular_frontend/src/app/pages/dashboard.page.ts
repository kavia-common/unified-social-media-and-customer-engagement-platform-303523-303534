import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Dashboard placeholder page.
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Dashboard'"
      [description]="'Overview of performance, inbox status, and activity (widgets coming next).'"
    >
      <div class="grid">
        <div class="card">
          <div class="card-title">Inbox</div>
          <div class="card-value">0</div>
          <div class="card-subtitle">Active conversations (placeholder)</div>
        </div>

        <div class="card">
          <div class="card-title">Scheduled Posts</div>
          <div class="card-value">0</div>
          <div class="card-subtitle">Instagram / Facebook / Threads</div>
        </div>

        <div class="card">
          <div class="card-title">Agents</div>
          <div class="card-value">0</div>
          <div class="card-subtitle">AI + Non-AI + Live Chat</div>
        </div>
      </div>
    </app-page>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .card {
        border: 1px solid var(--border);
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.06) 0%, rgba(255, 255, 255, 1) 55%);
        border-radius: 16px;
        padding: 14px;
        box-shadow: var(--shadow-sm);
      }

      .card-title {
        font-weight: 700;
        color: var(--text);
      }

      .card-value {
        margin-top: 10px;
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: var(--text);
      }

      .card-subtitle {
        margin-top: 6px;
        font-size: 12px;
        color: var(--muted);
      }

      @media (max-width: 1024px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardPage {}
