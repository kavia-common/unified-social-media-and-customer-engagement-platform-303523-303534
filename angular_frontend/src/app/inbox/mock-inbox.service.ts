import { Injectable, computed, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { ApiService } from '../api/api.service';
import { AuthTokenService } from '../api/auth-token.service';
import { TenantContextService } from '../api/tenant-context.service';
import { InboxConversation, InboxMessage } from './inbox.models';

type ConversationDto = {
  id: string;
  tenantId: string;
  channelId: string;
  subject?: string | null;
  status: string;
  participantExternalId?: string | null;
  lastMessageAtUtc?: string | null;
  assignedToUserId?: string | null;
  resolvedAtUtc?: string | null;
  version: number;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type MessageDto = {
  id: string;
  tenantId: string;
  conversationId: string;
  channelId: string;
  direction: string;
  senderUserId?: string | null;
  senderExternalId?: string | null;
  content: string;
  contentType: string;
  sentAtUtc: string;
  version: number;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type ConversationEventDto = {
  id: string;
  tenantId: string;
  channelId: string;
  subject?: string | null;
  status?: string | null;
  participantExternalId?: string | null;
  lastMessageAtUtc?: string | null;
  assignedToUserId?: string | null;
  resolvedAtUtc?: string | null;
  version: number;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type MessageEventDto = {
  id: string;
  tenantId: string;
  conversationId: string;
  channelId: string;
  direction: string;
  senderUserId?: string | null;
  senderExternalId?: string | null;
  content: string;
  contentType: string;
  sentAtUtc: string;
  version: number;
  createdAtUtc: string;
  updatedAtUtc: string;
};

function isoOrNow(v?: string | null): string {
  return v && v.trim() ? new Date(v).toISOString() : new Date().toISOString();
}

function safeTrim(v?: string | null): string {
  return (v ?? '').trim();
}

/**
 * Inbox data store (live):
 * - Loads conversations/messages from REST API
 * - Keeps UI updated via SignalR (/hubs/inbox)
 *
 * NOTE: file name kept as mock-inbox.service.ts to preserve existing imports.
 */
@Injectable({ providedIn: 'root' })
export class MockInboxService {
  private readonly _conversations = signal<InboxConversation[]>([]);
  private readonly _messages = signal<InboxMessage[]>([]);
  private readonly _selectedConversationId = signal<string | null>(null);

  private hub: HubConnection | null = null;
  private joinedConversationId: string | null = null;

  /** Sorted list (most recent first). */
  readonly conversations = computed(() => {
    return [...this._conversations()].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  });

  readonly selectedConversationId = computed(() => this._selectedConversationId());

  readonly selectedConversation = computed(() => {
    const id = this._selectedConversationId();
    if (!id) return null;
    return this._conversations().find((c) => c.id === id) ?? null;
  });

  readonly messagesForSelected = computed(() => {
    const id = this._selectedConversationId();
    if (!id) return [];
    return this._messages()
      .filter((m) => m.conversationId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  constructor(
    private readonly api: ApiService,
    private readonly tokens: AuthTokenService,
    private readonly tenant: TenantContextService,
  ) {}

  // PUBLIC_INTERFACE
  async ensureLiveConnected(): Promise<void> {
    /**
     * Ensures:
     * - REST has loaded at least the conversation list
     * - SignalR is connected and listening for updates
     */
    if (this._conversations().length === 0) {
      this.refreshConversations();
    }

    await this.ensureHubConnected();
    // If a conversation is already selected, ensure group membership
    const id = this._selectedConversationId();
    if (id) {
      await this.joinConversationGroup(id);
    }
  }

  // PUBLIC_INTERFACE
  refreshConversations(): void {
    /** Loads conversation list from GET /api/conversations. */
    this.api.get<ConversationDto[]>('/api/conversations', { skip: 0, take: 100 }).subscribe({
      next: (items) => {
        const mapped = (items ?? []).map((c) => this.mapConversation(c));
        this._conversations.set(mapped);

        // select first if none selected
        if (!this._selectedConversationId() && mapped.length > 0) {
          this._selectedConversationId.set(mapped[0].id);
          this.refreshMessagesForSelected();
          void this.joinConversationGroup(mapped[0].id);
        }
      },
      error: () => {
        // keep existing state; global error interceptor logs/normalizes
      },
    });
  }

  // PUBLIC_INTERFACE
  refreshMessagesForSelected(): void {
    /** Loads message list for selected conversation from GET /api/conversations/{id}/messages. */
    const conversationId = this._selectedConversationId();
    if (!conversationId) return;

    this.api.get<MessageDto[]>(`/api/conversations/${conversationId}/messages`, { skip: 0, take: 200 }).subscribe({
      next: (items) => {
        const conversation = this.selectedConversation();
        const channel = conversation?.channel ?? 'webchat';
        this._messages.set((items ?? []).map((m) => this.mapMessage(m, channel)));
      },
      error: () => {},
    });
  }

  // PUBLIC_INTERFACE
  selectConversation(id: string): void {
    /** Select conversation, mark as read locally, load messages, and join hub group for message updates. */
    this._selectedConversationId.set(id);

    // Mark as read locally (backend unread not implemented yet)
    this._conversations.update((arr) => arr.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));

    this.refreshMessagesForSelected();
    void this.joinConversationGroup(id);
  }

  // PUBLIC_INTERFACE
  sendMessage(body: string): void {
    /** Sends outbound message via POST /api/conversations/{id}/messages/send. */
    const conversation = this.selectedConversation();
    if (!conversation) return;

    const trimmed = body.trim();
    if (!trimmed) return;

    this.api
      .post<MessageDto, { content: string; contentType?: string }>(`/api/conversations/${conversation.id}/messages/send`, {
        content: trimmed,
        contentType: 'text',
      })
      .subscribe({
        next: (created) => {
          // Optimistically add immediately; SignalR will also deliver messageCreated.
          const msg = this.mapMessage(created, conversation.channel);
          this.upsertMessage(msg);

          const now = msg.createdAt;
          this._conversations.update((arr) =>
            arr.map((c) =>
              c.id === conversation.id
                ? {
                    ...c,
                    lastMessageAt: now,
                    lastMessagePreview: msg.body.slice(0, 80),
                  }
                : c,
            ),
          );
        },
        error: () => {},
      });
  }

  private mapConversation(c: ConversationDto | ConversationEventDto): InboxConversation {
    // Channel is not yet a first-class concept in backend DTOs (channelId is an entity id),
    // so we default to "webchat" until channel mapping is introduced.
    const title =
      safeTrim((c as any).subject) ||
      (safeTrim((c as any).participantExternalId) ? `Participant ${safeTrim((c as any).participantExternalId)}` : '') ||
      `Conversation ${c.id.slice(0, 6)}`;

    const lastMessageAt = isoOrNow((c as any).lastMessageAtUtc ?? null);

    return {
      id: c.id,
      channel: 'webchat',
      title,
      participants: [
        {
          id: safeTrim((c as any).participantExternalId) || 'participant',
          displayName: safeTrim((c as any).participantExternalId) || 'Participant',
          avatarInitials: 'P',
        },
      ],
      unreadCount: 0,
      lastMessagePreview: '',
      lastMessageAt,
      assignedTo: (c as any).assignedToUserId ?? undefined,
      isAiAssisted: false,
      tags: [],
    };
  }

  private mapMessage(m: MessageDto | MessageEventDto, channel: InboxConversation['channel']): InboxMessage {
    const direction = (m.direction ?? '').toLowerCase();
    const mappedDirection = direction === 'outbound' ? 'outbound' : direction === 'system' ? 'system' : 'inbound';

    // No user directory yet; display simple author strings.
    const authorName =
      mappedDirection === 'outbound'
        ? 'You'
        : safeTrim((m as any).senderExternalId) || safeTrim((m as any).senderUserId) || 'Customer';

    return {
      id: m.id,
      conversationId: (m as any).conversationId,
      direction: mappedDirection,
      authorName,
      body: (m as any).content ?? '',
      createdAt: isoOrNow((m as any).sentAtUtc ?? (m as any).createdAtUtc ?? null),
      channel,
    };
  }

  private upsertConversation(convo: InboxConversation): void {
    this._conversations.update((arr) => {
      const idx = arr.findIndex((c) => c.id === convo.id);
      if (idx < 0) return [...arr, convo];
      const next = [...arr];
      next[idx] = { ...next[idx], ...convo };
      return next;
    });
  }

  private upsertMessage(msg: InboxMessage): void {
    this._messages.update((arr) => {
      if (arr.some((m) => m.id === msg.id)) return arr;
      return [...arr, msg];
    });
  }

  private async ensureHubConnected(): Promise<void> {
    if (this.hub && this.hub.state === HubConnectionState.Connected) return;

    const token = this.tokens.getToken();
    if (!token) return; // guard will typically prevent reaching inbox without auth

    const hubBase = (environment.wsUrl && environment.wsUrl.trim()) ? environment.wsUrl : environment.apiBaseUrl;
    const hubUrl = `${hubBase.replace(/\/+$/, '')}/hubs/inbox`;

    this.hub = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Backend supports `access_token` query string for hub endpoints
        accessTokenFactory: () => this.tokens.getToken() ?? '',
        // Provide tenant context during handshake
        headers: this.tenant.tenantId() ? { 'X-Tenant-Id': this.tenant.tenantId()! } : undefined,
      })
      .withAutomaticReconnect()
      .configureLogging(environment.nodeEnv === 'development' ? LogLevel.Information : LogLevel.Warning)
      .build();

    this.hub.on('conversationCreated', (evt: ConversationEventDto) => {
      this.upsertConversation(this.mapConversation(evt));
    });

    this.hub.on('conversationUpdated', (evt: ConversationEventDto) => {
      this.upsertConversation(this.mapConversation(evt));
    });

    this.hub.on('messageCreated', (evt: MessageEventDto) => {
      const convo = this._conversations().find((c) => c.id === evt.conversationId);
      const channel = convo?.channel ?? 'webchat';
      const msg = this.mapMessage(evt, channel);
      this.upsertMessage(msg);

      // Update conversation preview + ordering fields
      this._conversations.update((arr) =>
        arr.map((c) =>
          c.id === evt.conversationId
            ? {
                ...c,
                lastMessageAt: msg.createdAt,
                lastMessagePreview: msg.body.slice(0, 80),
                unreadCount: c.id === this._selectedConversationId() ? 0 : (c.unreadCount ?? 0) + 1,
              }
            : c,
        ),
      );
    });

    try {
      await this.hub.start();
    } catch {
      // If token expired/missing, connection will fail; keep UI usable with REST polling.
      this.hub = null;
    }
  }

  private async joinConversationGroup(conversationId: string): Promise<void> {
    if (!conversationId) return;
    await this.ensureHubConnected();
    if (!this.hub || this.hub.state !== HubConnectionState.Connected) return;

    // Switch group subscription
    if (this.joinedConversationId && this.joinedConversationId !== conversationId) {
      try {
        await this.hub.invoke('LeaveConversation', this.joinedConversationId);
      } catch {
        // ignore
      }
    }

    if (this.joinedConversationId !== conversationId) {
      try {
        await this.hub.invoke('JoinConversation', conversationId);
        this.joinedConversationId = conversationId;
      } catch {
        // ignore
      }
    }
  }
}
