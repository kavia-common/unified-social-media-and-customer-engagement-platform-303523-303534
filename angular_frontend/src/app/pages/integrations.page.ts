import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Integrations placeholder page (CRM, Sheets, Email, SMS).
 */
@Component({
  selector: 'app-integrations-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Integrations'"
      [description]="'Manage integrations: CRM, Google Sheets, Email and SMS services (connectors coming next).'"
    >
      <div class="panel">
        <div class="row"><span class="k">CRM</span><span class="v">Not configured</span></div>
        <div class="row"><span class="k">Google Sheets</span><span class="v">Not configured</span></div>
        <div class="row"><span class="k">Email</span><span class="v">Not configured</span></div>
        <div class="row"><span class="k">SMS</span><span class="v">Not configured</span></div>
      </div>
    </app-page>
  `,
  styles: [
    `
      .panel {
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: var(--shadow-sm);
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 8px;
        border-radius: 12px;
      }
      .row + .row {
        border-top: 1px solid rgba(17, 24, 39, 0.08);
      }
      .k {
        font-weight: 800;
        color: var(--text);
      }
      .v {
        color: var(--muted);
        font-size: 13px;
      }
    `,
  ],
})
export class IntegrationsPage {}
