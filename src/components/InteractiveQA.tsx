import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, HelpCircle, MessageSquare, Bot, User, CornerDownRight, RefreshCw } from "lucide-react";

interface InteractiveQAProps {
  messages: ChatMessage[];
  onSendQuery: (query: string) => void;
  isQuerying: boolean;
  hasPaper: boolean;
}

export default function InteractiveQA({ messages, onSendQuery, isQuerying, hasPaper }: InteractiveQAProps) {
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isQuerying || !hasPaper) return;
    onSendQuery(input);
    setInput("");
  };

  const handleSuggestedClick = (q: string) => {
    if (isQuerying || !hasPaper) return;
    onSendQuery(q);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isQuerying]);

  // Last message might contain suggested follow-ups
  const lastMessage = messages[messages.length - 1];
  const followUps = lastMessage && lastMessage.role === "assistant" ? lastMessage.suggestedFollowUps : [];

  return (
    <div id="interactive-qa-card" className="bg-white/90 border border-[#F4DDD0] backdrop-blur-md rounded-xl shadow-lg shadow-[#FCEDE3]/40 overflow-hidden flex flex-col h-[480px]">
      {/* Header */}
      <div className="p-4 border-b border-[#F4DDD0] bg-[#FAF0E6]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-stone-800 text-sm tracking-tight">
            Literature Review Dialogue Console
          </h2>
        </div>
        {hasPaper && (
          <span className="text-[10px] bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold animate-pulse shadow-sm">
            Ready to drill down
          </span>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-stone-50/50">
        {!hasPaper ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <HelpCircle className="w-10 h-10 text-orange-200 mb-2" />
            <p className="text-xs font-bold text-stone-700">Dialogue Console Inactive</p>
            <p className="text-[10px] text-stone-500 mt-1 max-w-[220px] leading-relaxed">
              The Q&A assistant will activate once you extract insights from a research paper on the left.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Bot className="w-10 h-10 text-orange-500 mb-2 animate-bounce" />
            <p className="text-xs font-bold text-stone-700">Lit Review Assistant Engaged</p>
            <p className="text-[10px] text-stone-500 mt-1 max-w-[260px] leading-relaxed">
              Ask deep vertical questions about the paper's experimental controls, numerical baselines, datasets, or real-world applicability!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === "user"
                    ? "bg-orange-50 border-orange-300 text-orange-700 shadow-sm"
                    : "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 shadow-sm"
                }`}
              >
                {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div className="flex flex-col gap-1">
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap border ${
                    msg.role === "user"
                       ? "bg-gradient-to-r from-orange-500 to-rose-500 border-orange-500 text-white rounded-tr-none shadow-sm"
                       : "bg-white border-[#F4DDD0] text-stone-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Querying loader */}
        {isQuerying && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-7 h-7 rounded-full bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 bg-white border border-[#F4DDD0] text-stone-700 rounded-xl rounded-tl-none text-xs flex items-center gap-2 shadow-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span>Consulting research parameters...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic follow-up recommendations panel */}
      {hasPaper && followUps && followUps.length > 0 && (
        <div className="px-4 py-2 bg-[#FAF0E6]/80 border-t border-[#F4DDD0] flex flex-col gap-1">
          <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1">
            <CornerDownRight className="w-2.5 h-2.5" /> Recommended follow-ups
          </span>
          <div className="flex flex-wrap gap-1.5">
            {followUps.map((q, i) => (
              <button
                key={i}
                id={`follow-up-q-btn-${i}`}
                onClick={() => handleSuggestedClick(q)}
                disabled={isQuerying}
                className="bg-white border border-stone-200 hover:border-orange-400 hover:bg-orange-50/40 text-[10px] text-stone-700 hover:text-stone-900 px-2.5 py-1 rounded-md transition-all duration-200 text-left truncate max-w-[280px] cursor-pointer shadow-sm font-semibold"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="p-3 border-t border-[#F4DDD0] bg-[#FAF0E6]/50">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            id="qa-input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!hasPaper || isQuerying}
            placeholder={
              hasPaper
                ? "Ask details (e.g. 'What specific dataset did they use?', 'Explain the loss function')..."
                : "Awaiting paper ingestion..."
            }
            className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-400 focus:bg-white text-stone-800 placeholder-stone-400 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed transition-all"
          />
          <button
            id="qa-submit-btn"
            type="submit"
            disabled={!hasPaper || isQuerying || !input.trim()}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              !hasPaper || isQuerying || !input.trim()
                ? "bg-stone-50 border border-stone-200 text-stone-300 cursor-not-allowed"
                : "bg-gradient-to-br from-orange-500 to-rose-500 text-white hover:opacity-95 active:scale-[0.95] shadow-sm"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
