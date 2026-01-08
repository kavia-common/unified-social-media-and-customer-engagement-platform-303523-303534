import { Injectable, computed, signal } from '@angular/core';
import { InboxConversation, InboxMessage } from './inbox.models';

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/**
 * Mock inbox data store.
 * This will be swapped with real API clients later, but keeps a stable UI surface.
 */
@Injectable({ providedIn: 'root' })
export class MockInboxService {
  private readonly _conversations = signal<InboxConversation[]>([
    {
      id: 'c_1',
      channel: 'instagram',
      title: 'Maya R. • IG DM',
      participants: [{ id: 'p_1', displayName: 'Maya R.', avatarInitials: 'MR' }],
      unreadCount: 2,
      lastMessagePreview: 'Can you share pricing and onboarding steps?',
      lastMessageAt: minutesAgoIso(8),
      assignedTo: 'Unassigned',
      isAiAssisted: true,
      tags: ['Lead'],
    },
    {
      id: 'c_2',
      channel: 'whatsapp',
      title: 'Khalid • WhatsApp',
      participants: [{ id: 'p_2', displayName: 'Khalid', avatarInitials: 'K' }],
      unreadCount: 0,
      lastMessagePreview: 'Thanks, that worked.',
      lastMessageAt: minutesAgoIso(42),
      assignedTo: 'Support',
      isAiAssisted: false,
      tags: ['Resolved'],
    },
    {
      id: 'c_3',
      channel: 'facebook',
      title: 'Page Inbox • FB',
      participants: [{ id: 'p_3', displayName: 'Jenny L.', avatarInitials: 'JL' }],
      unreadCount: 1,
      lastMessagePreview: 'Is this available in blue?',
      lastMessageAt: minutesAgoIso(120),
      assignedTo: 'Sales',
      isAiAssisted: true,
      tags: ['Product'],
    },
  ]);

  private readonly _messages = signal<InboxMessage[]>([
    {
      id: 'm_1',
      conversationId: 'c_1',
      direction: 'inbound',
      authorName: 'Maya R.',
      body: 'Hi! I’m interested in your service. Can you share pricing and onboarding steps?',
      createdAt: minutesAgoIso(12),
      channel: 'instagram',
    },
    {
      id: 'm_2',
      conversationId: 'c_1',
      direction: 'system',
      authorName: 'System',
      body: 'AI Assist suggestion available. (Placeholder)',
      createdAt: minutesAgoIso(11),
      channel: 'instagram',
    },
    {
      id: 'm_3',
      conversationId: 'c_1',
      direction: 'inbound',
      authorName: 'Maya R.',
      body: 'Also, do you support WhatsApp too?',
      createdAt: minutesAgoIso(8),
      channel: 'instagram',
    },
    {
      id: 'm_4',
      conversationId: 'c_2',
      direction: 'inbound',
      authorName: 'Khalid',
      body: 'I can’t log into my account—keeps saying expired.',
      createdAt: minutesAgoIso(60),
      channel: 'whatsapp',
    },
    {
      id: 'm_5',
      conversationId: 'c_2',
      direction: 'outbound',
      authorName: 'Support',
      body: 'Please try resetting your password using the “Forgot password” link. Let me know if it persists.',
      createdAt: minutesAgoIso(50),
      channel: 'whatsapp',
    },
    {
      id: 'm_6',
      conversationId: 'c_2',
      direction: 'inbound',
      authorName: 'Khalid',
      body: 'Thanks, that worked.',
      createdAt: minutesAgoIso(42),
      channel: 'whatsapp',
    },
    {
      id: 'm_7',
      conversationId: 'c_3',
      direction: 'inbound',
      authorName: 'Jenny L.',
      body: 'Is this available in blue?',
      createdAt: minutesAgoIso(120),
      channel: 'facebook',
    },
  ]);

  private readonly _selectedConversationId = signal<string | null>(this._conversations()[0]?.id ?? null);

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

  // PUBLIC_INTERFACE
  selectConversation(id: string): void {
    this._selectedConversationId.set(id);
    // Mark as read in mock store
    this._conversations.update((arr) => arr.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  }

  // PUBLIC_INTERFACE
  sendMessage(body: string): void {
    const conversation = this.selectedConversation();
    if (!conversation) return;

    const trimmed = body.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();

    const outbound: InboxMessage = {
      id: uid('m'),
      conversationId: conversation.id,
      direction: 'outbound',
      authorName: 'You',
      body: trimmed,
      createdAt: now,
      channel: conversation.channel,
    };

    this._messages.update((arr) => [...arr, outbound]);
    this._conversations.update((arr) =>
      arr.map((c) =>
        c.id === conversation.id
          ? {
              ...c,
              lastMessageAt: now,
              lastMessagePreview: trimmed.slice(0, 80),
            }
          : c,
      ),
    );
  }
}
