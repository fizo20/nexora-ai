// frontend/app/dashboard/assistant/page.tsx
"use client";

import { useEffect, useState } from "react";
import ChatContainer from "@/components/ai/ChatContainer";
import ChatInput from "@/components/ai/ChatInput";
import ConversationSidebar from "@/components/ai/ConversationSidebar";
import { apiClient } from "@/lib/api/client";
import { Menu } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Message = {
  role: "user" | "assistant";
  content: string;
  tools?: { name: string; status: string }[];
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

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await apiClient("/api/projects");
        const projects = res?.data || res;
        if (projects?.length > 0) setProjectId(projects[0]._id);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("activeConversationId");
    if (saved) setConversationId(saved);
  }, []);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("activeConversationId", conversationId);
    }
  }, [conversationId]);

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

      const response = await fetch(`${API_URL}/api/ai/assistant`, {
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

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("text/event-stream")) {
        let errorMessage = "Something went wrong. Please try again.";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.error || errorMessage;
        } catch {
          /* ignore */
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${errorMessage}` },
        ]);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Thinking...", tools: [] },
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
              const last = updated.length - 1;
              if (last >= 0) {
                updated[last] = {
                  ...updated[last],
                  tools: [
                    ...(updated[last].tools || []),
                    { name: parsed.name, status: parsed.status },
                  ],
                };
              }
              return updated;
            });
            if (parsed.data && parsed.name === "create_task") {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `✅ Task Created: "${parsed.data?.title}"`,
                },
              ]);
            }
          }

          if (parsed.type === "reasoning") {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `💡 Reasoning:\n${parsed.content}`,
              },
            ]);
          }

          if (parsed.type === "error") {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated.length - 1;
              const msg = parsed.message || "⚠️ Something went wrong.";
              if (last >= 0 && updated[last].role === "assistant") {
                updated[last] = { ...updated[last], content: msg };
              } else {
                updated.push({ role: "assistant", content: msg });
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
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated.length - 1;
        if (
          last >= 0 &&
          updated[last].role === "assistant" &&
          updated[last].content === "Thinking..."
        ) {
          updated[last] = {
            ...updated[last],
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

  const handleSelectConversation = async (id: string) => {
    if (id === conversationId) return;
    setLoading(true);
    setMessages([]);
    setConversationId(id);
    setSidebarOpen(false);
    try {
      const res = await apiClient(`/api/conversations/${id}/messages`);
      const history = res?.data || [];
      setMessages(
        (history as BackendMessage[]).map((msg) => ({
          role: msg.role,
          content: msg.message,
        })),
      );
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
    setSidebarOpen(false);
    localStorage.removeItem("activeConversationId");
  };

  return (
    <div className="flex h-[calc(100vh-52px)] -m-4 sm:-m-6 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conversation sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 md:relative md:z-auto
          transition-transform duration-200
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <ConversationSidebar
          conversations={conversations}
          activeId={conversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          refresh={fetchConversations}
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Open conversations"
          >
            <Menu size={18} />
          </button>
          <span className="text-[14px] font-medium text-foreground truncate">
            {conversations.find((c) => c._id === conversationId)?.title ||
              "AI Assistant"}
          </span>
        </div>

        <div className="flex flex-col flex-1 min-h-0 p-3 sm:p-4 max-w-4xl mx-auto w-full">
          <ChatContainer messages={messages} loading={loading} />
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      </div>
    </div>
  );
}
