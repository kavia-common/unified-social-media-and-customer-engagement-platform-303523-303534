import { AfterViewChecked, Component, ElementRef, HostListener, ViewChild, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockInboxService } from '../inbox/mock-inbox.service';
import { InboxConversation, InboxMessage } from '../inbox/inbox.models';

/**
 * Chat / Single Inbox baseline UI:
 * - Left: conversation list
 * - Center: thread + composer
 * - Right: placeholder panel for AI assist / assignment / actions
 *
 * Data is currently served via MockInboxService; later this will be wired to real APIs.
 */
@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <section class="inbox" aria-label="Inbox">
      <header class="inbox-header" aria-label="Inbox header">
        <div class="hdr-left">
          <div class="hdr-title">Inbox</div>
          <div class="hdr-sub">Unified messages across channels (mock data for now)</div>
        </div>

        <div class="hdr-actions" aria-label="Inbox actions">
          <button class="btn" type="button" (click)="focusSearch()" aria-label="Focus conversation search">
            Search
          </button>
          <button class="btn btn-secondary" type="button" aria-label="Filters (placeholder)" title="Filters (placeholder)">
            Filters
          </button>
        </div>
      </header>

      <div class="inbox-grid" role="region" aria-label="Inbox workspace">
        <!-- LEFT: Conversation list -->
        <aside class="panel panel-left" aria-label="Conversation list">
          <div class="panel-top">
            <label class="sr-only" for="convSearch">Search conversations</label>
            <input
              #searchInput
              id="convSearch"
              class="input"
              type="search"
              autocomplete="off"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
              placeholder="Search conversations…"
              aria-label="Search conversations"
            />
          </div>

          <div class="list" role="listbox" aria-label="Conversations" [attr.aria-activedescendant]="activeDescId()">
            @for (c of filteredConversations(); track c.id) {
              <button
                class="conv"
                type="button"
                role="option"
                [id]="'conv_' + c.id"
                [class.active]="c.id === selectedId()"
                [attr.aria-selected]="c.id === selectedId()"
                (click)="select(c)"
              >
                <div class="avatar" aria-hidden="true">{{ avatarText(c) }}</div>

                <div class="conv-meta">
                  <div class="conv-row">
                    <div class="conv-title">{{ c.title }}</div>
                    <div class="conv-time">{{ c.lastMessageAt | date: 'shortTime' }}</div>
                  </div>

                  <div class="conv-preview">
                    <span class="channel" [attr.data-channel]="c.channel">{{ channelLabel(c.channel) }}</span>
                    <span class="preview-text">{{ c.lastMessagePreview }}</span>
                  </div>

                  <div class="conv-badges">
                    @if (c.unreadCount > 0) {
                      <span class="badge badge-primary" aria-label="Unread count">{{ c.unreadCount }}</span>
                    }
                    @if (c.isAiAssisted) {
                      <span class="badge" aria-label="AI assisted conversation">AI</span>
                    }
                    @if (c.assignedTo) {
                      <span class="badge" aria-label="Assigned">{{ c.assignedTo }}</span>
                    }
                  </div>
                </div>
              </button>
            }
          </div>

          <div class="panel-footer">
            <div class="hint">Keyboard: ↑/↓ to navigate, Enter to select</div>
          </div>
        </aside>

        <!-- CENTER: Thread + composer -->
        <section class="panel panel-center" aria-label="Conversation thread">
          <div class="thread-top">
            @if (selectedConversation(); as sc) {
              <div class="thread-title">
                <div class="t-main">{{ sc.title }}</div>
                <div class="t-sub">
                  <span class="pill pill-primary">{{ channelLabel(sc.channel) }}</span>
                  @if (sc.tags?.length) {
                    @for (t of sc.tags; track t) {
                      <span class="pill">{{ t }}</span>
                    }
                  }
                </div>
              </div>

              <div class="thread-actions" aria-label="Thread actions">
                <button class="btn" type="button" aria-label="Assign (placeholder)" title="Assign (placeholder)">
                  Assign
                </button>
                <button class="btn btn-secondary" type="button" aria-label="Resolve (placeholder)" title="Resolve (placeholder)">
                  Resolve
                </button>
              </div>
            } @else {
              <div class="thread-title">
                <div class="t-main">No conversation selected</div>
                <div class="t-sub">Pick a conversation from the left.</div>
              </div>
            }
          </div>

          <div class="thread" #threadScroller role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions text">
            @if (!selectedConversation()) {
              <div class="thread-empty">Select a conversation to view messages.</div>
            } @else {
              @for (m of messages(); track m.id) {
                <article class="msg" [class.in]="m.direction === 'inbound'" [class.out]="m.direction === 'outbound'" [class.sys]="m.direction === 'system'">
                  <div class="msg-bubble">
                    <div class="msg-meta">
                      <span class="msg-author">{{ m.authorName }}</span>
                      <span class="msg-time">{{ m.createdAt | date: 'shortTime' }}</span>
                    </div>
                    <div class="msg-body">{{ m.body }}</div>
                  </div>
                </article>
              }
            }
          </div>

          <form class="composer" (ngSubmit)="onSend()" aria-label="Message composer">
            <label class="sr-only" for="composerText">Message</label>
            <textarea
              id="composerText"
              class="textarea"
              rows="2"
              [disabled]="!selectedConversation()"
              [ngModel]="draft()"
              (ngModelChange)="draft.set($event)"
              name="draft"
              placeholder="Write a reply…"
              (keydown)="onEnterToSend($event)"
              aria-label="Write a reply"
            ></textarea>

            <div class="composer-actions">
              <div class="composer-hint">
                <span class="kbd">Enter</span> send • <span class="kbd">Shift</span>+<span class="kbd">Enter</span> newline
              </div>
              <button class="btn btn-primary" type="submit" [disabled]="!canSend()" aria-label="Send message">
                Send
              </button>
            </div>
          </form>
        </section>

        <!-- RIGHT: Placeholder AI assist / actions -->
        <aside class="panel panel-right" aria-label="Assist & actions">
          <div class="panel-top-right">
            <div class="right-title">Assist</div>
            <div class="right-sub">AI assist, assignment, notes (placeholder)</div>
          </div>

          <div class="right-body">
            <div class="card">
              <div class="card-title">AI Draft</div>
              <div class="card-text">
                Suggested replies and summaries will appear here once real-time + AI hooks are connected.
              </div>
              <button class="btn" type="button" [disabled]="!selectedConversation()" (click)="insertSuggestedReply()">
                Insert suggested reply
              </button>
            </div>

            <div class="card">
              <div class="card-title">Assignment</div>
              <div class="card-text">Assign to a team member (placeholder UI).</div>
              <div class="row">
                <button class="btn" type="button" aria-label="Assign to Support (placeholder)">Support</button>
                <button class="btn btn-secondary" type="button" aria-label="Assign to Sales (placeholder)">Sales</button>
              </div>
            </div>

            <div class="card">
              <div class="card-title">Actions</div>
              <div class="card-text">Quick actions: tag, resolve, escalate (placeholders).</div>
              <div class="row">
                <button class="btn" type="button">Tag</button>
                <button class="btn" type="button">Resolve</button>
                <button class="btn btn-secondary" type="button">Escalate</button>
              </div>
            </div>
          </div>

          <div class="panel-footer">
            <div class="hint">Right panel is a placeholder for upcoming AI + workflow actions.</div>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [
    `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .inbox {
        display: grid;
        gap: 12px;
      }

      .inbox-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 14px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.06) 0%, rgba(255, 255, 255, 1) 55%);
        box-shadow: var(--shadow-sm);
      }

      .hdr-title {
        font-weight: 900;
        letter-spacing: -0.02em;
      }

      .hdr-sub {
        margin-top: 4px;
        font-size: 13px;
        color: var(--muted);
      }

      .hdr-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .btn {
        appearance: none;
        border: 1px solid rgba(37, 99, 235, 0.3);
        background: rgba(37, 99, 235, 0.1);
        color: var(--text);
        font-weight: 700;
        border-radius: 12px;
        padding: 10px 12px;
        cursor: pointer;
        transition: transform 120ms ease, background 160ms ease, border-color 160ms ease;
      }

      .btn:hover {
        background: rgba(37, 99, 235, 0.14);
        border-color: rgba(37, 99, 235, 0.45);
      }

      .btn:active {
        transform: translateY(1px);
      }

      .btn.btn-secondary {
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
      }

      .btn.btn-secondary:hover {
        border-color: rgba(245, 158, 11, 0.55);
        background: rgba(245, 158, 11, 0.16);
      }

      .btn.btn-primary {
        border-color: rgba(37, 99, 235, 0.5);
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(37, 99, 235, 0.1));
      }

      .btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .inbox-grid {
        display: grid;
        grid-template-columns: 360px minmax(0, 1fr) 340px;
        gap: 12px;
        align-items: stretch;
      }

      .panel {
        border: 1px solid var(--border);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        min-height: 520px;
        display: grid;
        grid-template-rows: auto 1fr auto;
      }

      .panel-left .panel-top {
        padding: 10px;
        border-bottom: 1px solid rgba(17, 24, 39, 0.08);
        background: rgba(249, 250, 251, 0.8);
      }

      .input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.95);
      }

      .list {
        padding: 8px;
        overflow: auto;
      }

      .conv {
        width: 100%;
        text-align: left;
        display: grid;
        grid-template-columns: 42px 1fr;
        gap: 10px;
        align-items: center;
        padding: 10px;
        border-radius: 14px;
        border: 1px solid rgba(17, 24, 39, 0.08);
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.04), rgba(255, 255, 255, 1));
        cursor: pointer;
        margin-bottom: 8px;
        transition: border-color 160ms ease, background 160ms ease, transform 120ms ease;
      }

      .conv:hover {
        border-color: rgba(37, 99, 235, 0.25);
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.07), rgba(255, 255, 255, 1));
      }

      .conv.active {
        border-color: rgba(37, 99, 235, 0.45);
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(255, 255, 255, 1));
        box-shadow: var(--shadow-sm);
      }

      .avatar {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-weight: 900;
        color: white;
        background: linear-gradient(135deg, var(--primary), #1d4ed8);
      }

      .conv-meta {
        min-width: 0;
      }

      .conv-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }

      .conv-title {
        font-weight: 900;
        color: var(--text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .conv-time {
        font-size: 12px;
        color: var(--muted);
        flex: none;
      }

      .conv-preview {
        margin-top: 4px;
        font-size: 13px;
        color: var(--muted);
        display: flex;
        gap: 8px;
        min-width: 0;
      }

      .channel {
        font-size: 11px;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.95);
        color: var(--text);
        flex: none;
      }

      .channel[data-channel='instagram'] {
        border-color: rgba(37, 99, 235, 0.25);
        background: rgba(37, 99, 235, 0.08);
      }
      .channel[data-channel='whatsapp'] {
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
      }
      .channel[data-channel='facebook'] {
        border-color: rgba(37, 99, 235, 0.25);
        background: rgba(37, 99, 235, 0.06);
      }

      .preview-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }

      .conv-badges {
        margin-top: 8px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .badge {
        font-size: 11px;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.95);
      }

      .badge-primary {
        border-color: rgba(37, 99, 235, 0.35);
        background: rgba(37, 99, 235, 0.12);
      }

      .panel-footer {
        padding: 10px 12px;
        border-top: 1px solid rgba(17, 24, 39, 0.08);
        background: rgba(249, 250, 251, 0.75);
      }

      .hint {
        font-size: 12px;
        color: var(--muted);
      }

      /* CENTER */
      .panel-center {
        grid-template-rows: auto 1fr auto;
      }

      .thread-top {
        padding: 12px 14px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid rgba(17, 24, 39, 0.08);
        background: rgba(249, 250, 251, 0.75);
      }

      .thread-title {
        min-width: 0;
      }

      .t-main {
        font-weight: 900;
        color: var(--text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .t-sub {
        margin-top: 6px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .pill {
        font-size: 11px;
        font-weight: 800;
        padding: 5px 9px;
        border-radius: 999px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.95);
      }

      .pill-primary {
        border-color: rgba(37, 99, 235, 0.35);
        background: rgba(37, 99, 235, 0.12);
      }

      .thread-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        flex: none;
      }

      .thread {
        padding: 14px;
        overflow: auto;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.03), rgba(245, 158, 11, 0.03));
      }

      .thread-empty {
        height: 100%;
        display: grid;
        place-items: center;
        color: var(--muted);
        font-weight: 800;
      }

      .msg {
        display: flex;
        margin-bottom: 10px;
      }

      .msg.in {
        justify-content: flex-start;
      }

      .msg.out {
        justify-content: flex-end;
      }

      .msg.sys {
        justify-content: center;
      }

      .msg-bubble {
        max-width: 78%;
        border-radius: 16px;
        border: 1px solid rgba(17, 24, 39, 0.10);
        box-shadow: var(--shadow-sm);
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.96);
      }

      .msg.out .msg-bubble {
        border-color: rgba(37, 99, 235, 0.22);
        background: rgba(37, 99, 235, 0.10);
      }

      .msg.sys .msg-bubble {
        border-style: dashed;
        background: rgba(255, 255, 255, 0.85);
      }

      .msg-meta {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: var(--muted);
        font-size: 12px;
        margin-bottom: 6px;
      }

      .msg-author {
        font-weight: 800;
        color: rgba(17, 24, 39, 0.82);
      }

      .msg-body {
        white-space: pre-wrap;
        line-height: 1.45;
        color: var(--text);
      }

      .composer {
        padding: 12px;
        border-top: 1px solid rgba(17, 24, 39, 0.08);
        background: rgba(255, 255, 255, 0.98);
        display: grid;
        gap: 10px;
      }

      .textarea {
        width: 100%;
        resize: vertical;
        min-height: 44px;
        max-height: 180px;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.98);
      }

      .composer-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .composer-hint {
        font-size: 12px;
        color: var(--muted);
      }

      .kbd {
        font-size: 11px;
        font-weight: 900;
        border: 1px solid rgba(17, 24, 39, 0.12);
        border-bottom-width: 2px;
        padding: 2px 6px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.95);
      }

      /* RIGHT */
      .panel-right .panel-top-right {
        padding: 12px 14px;
        border-bottom: 1px solid rgba(17, 24, 39, 0.08);
        background: rgba(249, 250, 251, 0.75);
      }

      .right-title {
        font-weight: 900;
      }

      .right-sub {
        margin-top: 4px;
        font-size: 13px;
        color: var(--muted);
      }

      .right-body {
        padding: 12px;
        display: grid;
        gap: 12px;
        overflow: auto;
      }

      .card {
        border: 1px solid rgba(17, 24, 39, 0.10);
        border-radius: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: var(--shadow-sm);
      }

      .card-title {
        font-weight: 900;
      }

      .card-text {
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .row {
        margin-top: 10px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      @media (max-width: 1200px) {
        .inbox-grid {
          grid-template-columns: 340px minmax(0, 1fr);
        }
        .panel-right {
          display: none;
        }
      }

      @media (max-width: 920px) {
        .inbox-grid {
          grid-template-columns: 1fr;
        }
        .panel {
          min-height: 420px;
        }
      }
    `,
  ],
})
export class ChatPage implements AfterViewChecked {
  constructor(private readonly inbox: MockInboxService) {}

