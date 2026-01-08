import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Website activity tracking placeholder page.
 */
@Component({
  selector: 'app-website-activity-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Website Activity'"
      [description]="'Website activity tracking and bot activity insights (tracking script and analytics coming next).'"
    >
      <div class="placeholder">Website activity tracking placeholder</div>
    </app-page>
  `,
  styles: [
    `
      .placeholder {
        height: 240px;
        border-radius: 16px;
        border: 1px dashed rgba(17, 24, 39, 0.2);
        display: grid;
        place-items: center;
        color: var(--muted);
        font-weight: 700;
        background: rgba(255, 255, 255, 0.9);
      }
    `,
  ],
})
export class WebsiteActivityPage {}
