import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send } from "lucide-react";
import {
  getChatHistory,
  sendUserMessage,
} from "@/modules/aiAssistant/api/ai.assistant.api";
import type { Message } from "@/modules/aiAssistant/contracts/aiAssistant.response.contract";
import { getActiveScope } from "@/common/storage/activeScope";

/**
 * Floating chat assistant.
 *
 * WHAT IT KNOWS: the documents the user has uploaded (project specs and
 * drawings, company policies, personal references) plus the conversation so
 * far. It does not see quantities or recipes, so it answers questions like
 * "what concrete strength does the spec call for?", not "how many bricks do I need?".
 *
 * SCOPE: one conversation per company, and one per project when the user is
 * inside a project. Inside a project it also reads that project's documents.
 *
 * It needs a company, so it stays hidden in a personal workspace.
 * TODO :: [backend] support a personal (no company) conversation, then drop the hidden state.
 */
export function AiAssistant() {
  const { companyId, projectId } = getActiveScope();

  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [typeIndicator, setTypeIndicator] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load the saved conversation for the company/project the user is in
  useEffect(() => {
    if (!companyId) return;
    const activeCompanyId = companyId;

    async function fetchChatHistory() {
      try {
        const chatHistory = await getChatHistory({
          companyId: activeCompanyId,
          projectId,
        });
        setChatMessages(chatHistory);
      } catch {
        // apiClient already reports the failure through the global error state
      }
    }

    fetchChatHistory();
  }, [companyId, projectId]);

  // Keep the newest message in view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function submitMessage() {
    const message = chatInput.trim();
    // Ignore empty input, and a second question while one is still being answered
    if (!message || typeIndicator || !companyId) return;

    setChatInput("");
    setTypeIndicator(true);
    // Show the question straight away; the backend saves it as part of answering
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const reply = await sendUserMessage({
        companyId,
        projectId,
        userMessage: message,
      });
      setChatMessages((prev) => [...prev, reply]);
    } catch {
      // apiClient already reports the failure through the global error state
    } finally {
      setTypeIndicator(false);
    }
  }

  if (!companyId) return null;

  return (
    <>
      {chatOpen && (
        <div className="absolute bottom-6 right-6 w-[380px] h-[540px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <div>
                <div className="text-sm font-semibold text-primary-foreground">
                  AI Assistant
                </div>
                <div className="text-xs text-primary-foreground/70">
                  Context-aware suggestions
                </div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              aria-label="Close assistant"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {chatMessages.map((msg, index) => (
              <div
                key={msg.id ?? index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
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
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitMessage();
                }}
                placeholder="Ask about your quantities..."
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={() => submitMessage()}
                aria-label="Send message"
                className="w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating open button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          aria-label="Open assistant"
          className="absolute bottom-6 right-6 w-[52px] h-[52px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 z-20 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}
    </>
  );
}