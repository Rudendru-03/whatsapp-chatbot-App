interface StoredMessage {
  content: string;
  isSent: boolean;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "received";
  from: string;
  to: string;
  mediaType?: string;
  mediaUrl?: string;
}

class MessageStore {
  private messages: StoredMessage[] = [];

  addMessage(message: StoredMessage) {
    this.messages.push(message);
  }

  getMessages(phone: string) {
    return this.messages.filter((m) => m.from === phone || m.to === phone);
  }
}

export const messageStore = new MessageStore();
