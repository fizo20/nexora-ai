// frontend/components/ai/ConversationSidebar.tsx
"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { PenLine, Trash2, Plus } from "lucide-react";

type Conversation = {
  _id: string;
  title?: string;
};

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  refresh: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  refresh,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const handleRename = async (id: string) => {
    try {
      await apiClient(`/api/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      setEditingId(null);
      refresh();
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await apiClient(`/api/conversations/${id}`, { method: "DELETE" });
      refresh();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="w-60 border-r bg-background flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-px p-2 overflow-y-auto flex-1">
        {conversations.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-6 px-3">
            No conversations yet
          </p>
        )}

        {conversations.map((conv) => (
          <div
            key={conv._id}
            className={`group flex justify-between items-center px-3 py-[7px] rounded-md text-[13px] cursor-pointer transition-colors ${
              activeId === conv._id
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            {editingId === conv._id ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleRename(conv._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(conv._id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="bg-transparent text-foreground text-[13px] w-full outline-none border-b border-border"
                placeholder="Rename…"
              />
            ) : (
              <span
                onClick={() => onSelect(conv._id)}
                className="flex-1 truncate"
              >
                {conv.title?.trim() || "New Conversation"}
              </span>
            )}

            <div className="hidden group-hover:flex items-center gap-1 ml-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(conv._id);
                  setTitle(conv.title || "");
                }}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <PenLine size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(conv._id);
                }}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