  @ViewChild('threadScroller') private readonly threadScroller?: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') private readonly searchInput?: ElementRef<HTMLInputElement>;

  private readonly _scrolledToBottomForMsgCount = signal<number>(0);

  readonly query = signal<string>('');

  readonly conversations = computed(() => this.inbox.conversations());
  readonly selectedConversation = computed(() => this.inbox.selectedConversation());
  readonly selectedId = computed(() => this.inbox.selectedConversationId());
  readonly messages = computed(() => this.inbox.messagesForSelected());

  readonly filteredConversations = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.conversations();
    return this.conversations().filter((c) => {
      const hay = `${c.title} ${c.lastMessagePreview} ${c.channel} ${c.assignedTo ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  });

  readonly activeDescId = computed(() => {
    const id = this.selectedId();
    return id ? `conv_${id}` : null;
  });

  ngAfterViewChecked(): void {
    // Keep thread pinned to bottom when new messages arrive
    const msgCount = this.messages().length;
    if (msgCount !== this._scrolledToBottomForMsgCount()) {
      this._scrolledToBottomForMsgCount.set(msgCount);
      queueMicrotask(() => this.scrollThreadToBottom());
    }
  }

  // PUBLIC_INTERFACE
  focusSearch(): void {
    this.searchInput?.nativeElement?.focus();
  }

  // PUBLIC_INTERFACE
  select(c: InboxConversation): void {
    this.inbox.selectConversation(c.id);
    queueMicrotask(() => this.scrollThreadToBottom());
  }

  // PUBLIC_INTERFACE
  onSend(): void {
    if (!this.canSend()) return;
    const text = this.draft().trim();
    this.inbox.sendMessage(text);
    this.draft.set('');
  }

  draft = signal<string>('');

  canSend = computed(() => {
    return Boolean(this.selectedConversation()) && this.draft().trim().length > 0;
  });

  // PUBLIC_INTERFACE
  onEnterToSend(ev: Event): void {
    /**
     * Send on Enter; allow newline on Shift+Enter.
     * Template events are typed as Event in strict mode, so we defensively narrow.
     */
    if (!(ev instanceof KeyboardEvent)) return;
    if (ev.key !== 'Enter') return;
    if (ev.shiftKey) return;

    ev.preventDefault();
    this.onSend();
  }

  // PUBLIC_INTERFACE
  insertSuggestedReply(): void {
    if (!this.selectedConversation()) return;
    const suggestion =
      'Thanks for reaching out! Here’s our pricing and onboarding overview (placeholder). Would you like a quick demo link?';
    this.draft.set((this.draft() ? `${this.draft().trimEnd()}\n\n` : '') + suggestion);
  }

  // PUBLIC_INTERFACE
  channelLabel(ch: InboxConversation['channel']): string {
    switch (ch) {
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'threads':
        return 'Threads';
      case 'whatsapp':
        return 'WhatsApp';
      case 'webchat':
        return 'Webchat';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      default:
        return 'Channel';
    }
  }

  // PUBLIC_INTERFACE
  avatarText(c: InboxConversation): string {
    const p = c.participants?.[0];
    const initials = p?.avatarInitials?.trim();
    if (initials) return initials.slice(0, 2).toUpperCase();

    const name = (p?.displayName ?? c.title).trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '?';
    const b = parts.length > 1 ? parts[1]?.[0] : '';
    return `${a}${b}`.toUpperCase();
  }

  private scrollThreadToBottom(): void {
    const el = this.threadScroller?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent): void {
    // Accessible keyboard navigation: when focus is within inbox page,
    // allow Up/Down to cycle conversations, Enter to select.
    // Do not steal keys from textarea/input.
    const target = ev.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'textarea' || tag === 'input' || target?.isContentEditable) return;

    if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp' && ev.key !== 'Enter') return;

    const list = this.filteredConversations();
    if (list.length === 0) return;

    const currentId = this.selectedId();
    const currentIndex = Math.max(
      0,
      currentId ? list.findIndex((c) => c.id === currentId) : 0,
    );

    if (ev.key === 'Enter') {
      this.select(list[currentIndex]);
      return;
    }

    ev.preventDefault();
    const delta = ev.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = Math.min(list.length - 1, Math.max(0, currentIndex + delta));
    this.inbox.selectConversation(list[nextIndex].id);
  }
}

export type _ChatPageExports = InboxMessage;
