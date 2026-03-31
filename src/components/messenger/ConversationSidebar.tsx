import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '@/types/messenger';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function ConversationSidebar({ conversations, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <div className="w-56 flex flex-col border-r border-border bg-sidebar h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <button onClick={onCreate} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1 rounded-none border-solid">
        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">No conversations</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              c.id === activeId ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <span className="truncate">{c.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
