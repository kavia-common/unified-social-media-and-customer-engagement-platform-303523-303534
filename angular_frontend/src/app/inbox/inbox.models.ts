export type InboxChannel = 'instagram' | 'facebook' | 'threads' | 'whatsapp' | 'webchat' | 'email' | 'sms';

export type InboxMessageDirection = 'inbound' | 'outbound' | 'system';

export interface InboxParticipant {
  id: string;
  displayName: string;
  avatarInitials?: string;
}

export interface InboxConversation {
  id: string;
  channel: InboxChannel;
  title: string;
  participants: InboxParticipant[];
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: string; // ISO string for simple serialization
  assignedTo?: string;
  isAiAssisted?: boolean;
  tags?: string[];
}

export interface InboxMessage {
  id: string;
  conversationId: string;
  direction: InboxMessageDirection;
  authorName: string;
  body: string;
  createdAt: string; // ISO string
  channel: InboxChannel;
}
