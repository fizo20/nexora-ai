// frontend/components/ai/ChatInput.tsx
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: Props) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative mt-3">
      <Textarea
        placeholder="Message Nexora AI…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={1}
        className="resize-none pr-12 py-3 text-[14px] leading-relaxed min-h-[44px] max-h-[200px]"
      />
      <button
        onClick={handleSend}
        disabled={loading || !input.trim()}
        className="absolute right-2.5 bottom-2.5 p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <ArrowUp size={14} />
      </button>
      <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
