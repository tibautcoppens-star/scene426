import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Conversation } from '@/types/messenger';

interface Props {
  conversation: Conversation | null;
  onSend: (content: string) => void;
  isTyping?: boolean;
}

export default function ChatArea({ conversation, onSend, isTyping }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-2xl font-light text-muted-foreground">How can I help you today?</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        <h2 className="text-sm font-medium text-foreground">{conversation.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3">
        {conversation.messages.length === 0 && (
          <p className="text-center text-muted-foreground text-lg mt-32">How can I help you today?</p>
        )}
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-secondary text-secondary-foreground rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border">
        <div className="flex items-center gap-2 bg-input rounded-full px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Insert message"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={handleSend} className="p-1.5 rounded-full hover:bg-primary/20 transition-colors text-primary">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
