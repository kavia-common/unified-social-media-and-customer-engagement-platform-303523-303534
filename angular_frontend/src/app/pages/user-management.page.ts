import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * User management placeholder page (roles/permissions, admin/support).
 */
@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'User Management'"
      [description]="'Admin and Support users, roles and permissions (auth and RBAC coming next).'"
    >
      <div class="panel">
        <div class="row"><span class="k">Admin</span><span class="v">Full access (placeholder)</span></div>
        <div class="row"><span class="k">Support</span><span class="v">Inbox-only access (placeholder)</span></div>
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
        font-weight: 900;
        color: var(--text);
      }
      .v {
        color: var(--muted);
        font-size: 13px;
      }
    `,
  ],
})
export class UserManagementPage {}
