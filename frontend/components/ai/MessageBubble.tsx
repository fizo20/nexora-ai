// frontend/components/ai/MessageBubble.tsx
"use client";

import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  tool?: {
    name: string;
    status: string;
  };
};

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="space-y-2 max-w-[78%]">
        {/* Role label */}
        <div className={`text-[11px] font-medium text-muted-foreground mb-1 ${isUser ? "text-right" : "text-left"}`}>
          {isUser ? "You" : "Nexora AI"}
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card border text-foreground rounded-tl-sm"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-[12px] font-mono text-foreground">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted border rounded-lg p-3 mt-2 mb-2 overflow-x-auto text-[12px] font-mono">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Tool result */}
        {message.tool && (
          <div className="bg-card border rounded-lg px-3 py-2 text-[12px]">
            <span className="text-muted-foreground">Tool: </span>
            <span className="font-medium text-foreground">{message.tool.name}</span>
            <span className="mx-1.5 text-border">·</span>
            <span
              className={
                message.tool.status === "success"
                  ? "text-success"
                  : "text-destructive"
              }
            >
              {message.tool.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
