import { useState, useCallback } from 'react';
import { Conversation, Message } from '@/types/messenger';

const createId = () => Math.random().toString(36).slice(2, 10);

const defaultConversation = (): Conversation => ({
  id: createId(),
  name: 'DE TOEKOMST ZIJN WIJ',
  messages: [],
  scriptedResponses: [''],
  autoMode: true,
  currentResponseIndex: 0,
});

export function useMessenger() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback(() => {
    const c = defaultConversation();
    setConversations((prev) => [...prev, c]);
    setActiveId(c.id);
  }, []);

  const updateConversation = useCallback(
    (id: string, patch: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!active) return;
      const userMsg: Message = {
        id: createId(),
        conversationId: active.id,
        content,
        sender: 'user',
        timestamp: new Date(),
      };

      let updatedConv = {
        ...active,
        messages: [...active.messages, userMsg],
      };

      // Auto respond if enabled and there are scripted responses
      if (updatedConv.autoMode) {
        const validResponses = updatedConv.scriptedResponses.filter((r) => r.trim());
        if (validResponses.length > 0) {
          const idx = updatedConv.currentResponseIndex % validResponses.length;
          const botMsg: Message = {
            id: createId(),
            conversationId: active.id,
            content: validResponses[idx],
            sender: 'bot',
            timestamp: new Date(),
          };
          updatedConv = {
            ...updatedConv,
            messages: [...updatedConv.messages, botMsg],
            currentResponseIndex: idx + 1,
          };
        }
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? updatedConv : c))
      );
    },
    [active]
  );

  const triggerResponse = useCallback(() => {
    if (!active) return;
    const validResponses = active.scriptedResponses.filter((r) => r.trim());
    if (validResponses.length === 0) return;
    const idx = active.currentResponseIndex % validResponses.length;
    const botMsg: Message = {
      id: createId(),
      conversationId: active.id,
      content: validResponses[idx],
      sender: 'bot',
      timestamp: new Date(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              messages: [...c.messages, botMsg],
              currentResponseIndex: idx + 1,
            }
          : c
      )
    );
  }, [active]);

  return {
    conversations,
    active,
    activeId,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
    sendMessage,
    triggerResponse,
  };
}
