import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Manage account & connect account placeholder page.
 */
@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Accounts'"
      [description]="'Connect and manage Instagram, Facebook, Threads, and WhatsApp accounts (OAuth flows coming next).'"
    >
      <div class="grid">
        <div class="card">
          <div class="title">Instagram</div>
          <div class="status">Not connected</div>
        </div>
        <div class="card">
          <div class="title">Facebook</div>
          <div class="status">Not connected</div>
        </div>
        <div class="card">
          <div class="title">Threads</div>
          <div class="status">Not connected</div>
        </div>
        <div class="card">
          <div class="title">WhatsApp</div>
          <div class="status">Not connected</div>
        </div>
      </div>
    </app-page>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .card {
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: var(--shadow-sm);
      }
      .title {
        font-weight: 800;
      }
      .status {
        margin-top: 8px;
        font-size: 13px;
        color: var(--muted);
      }
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AccountsPage {}
