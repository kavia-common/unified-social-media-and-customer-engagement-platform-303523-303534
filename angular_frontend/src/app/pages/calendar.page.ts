import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Calendar placeholder page.
 */
@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Calendar'"
      [description]="'Calendar, list, and kanban views for posts and events (views coming next).'"
    >
      <div class="chips" aria-label="Views (placeholder)">
        <span class="chip chip-primary">Calendar</span>
        <span class="chip">List</span>
        <span class="chip">Kanban</span>
      </div>
      <div class="placeholder">
        Calendar surface placeholder
      </div>
    </app-page>
  `,
  styles: [
    `
      .chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .chip {
        font-size: 12px;
        padding: 8px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.9);
        color: var(--text);
      }
      .chip-primary {
        border-color: rgba(37, 99, 235, 0.35);
        background: rgba(37, 99, 235, 0.10);
      }
      .placeholder {
        height: 320px;
        border-radius: 16px;
        border: 1px dashed rgba(17, 24, 39, 0.2);
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(245, 158, 11, 0.05));
        display: grid;
        place-items: center;
        color: var(--muted);
        font-weight: 700;
      }
    `,
  ],
})
export class CalendarPage {}
