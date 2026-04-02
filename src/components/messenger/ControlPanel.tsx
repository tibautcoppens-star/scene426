import { useState } from 'react';
import { Plus, Play, Trash2, ChevronRight, ChevronLeft, Pencil, Check, Sparkles } from 'lucide-react';
import { Conversation } from '@/types/messenger';

interface Props {
  conversation: Conversation | null;
  onUpdate: (id: string, patch: Partial<Conversation>) => void;
  onTrigger: () => void;
  onTriggerMessage: () => void;
}

export default function ControlPanel({ conversation, onUpdate, onTrigger, onTriggerMessage }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (collapsed) {
    return (
      <div className="flex items-start pt-3">
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  const startEditName = () => {
    if (!conversation) return;
    setNameInput(conversation.name);
    setEditingName(true);
  };

  const saveName = () => {
    if (!conversation) return;
    onUpdate(conversation.id, { name: nameInput.trim() || conversation.name });
    setEditingName(false);
  };

  const updateResponse = (index: number, value: string) => {
    if (!conversation) return;
    const updated = [...conversation.scriptedResponses];
    updated[index] = value;
    onUpdate(conversation.id, { scriptedResponses: updated });
  };

  const addResponse = () => {
    if (!conversation) return;
    onUpdate(conversation.id, { scriptedResponses: [...conversation.scriptedResponses, ''] });
  };

  const removeResponse = (index: number) => {
    if (!conversation) return;
    const updated = conversation.scriptedResponses.filter((_, i) => i !== index);
    onUpdate(conversation.id, {
      scriptedResponses: updated.length ? updated : [''],
      currentResponseIndex: 0,
    });
  };

  const toggleAuto = () => {
    if (!conversation) return;
    onUpdate(conversation.id, { autoMode: !conversation.autoMode });
  };

  const validCount = conversation?.scriptedResponses.filter((r) => r.trim()).length ?? 0;
  const currentIdx = conversation ? (conversation.currentResponseIndex % Math.max(validCount, 1)) + 1 : 0;
  const validMsgCount = conversation?.scriptedMessages.filter((m) => m.trim()).length ?? 0;
  const currentMsgIdx = conversation ? (conversation.currentMessageIndex % Math.max(validMsgCount, 1)) + 1 : 0;

  return (
    <div className="w-72 border-l border-border bg-panel flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Control Panel</h3>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-secondary rounded transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {!conversation ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground text-center">Select or create a conversation</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
          {/* Name editing */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Chat Name</label>
            {editingName ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="flex-1 bg-input text-sm text-foreground px-2 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <button onClick={saveName} className="p-1.5 text-primary hover:bg-primary/20 rounded transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1 group">
                <span className="text-sm text-foreground truncate">{conversation.name}</span>
                <button onClick={startEditName} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Auto mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Auto mode</span>
            </div>
            <button
              onClick={toggleAuto}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                conversation.autoMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${
                  conversation.autoMode ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {!conversation.autoMode && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Manual trigger (Space)</p>
              <button
                onClick={onTrigger}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Trigger response ({currentIdx}/{validCount})
              </button>
            </div>
          )}

          {/* Trigger scripted message */}
          {validMsgCount > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Trigger user message</p>
              <button
                onClick={onTriggerMessage}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Send message ({currentMsgIdx}/{validMsgCount})
              </button>
            </div>
          )}

          {/* Scripted responses */}
          <div className="bg-primary/20 rounded-lg p-3">
            <label className="text-xs text-primary-foreground/70 uppercase tracking-wider">Scripted responses</label>
            <div className="mt-2 space-y-2">
              {conversation.scriptedResponses.map((resp, i) => (
                <div key={i} className="relative">
                  <textarea
                    value={resp}
                    onChange={(e) => updateResponse(i, e.target.value)}
                    placeholder="New response..."
                    className="w-full bg-primary/30 text-sm text-foreground px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-ring resize-none min-h-[60px] placeholder:text-muted-foreground"
                    rows={2}
                  />
                  <div className="flex items-center justify-between mt-0.5 px-1">
                    <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                    {conversation.scriptedResponses.length > 1 && (
                      <button
                        onClick={() => removeResponse(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addResponse}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/30 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
