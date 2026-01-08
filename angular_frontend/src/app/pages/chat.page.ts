import { Component } from '@angular/core';
import { PageComponent } from '../shared/page.component';

/**
 * Chat management / Single Inbox placeholder page.
 */
@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [PageComponent],
  template: `
    <app-page
      [title]="'Chat / Single Inbox'"
      [description]="'Unified inbox for Live chat, AI Agent, Instagram, Facebook, and WhatsApp messages (real-time coming next).'"
    >
      <div class="split">
        <div class="col">
          <div class="section-title">Conversations</div>
          <div class="list">
            <div class="row">
              <div class="avatar" aria-hidden="true">?</div>
              <div class="meta">
                <div class="name">No conversations yet</div>
                <div class="sub">Connect accounts and enable agents</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="section-title">Conversation</div>
          <div class="thread">
            <div class="thread-placeholder">Select a conversation to start</div>
          </div>
        </div>
      </div>
    </app-page>
  `,
  styles: [
    `
      .split {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 12px;
      }
      .col {
        border: 1px solid var(--border);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }
      .section-title {
        padding: 12px 14px;
        font-weight: 800;
        border-bottom: 1px solid rgba(17, 24, 39, 0.08);
      }
      .list {
        padding: 10px;
      }
      .row {
        display: grid;
        grid-template-columns: 36px 1fr;
        gap: 10px;
        align-items: center;
        padding: 10px;
        border-radius: 12px;
        border: 1px solid rgba(17, 24, 39, 0.08);
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(255, 255, 255, 1));
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        font-weight: 800;
        color: white;
        background: linear-gradient(135deg, var(--primary), #1d4ed8);
      }
      .name {
        font-weight: 700;
        color: var(--text);
      }
      .sub {
        margin-top: 2px;
        font-size: 12px;
        color: var(--muted);
      }
      .thread {
        min-height: 360px;
        display: grid;
        place-items: center;
        padding: 14px;
      }
      .thread-placeholder {
        color: var(--muted);
        font-weight: 700;
      }
      @media (max-width: 1024px) {
        .split {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ChatPage {}
