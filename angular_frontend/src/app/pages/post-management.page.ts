import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Post Management placeholder page.
 */
@Component({
  selector: 'app-post-management-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Post Management'"
      [description]="'Create and manage posts for Instagram, Facebook, and Threads (editor and scheduler coming next).'"
    >
      <div class="panel">
        <div class="label">Coming next</div>
        <ul>
          <li>Create Post</li>
          <li>Manage Post</li>
          <li>Attachments & media library</li>
          <li>Approvals and scheduling</li>
        </ul>
      </div>
    </app-page>
  `,
  styles: [
    `
      .panel {
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255, 255, 255, 0.9);
      }
      .label {
        font-weight: 800;
        margin-bottom: 8px;
      }
      ul {
        margin: 0;
        padding-left: 18px;
        color: var(--text);
      }
      li {
        margin: 6px 0;
        color: var(--muted);
      }
    `,
  ],
})
export class PostManagementPage {}
