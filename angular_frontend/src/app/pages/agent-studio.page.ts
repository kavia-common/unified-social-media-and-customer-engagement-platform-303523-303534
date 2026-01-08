import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Agent Studio placeholder page.
 * Future: agent cards, edit/test/settings; inner screens for setup, install, integrations, settings, data management.
 */
@Component({
  selector: 'app-agent-studio-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Agent Studio'"
      [description]="'Create and configure AI + non-AI agents and live chat queue handling (cards and editor coming next).'"
    >
      <div class="grid">
        <div class="card">
          <div class="card-header">
            <div class="name">Agent (placeholder)</div>
            <div class="actions">
              <button class="btn" type="button">Edit</button>
              <button class="btn btn-secondary" type="button">Test</button>
              <button class="btn" type="button" title="Settings menu placeholder">Settings</button>
            </div>
          </div>
          <div class="meta">
            Supports: Live chat queue, AI agent, Instagram/Facebook/WhatsApp bots.
          </div>
          <div class="pill-row">
            <span class="pill pill-primary">AI</span>
            <span class="pill">Live Chat</span>
            <span class="pill">Multilingual</span>
          </div>
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
      .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      .name {
        font-weight: 900;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .meta {
        margin-top: 10px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.4;
      }
      .pill-row {
        margin-top: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pill {
        font-size: 12px;
        padding: 7px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.95);
        color: var(--text);
      }
      .pill-primary {
        border-color: rgba(37, 99, 235, 0.35);
        background: rgba(37, 99, 235, 0.10);
      }

      .btn {
        appearance: none;
        border: 1px solid rgba(37, 99, 235, 0.30);
        background: rgba(37, 99, 235, 0.10);
        color: var(--text);
        font-weight: 700;
        border-radius: 12px;
        padding: 8px 10px;
        cursor: pointer;
      }

      .btn.btn-secondary {
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
      }

      @media (max-width: 1024px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AgentStudioPage {}
