import React, { useState } from "react";
import { SummaryResult } from "../types";
import { Target, Cpu, TrendingUp, Compass, BookOpen, Layers, Grid, ListCollapse } from "lucide-react";

interface InsightsDashboardProps {
  summary: SummaryResult | null;
  onSelectQuestion: (question: string) => void;
}

export default function InsightsDashboard({ summary, onSelectQuestion }: InsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tldr" | "all" | "objectives" | "methods" | "results" | "conclusions">("all");

  if (!summary) {
    return (
      <div id="insights-dashboard-empty" className="h-full border border-[#F4DDD0] bg-white/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-8 text-center min-h-[400px] shadow-lg shadow-[#FCEDE3]/40">
        <div className="w-16 h-16 bg-[#FAF0E6] border border-[#F4DDD0] rounded-full flex items-center justify-center shadow-sm mb-4 animate-pulse">
          <BookOpen className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="font-semibold text-stone-800 text-base mb-1">No Paper Extracted Yet</h3>
        <p className="text-sm text-stone-500 max-w-sm leading-relaxed mb-6">
          Choose one of the high-fidelity pre-loaded research papers on the left or upload your own, then click "Extract Key Insights" to start.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs text-stone-600 font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF0E6] border border-[#F4DDD0] rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Objectives & Methods
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF0E6] border border-[#F4DDD0] rounded-full">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
            Results & Metrics
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF0E6] border border-[#F4DDD0] rounded-full">
            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full"></span>
            Conclusions & Q&A
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: "objectives",
      title: "Research Objectives",
      icon: Target,
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      bullets: summary.objectives,
      description: "The core challenges and problem statement targeted by the researchers."
    },
    {
      id: "methods",
      title: "Methodology & Setup",
      icon: Cpu,
      colorClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
      iconColor: "text-cyan-600",
      borderColor: "border-cyan-200",
      bullets: summary.methods,
      description: "Experimental design, systems, materials, and steps used in the investigation."
    },
    {
      id: "results",
      title: "Key Findings & Data",
      icon: TrendingUp,
      colorClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      iconColor: "text-fuchsia-600",
      borderColor: "border-fuchsia-200",
      bullets: summary.results,
      description: "Empirical outcomes, figures, metrics, and quantitative evidence extracted."
    },
    {
      id: "conclusions",
      title: "Conclusions & Implications",
      icon: Compass,
      colorClass: "bg-amber-50 text-amber-700 border-amber-200",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200",
      bullets: summary.conclusions,
      description: "The significance of findings, limits of the study, and future directions."
    }
  ];

  return (
    <div id="insights-dashboard-card" className="bg-white/90 border border-[#F4DDD0] backdrop-blur-md rounded-xl shadow-lg shadow-[#FCEDE3]/40 overflow-hidden flex flex-col h-full">
      {/* Paper Metadata Header */}
      <div className="p-5 border-b border-[#F4DDD0] bg-[#FAF0E6]/80">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono bg-white border border-[#F4DDD0] text-stone-600 rounded-md font-semibold">
              {summary.year || "Not specified"}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-white border border-[#F4DDD0] text-stone-600 rounded-md truncate max-w-[200px]">
              {summary.journal || "Not specified"}
            </span>
          </div>
          <h1 className="text-base font-extrabold text-stone-900 leading-snug tracking-tight">
            {summary.title}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            <span className="font-bold text-stone-700">Authors:</span> {summary.authors || "Not specified"}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#F4DDD0] px-4 py-2 bg-[#FAF0E6]/50 flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-all-insights"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF0E6]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Bento Grid
          </button>
          <button
            id="tab-tldr-insights"
            onClick={() => setActiveTab("tldr")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "tldr"
                ? "bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF0E6]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Summary
          </button>
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                id={`tab-${sec.id}-insights`}
                onClick={() => setActiveTab(sec.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === sec.id
                    ? "bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF0E6]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sec.title.split(" ")[1]} {/* Short form */}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Space */}
      <div className="p-5 flex-1 overflow-y-auto bg-stone-50/50 flex flex-col gap-5">
        
        {/* LAYPERSON TL;DR Callout Card (shown prominently in All and TL;DR tabs) */}
        {(activeTab === "all" || activeTab === "tldr") && (
          <div id="layperson-tldr-card" className="border border-[#F4DDD0] bg-[#FAF0E6]/40 rounded-xl p-4 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-orange-100/30 to-transparent pointer-events-none rounded-bl-full"></div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex items-center justify-center w-5 h-5 bg-orange-50 rounded-md border border-[#F4DDD0]">
                <BookOpen className="w-3.5 h-3.5 text-orange-500" />
              </span>
              <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                Summary
              </h2>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-normal">
              {summary.tldr}
            </p>
          </div>
        )}

        {/* Structured Insights (Bento Grid or Single Tabs) */}
        {activeTab === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.id}
                  id={`bento-section-${sec.id}`}
                  className={`bg-white border ${sec.borderColor} rounded-xl p-4 shadow-sm flex flex-col hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1.5 rounded-lg border ${sec.colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold text-stone-800 tracking-tight">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-[10px] text-stone-500 mb-3 leading-tight">{sec.description}</p>
                  <ul className="flex-1 flex flex-col gap-2">
                    {sec.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                        <span className={`w-1.5 h-1.5 rounded-full ${sec.iconColor} mt-1.5 shrink-0`}></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          activeTab !== "tldr" && (
            (() => {
              const sec = sections.find((s) => s.id === activeTab)!;
              const Icon = sec.icon;
              return (
                <div
                  id={`tab-focused-section-${sec.id}`}
                  className="bg-white border border-[#F4DDD0] rounded-xl p-6 shadow-sm flex-1 flex flex-col transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3 border-b border-[#F4DDD0] pb-4">
                    <span className={`p-2 rounded-xl border ${sec.colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-stone-800">
                        {sec.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">{sec.description}</p>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-4 mt-2">
                    {sec.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-xs text-stone-700 flex items-start gap-3 leading-relaxed bg-[#FAF0E6]/40 border border-[#F4DDD0] p-3.5 rounded-lg hover:bg-[#FAF0E6]/80 transition-colors">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full ${sec.colorClass} font-mono text-[10px] font-bold shrink-0 mt-0.5`}>
                          {idx + 1}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()
          )
        )}

        {/* Suggested Drilling Questions */}
        {summary.suggestedQuestions && summary.suggestedQuestions.length > 0 && (
          <div id="suggested-questions-card" className="bg-white border border-[#F4DDD0] rounded-xl p-4 mt-auto shadow-sm">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Suggested Topics for Deep Dive
            </h3>
            <div className="flex flex-col gap-2">
              {summary.suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  id={`suggested-q-btn-${idx}`}
                  onClick={() => onSelectQuestion(question)}
                  className="text-left px-3 py-2 text-xs text-stone-700 bg-white border border-stone-200 hover:border-orange-400 hover:bg-orange-50/40 rounded-lg hover:text-stone-900 transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm font-semibold"
                >
                  <span className="text-[10px] font-mono text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded shadow-sm">
                    Q{idx + 1}
                  </span>
                  <span className="truncate">{question}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
