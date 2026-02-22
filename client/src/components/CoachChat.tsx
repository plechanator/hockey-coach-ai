import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Loader2, Trash2 } from "lucide-react";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "- ")
    .replace(/`([^`]+)`/g, "$1");
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function CoachChat() {
  const { language, t } = useLanguage();
  const chatT = (t as any).coachChat || {};
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem("coachChat_messages");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    try { sessionStorage.setItem("coachChat_messages", JSON.stringify(messages)); } catch {}
    scrollToBottom();
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/coach-chat", {
        message,
        history: messages,
        language,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: chatT.errorReply || "Sorry, I couldn't process your message. Please try again.",
        },
      ]);
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    try { sessionStorage.removeItem("coachChat_messages"); } catch {}
  };

  const suggestions = [
    chatT.suggestion1 || "How should I structure my next training?",
    chatT.suggestion2 || "What methodology works best for U12?",
    chatT.suggestion3 || "I feel my trainings lack intensity.",
  ];

  const hasMessages = messages.length > 0;

  return (
    <Card
      className="overflow-visible flex flex-col"
      data-testid="card-coach-chat"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-accent/8">
            <MessageCircle className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" data-testid="text-chat-title">
              {chatT.promptTitle || "Talk to CoachAI"}
            </h3>
            {!hasMessages && (
              <p className="text-xs text-muted-foreground">
                {chatT.promptSubtitle || "Discuss training plans, methodology, or share how you feel about your sessions."}
              </p>
            )}
          </div>
        </div>
        {hasMessages && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            title={chatT.clearChat || "Clear chat"}
            data-testid="button-clear-chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {hasMessages && (
        <div
          className="overflow-y-auto px-4 py-3 space-y-2.5 max-h-[260px]"
          data-testid="chat-messages"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-accent text-white"
                    : "bg-muted text-foreground"
                }`}
                data-testid={`chat-message-${msg.role}-${i}`}
              >
                {msg.role === "assistant" ? stripMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-md px-3 py-2">
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {!hasMessages && (
        <div className="px-4 py-3 flex flex-wrap gap-2" data-testid="chat-suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(s);
                if (inputRef.current) inputRef.current.focus();
              }}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover-elevate overflow-visible text-muted-foreground"
              data-testid={`button-suggestion-${i}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chatT.inputPlaceholder || "Type your message..."}
            disabled={sendMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            data-testid="button-send-message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
