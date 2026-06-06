export type Conversation = {
  id: string;
  recipientName: string;
  recipientInitials: string;
  lastMessage: string;
  sentAt: string;
  sentAtLabel: string;
  area?: string;
  status?: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderName: string;
  recipientName: string;
  type: string;
  text: string;
  sentAt: string;
  sentAtLabel: string;
  readAt: string | null;
  status: string;
};
