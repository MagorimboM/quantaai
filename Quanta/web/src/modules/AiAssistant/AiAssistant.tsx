import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send } from "lucide-react";
import {
  getChatHistory,
  sendUserMessage,
} from "@/modules/AiAssistant/api/ai.assistant.api";

type Message = {
  id?: string;
  role: "user" | "ai";
  content: string;
};

export function AiAssistant() {
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [typeIndicator, setTypeIndicator] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<string>("");

  useEffect(() => {
    async function fetchChatHistory() {
      const chatHistory: Message[] = await getChatHistory();
      setChatMessages(chatHistory);
    }
    fetchChatHistory();
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setChatInput(e.target.value);
    chatInputRef.current = e.target.value;
  }

  async function submitMessage(e?: React.KeyboardEvent<HTMLInputElement>) {
    if (e && e.key !== "Enter") return;
    const message = chatInputRef.current.trim();
    if (!message) return;

    setChatInput("");
    chatInputRef.current = "";
    setTypeIndicator(true);
    setChatMessages((prev) => [
      ...prev,
      { id: "", role: "user", content: message },
    ]);

    try {
      const chatResponse = await sendUserMessage(message);
      setChatMessages((prev) => [...prev, chatResponse]);
    } catch (err: any) {
      console.error("API Error:", err.response?.data);
    } finally {
      setTypeIndicator(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <>
      {chatOpen && (
        <div className="absolute bottom-6 right-6 w-[380px] h-[540px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-white" />
              <div>
                <div className="text-sm font-semibold text-white">
                  AI Assistant
                </div>
                <div className="text-xs text-white/60">
                  Context-aware suggestions
                </div>
              </div>
            </div>
            <div
              onClick={() => setChatOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {typeIndicator && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted text-foreground px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={handleInputChange}
                onKeyDown={(e) => submitMessage(e)}
                placeholder="Ask about your quantities..."
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <div
                className="w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer"
                onClick={() => submitMessage()}
              >
                <Send className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {!chatOpen && (
        <div
          onClick={() => setChatOpen(true)}
          className="absolute bottom-6 right-6 w-[52px] h-[52px] bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 z-20 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
        </div>
      )}
    </>
  );
}