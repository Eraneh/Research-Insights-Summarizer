import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PaperSelector from "./components/PaperSelector";
import InsightsDashboard from "./components/InsightsDashboard";
import InteractiveQA from "./components/InteractiveQA";
import MetricsPanel from "./components/MetricsPanel";
import { SummaryResult, ChatMessage } from "./types";
import { BookOpen, Sparkles, HelpCircle, Activity } from "lucide-react";

export default function App() {
  const [paperText, setPaperText] = useState<string>("");
  const [activeSummary, setActiveSummary] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Simulated animated loading phases for maximum visual feedback
  const runLoadingAnimation = (callback: () => Promise<void>) => {
    const steps = [
      "Verifying file parameters...",
      "Structuring specialized prompts...",
      "Extracting scientific objectives...",
      "Analyzing experimental methodology...",
      "Synthesizing results and figures...",
      "Formulating layperson conclusions...",
      "Finalizing research summary..."
    ];

    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setLoadingStep(steps[currentStepIdx]);
      }
    }, 1200);

    callback().finally(() => {
      clearInterval(interval);
    });
  };

  const handleAnalyze = async (text: string, title?: string, isUploaded?: boolean) => {
    setIsLoading(true);
    setErrorMessage("");
    setPaperText(text);

    const performExtraction = async () => {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to extract research insights.");
        }

        const data: SummaryResult = await response.json();
        setActiveSummary(data);
        
        // Reset and prime the lit review chat assistant
        setChatMessages([
          {
            id: "welcome-msg",
            role: "assistant",
            content: `I have completed the structural extraction for: "${data.title || title}". \n\nYou can view the key findings above, or ask me questions about specific experimental procedures, metrics, or claims. How can I help you today?`,
            suggestedFollowUps: data.suggestedQuestions || []
          }
        ]);

        if (isUploaded) {
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 3000);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "An unexpected error occurred during research extraction.");
      } finally {
        setIsLoading(false);
      }
    };

    runLoadingAnimation(performExtraction);
  };

  const handleSendQuery = async (query: string) => {
    if (!paperText || isQuerying) return;

    // Append user query to chat list
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };
    
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsQuerying(true);

    try {
      // Map ChatMessage structure to server body format
      const history = updatedMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: paperText,
          query,
          history
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to answer query.");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        suggestedFollowUps: data.suggestedFollowUps || []
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `Error: ${err.message || "I encountered an issue retrieving that answer. Please try again."}`
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCEDE3] via-[#FAF0E6] to-[#FFF5EE] text-slate-800 flex flex-col font-sans">
      
      {/* Top Banner & Header */}
      <header className="bg-white/85 border-b border-[#F4DDD0] sticky top-0 z-50 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-500 text-white rounded-lg flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white fill-current" />
            </span>
            <div>
              <h1 className="text-sm font-extrabold bg-gradient-to-r from-orange-600 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent tracking-tight leading-tight">
                Research Insights Summarizer
              </h1>
              <p className="text-[10px] text-stone-500 font-bold mt-0.5">
                Cognitive Ingestion, Visual Synthetics & Vertical Dialogue
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-mono text-emerald-700 font-bold shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Gemini Active
            </div>
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[10px] font-bold text-stone-600 hover:text-stone-900 border border-stone-200 px-2.5 py-1 rounded-md transition-colors bg-white shadow-sm"
            >
              Google AI Studio
            </a>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage("")} 
              className="text-red-500 hover:text-red-800 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Panel: Ingestion & Chat (span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex-1">
              <PaperSelector 
                onAnalyze={handleAnalyze} 
                isLoading={isLoading} 
                loadingStep={loadingStep} 
              />
            </div>
            <div>
              <InteractiveQA 
                messages={chatMessages} 
                onSendQuery={handleSendQuery} 
                isQuerying={isQuerying} 
                hasPaper={!!paperText} 
              />
            </div>
          </div>

          {/* Right Panel: Analyzed Insights Dashboard (span 7) */}
          <div className="lg:col-span-7 flex flex-col">
            <InsightsDashboard 
              summary={activeSummary} 
              onSelectQuestion={handleSendQuery} 
            />
          </div>

        </div>

        {/* Bottom Panel: Success Metrics and Relevance Validation Feedback */}
        <div className="border-t border-[#F4DDD0] pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-stone-500" />
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Lumina Literature Success Indicators
            </h2>
          </div>
          <MetricsPanel 
            hasPaper={!!activeSummary} 
            paperTitle={activeSummary?.title} 
          />
        </div>

      </main>

      {/* Success Scan Toast Popup */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-orange-500/30 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 border-l-orange-500"
          >
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-md">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Report is now ready!</p>
              <p className="text-[10px] text-stone-400 mt-1 font-medium">Insights successfully extracted.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#FAF0E6] border-t border-[#F4DDD0] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-stone-500 font-semibold">
          <p>© 2026 Research Insights Summarizer. Built securely with server-side @google/genai SDK telemetry.</p>
        </div>
      </footer>

    </div>
  );
}
