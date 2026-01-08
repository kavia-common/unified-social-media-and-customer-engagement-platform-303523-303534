import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Agent Template Gallery placeholder page.
 */
@Component({
  selector: 'app-agent-templates-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Agent Template Gallery'"
      [description]="'Browse and create agents from templates (gallery and import coming next).'"
    >
      <div class="placeholder">Template gallery placeholder</div>
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
export class AgentTemplatesPage {}
