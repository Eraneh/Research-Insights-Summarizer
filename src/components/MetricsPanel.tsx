import React, { useState } from "react";
import { Star, ShieldCheck, Heart, Clock, Award, CheckCircle } from "lucide-react";
import { PaperEvaluation } from "../types";

interface MetricsPanelProps {
  hasPaper: boolean;
  paperTitle?: string;
}

export default function MetricsPanel({ hasPaper, paperTitle }: MetricsPanelProps) {
  // Mock initial community ratings
  const [evaluations, setEvaluations] = useState<PaperEvaluation[]>([
    { rating: 5, usefulness: "high", comments: "Incredible extraction of the quantum parameters!" },
    { rating: 4, usefulness: "high", comments: "Very accurate summary of the CRISPR guide methodology." },
    { rating: 5, usefulness: "high", comments: "Saved me at least 30 minutes of reading." },
    { rating: 4, usefulness: "medium", comments: "The laying language summary is very helpful." }
  ]);

  // Form states
  const [userRating, setUserRating] = useState<number>(5);
  const [usefulness, setUsefulness] = useState<"high" | "medium" | "low">("high");
  const [comments, setComments] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPaper) return;

    const newEval: PaperEvaluation = {
      rating: userRating,
      usefulness,
      comments: comments.trim() || "Validated summary relevance."
    };

    setEvaluations([newEval, ...evaluations]);
    setIsSubmitted(true);
    setComments("");

    // Reset success banner after 4 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4000);
  };

  // Calculations
  const totalRatings = evaluations.length;
  const avgRating = evaluations.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;
  // Calculate percentage of high/medium usefulness as satisfaction rate
  const highUsefulCount = evaluations.filter(e => e.usefulness === "high" || e.usefulness === "medium").length;
  const satisfactionScore = Math.round((highUsefulCount / totalRatings) * 100);

  // Traditional review time saved estimation
  const manualReadTimeMin = 30; // 30 minutes for a standard full paper review
  const genaiProcessTimeSec = 3.5; // average seconds
  const efficiencyGainPct = 99.8;

  return (
    <div id="metrics-panel-card" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Col 1: Time Savings & Efficiency */}
      <div id="time-savings-box" className="bg-[#130b2c]/85 border border-rose-500/30 rounded-xl p-4 shadow-xl shadow-rose-950/5 hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="p-1.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-400">
            <Clock className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Review Efficiency Gain
          </h3>
        </div>
        <div className="my-3">
          <div className="text-2xl font-black bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent tracking-tight flex items-baseline gap-1.5">
            {efficiencyGainPct}%
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-inner animate-pulse">
              SAVED
            </span>
          </div>
          <p className="text-[10px] text-indigo-200/80 mt-1 leading-relaxed">
            Comparing manual paper reading time with Gemini-powered cognitive synthesis speed.
          </p>
        </div>
        <div className="border-t border-[#3b1d7d]/40 pt-3 grid grid-cols-2 gap-2 text-center">
          <div className="bg-[#1a0e3a]/60 border border-[#3b1d7d]/40 p-1.5 rounded-lg">
            <span className="block text-[9px] font-bold text-indigo-300/60 uppercase tracking-wider">Manual Review</span>
            <span className="text-xs font-bold text-indigo-200/80">~30.0 min</span>
          </div>
          <div className="bg-rose-950/40 border border-rose-500/30 p-1.5 rounded-lg shadow-inner">
            <span className="block text-[9px] font-bold text-rose-400 uppercase tracking-wider">Lumina GenAI</span>
            <span className="text-xs font-extrabold text-rose-300">~3.5 sec</span>
          </div>
        </div>
      </div>

      {/* Col 2: Live Satisfaction Meter */}
      <div id="satisfaction-score-box" className="bg-[#130b2c]/85 border border-indigo-500/30 rounded-xl p-4 shadow-xl shadow-indigo-950/20 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="p-1.5 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-indigo-400">
            <Award className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
            User Satisfaction
          </h3>
        </div>
        <div className="my-2.5 flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Simple circle progress display */}
            <div className="w-14 h-14 rounded-full border-4 border-indigo-500/40 border-t-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <span className="text-sm font-black text-fuchsia-100">{satisfactionScore}%</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="block text-xs font-bold text-indigo-100">Excellent Consensus</span>
            <p className="text-[10px] text-indigo-200/70 mt-0.5 leading-relaxed">
              Based on {totalRatings} community verification reviews checking summary relevancy.
            </p>
          </div>
        </div>
        <div className="border-t border-[#3b1d7d]/40 pt-3 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-1">
            <span className="text-fuchsia-200 font-bold">{avgRating.toFixed(1)}</span>
            <div className="flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-[#2e1d53]"}`} />
              ))}
            </div>
          </div>
          <span className="font-mono text-[9px] text-indigo-400">{totalRatings} validations</span>
        </div>
      </div>

      {/* Col 3: Relevance Feedback Form */}
      <div id="relevance-feedback-form-box" className="bg-[#130b2c]/85 border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-950/5 hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between">
        {!hasPaper ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-indigo-400/80">
            <ShieldCheck className="w-8 h-8 text-[#3b1d7d]/60 mb-1" />
            <span className="text-xs font-bold text-indigo-200">Verification Pending</span>
            <span className="text-[10px] text-indigo-300/60 max-w-[180px] mt-0.5">
              Analyze a paper to unlock the evaluation & verification form.
            </span>
          </div>
        ) : isSubmitted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-emerald-400 animate-fadeIn">
            <CheckCircle className="w-10 h-10 mb-1.5" />
            <span className="text-xs font-bold">Feedback Submitted!</span>
            <span className="text-[10px] text-[#A1A5AC] mt-1 max-w-[180px]">
              Thank you! Your feedback has been logged to update summary relevancy and satisfaction metrics.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2 justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E4E6EB]">Validate Accuracy</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${star <= userRating ? "fill-amber-400 text-amber-400" : "text-[#2e1d53]"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-indigo-300">How useful was it?</span>
              <div className="flex gap-1">
                {(["high", "medium", "low"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUsefulness(level)}
                    className={`px-1.5 py-0.5 text-[9px] rounded font-bold border uppercase tracking-wider transition-all cursor-pointer ${
                      usefulness === level
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-[0_0_6px_rgba(139,92,246,0.3)]"
                        : "bg-[#160a36] border border-[#3b1d7d]/50 text-indigo-200 hover:text-white hover:border-indigo-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5 items-center">
              <input
                id="eval-comment-input"
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Brief validation notes (optional)..."
                className="flex-1 bg-[#12082a] border border-[#3b1d7d]/50 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-cyan-400 focus:bg-[#1a0e3d]/40 text-[#E4E6EB] placeholder-indigo-400/50"
              />
              <button
                id="eval-submit-btn"
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:opacity-90 font-bold text-[9px] px-2.5 py-1.5 rounded uppercase tracking-widest shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
