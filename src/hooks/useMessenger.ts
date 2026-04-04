import { useState, useCallback, useRef, useEffect } from 'react';
import { Conversation, Message } from '@/types/messenger';

const STORAGE_KEY = 'messenger-conversations';
const ACTIVE_KEY = 'messenger-active-id';

const createId = () => Math.random().toString(36).slice(2, 10);

const defaultConversations: Conversation[] = [
  {
    id: '1',
    name: 'DE TOEKOMST ZIJN WIJ\n ',
    messages: [
      { id: 'u1', conversationId: '1', content: 'Heb je al meer nieuws?', sender: 'user', timestamp: new Date() },
      { id: 'b1', conversationId: '1', content: 'Ja net antwoord gekregen.', sender: 'bot', timestamp: new Date() },
      { id: 'u2', conversationId: '1', content: 'Ik sta te popelen om mijn steentje bij te dragen.', sender: 'user', timestamp: new Date() },
      { id: 'b2', conversationId: '1', content: 'Ik snap dat je bij onze groep wil, maar het is niet zo eenvoudig.', sender: 'bot', timestamp: new Date() },
      { id: 'u3', conversationId: '1', content: 'De wereld staat in brand en niemand doet iets. Ik wil iets doen, maar niemand neemt mij serieus. Zelfs jij niet!', sender: 'user', timestamp: new Date() },
      { id: 'b3', conversationId: '1', content: 'Ik neem je wel serieus, ik weet wat je al gedaan hebt. Je moet gewoon nog even geduld hebben. Jouw moment komt nog...', sender: 'bot', timestamp: new Date() },
    ],
    scriptedResponses: [
      'Ja net antwoord gekregen.',
      'Ik snap dat je bij onze groep wil, maar het is niet zo eenvoudig.',
      'Ik neem je wel serieus, ik weet wat je al gedaan hebt. Je moet gewoon nog even geduld hebben. Jouw moment komt nog...',
    ],
    scriptedMessages: [
      'Heb je al meer nieuws?',
      'Ik sta te popelen om mijn steentje bij te dragen.',
      'De wereld staat in brand en niemand doet iets. Ik wil iets doen, maar niemand neemt mij serieus. Zelfs jij niet!',
    ],
    autoMode: true,
    currentResponseIndex: 0,
    currentMessageIndex: 0,
  },
  {
    id: '2',
    name: 'DE TOEKOMST ZIJN WIJ',
    messages: [],
    scriptedResponses: [''],
    scriptedMessages: [''],
    autoMode: true,
    currentResponseIndex: 0,
    currentMessageIndex: 0,
  },
];

const defaultConversation = (): Conversation => ({
  id: createId(),
  name: 'DE TOEKOMST ZIJN WIJ',
  messages: [],
  scriptedResponses: [''],
  scriptedMessages: [''],
  autoMode: true,
  currentResponseIndex: 0,
  currentMessageIndex: 0,
});

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((c: any) => ({
        ...c,
        messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        scriptedMessages: c.scriptedMessages ?? [''],
        currentMessageIndex: c.currentMessageIndex ?? 0,
        scriptedResponses: c.scriptedResponses ?? [''],
        currentResponseIndex: c.currentResponseIndex ?? 0,
        autoMode: c.autoMode ?? true,
      }));
    }
  } catch {}
  return defaultConversations;
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY) || '1';
}

export function useMessenger() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(loadActiveId);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

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

      const withUserMsg = {
        ...active,
        messages: [...active.messages, userMsg],
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? withUserMsg : c))
      );

      // Auto respond with typing delay
      if (active.autoMode) {
        const validResponses = active.scriptedResponses.filter((r) => r.trim());
        if (validResponses.length > 0) {
          const idx = active.currentResponseIndex % validResponses.length;
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
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
            setIsTyping(false);
          }, 1200);
        }
      }
    },
    [active]
  );

  const triggerResponse = useCallback(() => {
    if (!active) return;
    const validResponses = active.scriptedResponses.filter((r) => r.trim());
    if (validResponses.length === 0) return;
    const idx = active.currentResponseIndex % validResponses.length;
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
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
      setIsTyping(false);
    }, 1200);
  }, [active]);

  const triggerMessage = useCallback(() => {
    if (!active) return;
    const validMessages = active.scriptedMessages.filter((m) => m.trim());
    if (validMessages.length === 0) return;
    const idx = active.currentMessageIndex % validMessages.length;
    const content = validMessages[idx];

    const userMsg: Message = {
      id: createId(),
      conversationId: active.id,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              currentMessageIndex: idx + 1,
            }
          : c
      )
    );

    // Auto-trigger bot response after user message
    if (active.autoMode) {
      const validResponses = active.scriptedResponses.filter((r) => r.trim());
      if (validResponses.length > 0) {
        const rIdx = active.currentResponseIndex % validResponses.length;
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          const botMsg: Message = {
            id: createId(),
            conversationId: active.id,
            content: validResponses[rIdx],
            sender: 'bot',
            timestamp: new Date(),
          };
          setConversations((prev) =>
            prev.map((c) =>
              c.id === active.id
                ? {
                    ...c,
                    messages: [...c.messages, botMsg],
                    currentResponseIndex: rIdx + 1,
                  }
                : c
            )
          );
          setIsTyping(false);
        }, 1200);
      }
    }
  }, [active]);

  return {
    conversations,
    active,
    activeId,
    isTyping,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
    sendMessage,
    triggerResponse,
    triggerMessage,
  };
}
