import React, { useState, useRef } from "react";
import { SAMPLE_PAPERS, SamplePaper } from "../data/samplePapers";
import { FileText, Upload, Clipboard, Check, Sparkles } from "lucide-react";

interface PaperSelectorProps {
  onAnalyze: (text: string, title?: string, isUploaded?: boolean) => void;
  isLoading: boolean;
  loadingStep: string;
}

export default function PaperSelector({ onAnalyze, isLoading, loadingStep }: PaperSelectorProps) {
  const [selectedPaperId, setSelectedPaperId] = useState<string>("quantum-ai");
  const [customText, setCustomText] = useState<string>("");
  const [isPasting, setIsPasting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isPdfExtracting, setIsPdfExtracting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSampleSelect = (paper: SamplePaper) => {
    setSelectedPaperId(paper.id);
    setIsPasting(false);
    setUploadedFileName("");
    setCustomText("");
  };

  const handlePasteMode = () => {
    setSelectedPaperId("custom");
    setIsPasting(true);
    setUploadedFileName("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setSelectedPaperId("custom");
      setIsPasting(true);
      
      if (file.name.toLowerCase().endsWith(".pdf")) {
        setIsPdfExtracting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result && typeof event.target.result === "string") {
            try {
              const res = await fetch("/api/extract-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file: event.target.result }),
              });
              const data = await res.json();
              if (data.error) {
                alert(`Error: ${data.error}`);
                setCustomText("");
                setUploadedFileName("");
              } else {
                setCustomText(data.text);
              }
            } catch (err: any) {
              console.error(err);
              alert("Network error: failed to communicate with the PDF extraction service.");
              setCustomText("");
              setUploadedFileName("");
            } finally {
              setIsPdfExtracting(false);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === "string") {
            setCustomText(event.target.result);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const nameLower = file.name.toLowerCase();
      if (file.type === "text/plain" || nameLower.endsWith(".md") || nameLower.endsWith(".txt") || nameLower.endsWith(".pdf")) {
        setUploadedFileName(file.name);
        setSelectedPaperId("custom");
        setIsPasting(true);

        if (nameLower.endsWith(".pdf")) {
          setIsPdfExtracting(true);
          const reader = new FileReader();
          reader.onload = async (event) => {
            if (event.target?.result && typeof event.target.result === "string") {
              try {
                const res = await fetch("/api/extract-pdf", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ file: event.target.result }),
                });
                const data = await res.json();
                if (data.error) {
                  alert(`Error: ${data.error}`);
                  setCustomText("");
                  setUploadedFileName("");
                } else {
                  setCustomText(data.text);
                }
              } catch (err: any) {
                console.error(err);
                alert("Network error: failed to communicate with the PDF extraction service.");
                setCustomText("");
                setUploadedFileName("");
              } finally {
                setIsPdfExtracting(false);
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result && typeof event.target.result === "string") {
              setCustomText(event.target.result);
            }
          };
          reader.readAsText(file);
        }
      }
    }
  };

  const getWordCount = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  const handleTriggerAnalyze = () => {
    if (selectedPaperId === "custom") {
      if (!customText.trim() || customText.trim().length < 50) {
        alert("Please enter or upload at least 50 characters of scientific text.");
        return;
      }
      onAnalyze(customText, uploadedFileName ? `Uploaded: ${uploadedFileName}` : "Pasted Research Text", !!uploadedFileName);
    } else {
      const paper = SAMPLE_PAPERS.find((p) => p.id === selectedPaperId);
      if (paper) {
        onAnalyze(paper.fullText, paper.title, false);
      }
    }
  };

  const currentPaperText = selectedPaperId === "custom" 
    ? customText 
    : SAMPLE_PAPERS.find(p => p.id === selectedPaperId)?.fullText || "";

  const wordCount = getWordCount(currentPaperText);

  return (
    <div id="paper-selector-card" className="bg-white/90 border border-[#F4DDD0] backdrop-blur-md rounded-xl shadow-lg shadow-[#FCEDE3]/40 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#F4DDD0] bg-[#FAF0E6]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-stone-800 text-sm tracking-tight">Source Material Ingestion</h2>
        </div>
        <div className="flex items-center gap-2">
          {wordCount > 6000 && (
            <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse shadow-sm">
              ⚡ Speed Optimized
            </span>
          )}
          <span className="text-xs font-mono text-orange-700 bg-orange-50 border border-[#F4DDD0] px-2.5 py-0.5 rounded-full shadow-sm">
            {wordCount} words
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
        {/* Sample selection */}
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
            Select a Sample Research Paper
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SAMPLE_PAPERS.map((paper) => (
              <button
                key={paper.id}
                id={`sample-paper-btn-${paper.id}`}
                onClick={() => handleSampleSelect(paper)}
                disabled={isLoading}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-200 ${
                  selectedPaperId === paper.id
                    ? "border-orange-500 bg-orange-50/85 font-bold text-stone-900 shadow-[0_2px_8px_rgba(249,115,22,0.1)]"
                    : "border-stone-200/80 hover:border-orange-400 hover:bg-orange-50/20 text-stone-700 bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="font-mono text-[10px] text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">
                    {paper.domain}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {paper.journal} ({paper.year})
                  </span>
                </div>
                <h3 className={`font-semibold line-clamp-2 ${selectedPaperId === paper.id ? "text-orange-950 font-bold" : "text-stone-800"}`}>
                  {paper.title}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center text-center my-1">
          <div className="flex-1 border-t border-[#F4DDD0]"></div>
          <span className="px-3 text-[10px] text-stone-400 font-bold font-mono uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-[#F4DDD0]"></div>
        </div>

        {/* Custom text/file selection */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">
              Import Custom Document
            </label>
            <div className="flex gap-2">
              <button
                id="paste-text-tab-btn"
                onClick={handlePasteMode}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 cursor-pointer ${
                  isPasting && selectedPaperId === "custom"
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent font-extrabold shadow-[0_3px_10px_rgba(249,115,22,0.25)] scale-[1.02] ring-2 ring-orange-500/25"
                    : "bg-gradient-to-r from-orange-500/80 to-rose-500/80 hover:from-orange-500 hover:to-rose-500 text-white border-transparent font-semibold shadow-sm hover:shadow-[0_3px_10px_rgba(249,115,22,0.2)] hover:scale-[1.02] opacity-90 hover:opacity-100"
                }`}
              >
                <Clipboard className="w-3.5 h-3.5 text-white" />
                Paste Text
              </button>
              <button
                id="file-upload-trigger-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 cursor-pointer ${
                  uploadedFileName
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent font-extrabold shadow-[0_3px_10px_rgba(249,115,22,0.25)] scale-[1.02] ring-2 ring-orange-500/25"
                    : "bg-gradient-to-r from-orange-500/80 to-rose-500/80 hover:from-orange-500 hover:to-rose-500 text-white border-transparent font-semibold shadow-sm hover:shadow-[0_3px_10px_rgba(249,115,22,0.2)] hover:scale-[1.02] opacity-90 hover:opacity-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-white" />
                Upload File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.pdf"
                className="hidden"
              />
            </div>
          </div>

          {selectedPaperId === "custom" || isPasting ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex-1 flex flex-col min-h-[140px] border-2 border-dashed rounded-lg p-3 transition-colors ${
                dragActive ? "border-orange-500 bg-orange-50/40" : "border-stone-300 bg-stone-50/30"
              }`}
            >
              {uploadedFileName && (
                <div className="flex items-center justify-between bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-md text-xs text-orange-950 mb-2 shadow-sm animate-fadeIn">
                  <span className="truncate max-w-[80%] font-semibold">{uploadedFileName}</span>
                  <button 
                    onClick={() => {
                      setUploadedFileName("");
                      setCustomText("");
                    }}
                    className="text-orange-500 hover:text-orange-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {isPdfExtracting ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-orange-50/20 min-h-[100px]">
                  <svg className="animate-spin h-6 w-6 text-orange-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-xs font-bold text-orange-950">Parsing PDF Document</p>
                  <p className="text-[10px] text-stone-500 mt-1">Extracting layout & characters server-side...</p>
                </div>
              ) : (
                <textarea
                  id="custom-paper-textarea"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste the abstract, methodology, or full-text of a research paper here to extract insights (min. 50 characters)..."
                  disabled={isLoading}
                  className="w-full flex-1 min-h-[100px] text-xs text-stone-800 placeholder-stone-400/70 focus:outline-none resize-none bg-transparent leading-relaxed"
                />
              )}
              <span className="text-[10px] text-stone-400 text-right mt-1 font-mono">
                Supports drag-and-drop (.txt, .md, .pdf)
              </span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-stone-300 rounded-lg p-6 bg-stone-50/40 text-center min-h-[140px] shadow-inner">
              <Sparkles className="w-8 h-8 text-orange-500 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-stone-800">Sample Paper Selected</p>
              <p className="text-[10px] text-stone-500 mt-1 max-w-[200px] leading-relaxed">
                Click 'Extract Key Insights' to analyze this paper, or select 'Paste Text' to input your own data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-4 border-t border-[#F4DDD0] bg-[#FAF0E6]/80">
        <button
          id="analyze-paper-action-btn"
          onClick={handleTriggerAnalyze}
          disabled={isLoading || (selectedPaperId === "custom" && !customText.trim())}
          className={`w-full py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 cursor-pointer ${
            isLoading
              ? "bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed animate-pulse"
              : "bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 text-white hover:opacity-95 shadow-[0_4px_14px_rgba(249,115,22,0.3)] active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center py-1">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-stone-800 font-bold">Analyzing Paper...</span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono font-normal mt-1 block max-w-[220px] truncate">
                {loadingStep}
              </span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white fill-current" />
              <span>Extract Key Insights</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
