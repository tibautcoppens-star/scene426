import { useEffect } from 'react';
import { useMessenger } from '@/hooks/useMessenger';
import ConversationSidebar from '@/components/messenger/ConversationSidebar';
import ChatArea from '@/components/messenger/ChatArea';
import ControlPanel from '@/components/messenger/ControlPanel';

const Index = () => {
  const {
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
  } = useMessenger();

  // Spacebar trigger for manual mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && active && !active.autoMode) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        triggerResponse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, triggerResponse]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />
      <ChatArea conversation={active} onSend={sendMessage} />
      <ControlPanel conversation={active} onUpdate={updateConversation} onTrigger={triggerResponse} />
    </div>
  );
};

export default Index;
