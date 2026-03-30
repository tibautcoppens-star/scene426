export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  scriptedResponses: string[];
  autoMode: boolean;
  currentResponseIndex: number;
}
