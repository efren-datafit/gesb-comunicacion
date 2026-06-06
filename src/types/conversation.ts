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
