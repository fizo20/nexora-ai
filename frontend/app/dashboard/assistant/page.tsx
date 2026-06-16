// frontend/app/dashboard/assistant/page.tsx
"use client";

import { useEffect, useState } from "react";
import ChatContainer from "@/components/ai/ChatContainer";
import ChatInput from "@/components/ai/ChatInput";
import ConversationSidebar from "@/components/ai/ConversationSidebar";
import { apiClient } from "@/lib/api/client";

type Message = {
  role: "user" | "assistant";
  content: string;
  tools?: {
    name: string;
    status: string;
  }[];
};

type BackendMessage = {
  _id: string;
  role: "user" | "assistant";
  message: string;
  conversationId: string;
  createdAt: string;
};

type Conversation = {
  _id: string;
  title?: string;
};

type SSEEvent =
  | { type: "start" }
  | { type: "thinking"; message?: string }
  | { type: "chunk"; content: string }
  | {
      type: "tool";
      name: string;
      status: string;
      data?: { title?: string; [key: string]: unknown } | null;
    }
  | { type: "reasoning"; content: string }
  | { type: "error"; message?: string }
  | { type: "done"; conversationId?: string };

// const generateTitle = (input: string) => {
//   return input.length > 30 ? input.slice(0, 30) + "..." : input;
// };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // LOAD PROJECT
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await apiClient("/api/projects");
        const projects = res?.data || res;

        if (projects?.length > 0) {
          setProjectId(projects[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    loadProjects();
  }, []);

  // LOAD SAVED CONVERSATION
  useEffect(() => {
    const saved = localStorage.getItem("activeConversationId");
    if (saved) setConversationId(saved);
  }, []);

  // SAVE ACTIVE CONVERSATION
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("activeConversationId", conversationId);
    }
  }, [conversationId]);

  // LOAD CONVERSATIONS
  const fetchConversations = async () => {
    try {
      const res = await apiClient("/api/conversations");
      const convos = res?.data?.data || [];
      setConversations(Array.isArray(convos) ? convos : []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // SEND MESSAGE
  const handleSend = async (input: string) => {
    if (!input.trim() || loading) return;

    let currentProjectId = projectId;

    if (!currentProjectId) {
      try {
        const res = await apiClient("/api/projects", {
          method: "POST",
          body: JSON.stringify({ name: "My First Project" }),
        });

        currentProjectId = res?._id || res?.data?._id;
        setProjectId(currentProjectId);
      } catch {
        alert("Failed to create project");
        return;
      }
    }

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        alert("You are not logged in.");
        return;
      }

      const response = await fetch("http://localhost:4000/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          projectId: currentProjectId,
          conversationId,
          messages: updatedMessages,
        }),
      });

      // If the server returned an error BEFORE SSE headers were sent
      // (e.g. 401/400/404/500 as plain JSON), handle it directly —
      // it is NOT an SSE stream and must not be parsed as one.
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("text/event-stream")) {
        let errorMessage = "Something went wrong. Please try again.";

        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.error || errorMessage;
        } catch {
          // ignore parse failure, use default message
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${errorMessage}`,
          },
        ]);

        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let aiMessage = "";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Thinking...",
          tools: [],
        },
      ]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          let parsed: SSEEvent;

          try {
            parsed = JSON.parse(line.replace("data: ", "")) as SSEEvent;
          } catch {
            // Malformed SSE chunk — skip it rather than crash the loop
            continue;
          }

          if (parsed.type === "chunk") {
            aiMessage = parsed.content || "✅ Done";

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: aiMessage,
              };
              return updated;
            });
          }

          if (parsed.type === "tool") {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;

              if (lastIndex >= 0) {
                const existingTools = updated[lastIndex].tools || [];

                updated[lastIndex] = {
                  ...updated[lastIndex],
                  tools: [
                    ...existingTools,
                    {
                      name: parsed.name,
                      status: parsed.status,
                    },
                  ],
                };
              }

              return updated;
            });

            if (parsed.data && parsed.name === "create_task") {
              const taskData = parsed.data;

              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: ` Task Created: "${taskData.title}"`,
                },
              ]);
            }
          }

          if (parsed.type === "thinking") {
            // no-op (handled by the typing indicator)
          }

          if (parsed.type === "reasoning") {
            setMessages((prev) => {
              const updated = [...prev];

              updated.push({
                role: "assistant",
                content: `💡 Reasoning:\n${parsed.content}`,
              });

              return updated;
            });
          }

          // 🔧 NEW: handle server-side errors sent mid-stream.
          // Without this, a failed agent run leaves the last
          // assistant bubble stuck on "Thinking..." forever.
          if (parsed.type === "error") {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;

              if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content:
                    parsed.message ||
                    "⚠️ Something went wrong while processing your request.",
                };
              } else {
                updated.push({
                  role: "assistant",
                  content:
                    parsed.message ||
                    "⚠️ Something went wrong while processing your request.",
                });
              }

              return updated;
            });
          }

          if (parsed.type === "done") {
            if (parsed.conversationId) {
              setConversationId(parsed.conversationId);
              await fetchConversations();
            }
          }
        }
      }
    } catch (error) {
      console.error(error);

      // 🔧 NEW: network/parse failures also shouldn't leave
      // "Thinking..." stuck on screen.
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (
          lastIndex >= 0 &&
          updated[lastIndex].role === "assistant" &&
          updated[lastIndex].content === "Thinking..."
        ) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: "⚠️ Connection error. Please try again.",
          };
          return updated;
        }

        return [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Connection error. Please try again.",
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  // SWITCH CHAT
  const handleSelectConversation = async (id: string) => {
    if (id === conversationId) return;

    setLoading(true);
    setMessages([]);
    setConversationId(id);

    try {
      const res = await apiClient(`/api/conversations/${id}/messages`);
      const history = res?.data || [];

      const formatted = (history as BackendMessage[]).map((msg) => ({
        role: msg.role,
        content: msg.message,
      }));

      setMessages(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setLoading(false);

    setConversationId(null);
    setMessages([]);

    // 🔥 Force fresh UI reset
    setTimeout(() => {
      setMessages([]);
    }, 0);

    localStorage.removeItem("activeConversationId");
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        refresh={fetchConversations}
      />

      <div className="flex flex-1 max-w-4xl mx-auto w-full">
        {/* CHAT */}
        <div className="flex flex-col flex-1">
          <ChatContainer messages={messages} loading={loading} />
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      </div>
    </div>
  );
}
