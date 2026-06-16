// frontend/components/ai/ChatContainer.tsx
"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
  tools?: {
    name: string;
    status: string;
  }[];
};

interface Props {
  messages: Message[];
  loading: boolean;
}

export default function ChatContainer({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto space-y-1 bg-background p-4 rounded-lg border">
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
          <p className="text-muted-foreground text-[13px]">
            Ask anything — your AI assistant is ready
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <div key={i}>
          <MessageBubble message={msg} />

          {/* Tool calls */}
          {msg.tools?.map((tool, index) => (
            <div
              key={index}
              className="text-[12px] text-muted-foreground mt-1 ml-2 flex items-center gap-2"
            >
              <span className="text-primary">⚙</span>
              <span className="font-medium text-foreground">{tool.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                  tool.status === "running"
                    ? "bg-warning/10 text-warning"
                    : tool.status === "success"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {tool.status}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {loading && (
        <div className="flex items-center gap-1.5 px-4 py-3">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
