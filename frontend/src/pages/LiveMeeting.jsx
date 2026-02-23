import React, { useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";
import { Mic, Upload, Trash2, Sparkles, Loader2, FileAudio, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const LiveMeeting = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError(null);

    try {
      const token = await getToken();
      // Pass user.id for database routing
      const result = await api.uploadAudio(file, token, user.id);

      // Instead of getting the transcript immediately, we get a success message
      // that the job was queued in GitHub Actions.
      if (result.status === 'processing') {
        setSummary("🎉 Audio uploaded successfully! The AI is processing it in the background. This usually takes 2-3 minutes. You can safely leave this page and check the 'History' tab later.");
        setTranscript([]);
      }

    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteMeeting = (id, e) => {
    e.stopPropagation(); // Prevent selecting the meeting when clicking delete
    if (window.confirm("Are you sure you want to delete this session?")) {
      const existing = JSON.parse(localStorage.getItem('talknote_meetings') || '[]');
      const updated = existing.filter(m => m.id !== id);
      localStorage.setItem('talknote_meetings', JSON.stringify(updated));

      // Clear current view if the deleted meeting was active
      setTranscript([]);
      setSummary("");
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-black text-zinc-100 overflow-hidden pt-20">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#1c1c1c] bg-[#080808]/50 backdrop-blur-md px-6 py-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#2e2e2e] flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {isProcessing ? "Processing Audio..." : "Record & Analyze"}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isProcessing ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
            <span className={cn("text-sm font-medium", isProcessing ? "text-amber-400" : "text-emerald-500")}>
              {isProcessing ? "Analyzing..." : "Ready to Input"}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />

          <button
            onClick={triggerFileInput}
            disabled={isProcessing}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              isProcessing
                ? "bg-[#111111] text-zinc-500 border border-[#1c1c1c] cursor-not-allowed"
                : "bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-lg shadow-white/5"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isProcessing ? "Uploading..." : "Upload Audio"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">

        {/* Left Sidebar: Past Sessions */}
        <aside className="w-80 border-r border-[#1c1c1c] bg-[#080808]/30 p-6 hidden lg:flex flex-col overflow-y-auto">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold mb-4 text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4" />
                Recent Sessions
              </h3>

              <div className="space-y-2">
                <AnimatePresence>
                  {JSON.parse(localStorage.getItem('talknote_meetings') || '[]').map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => {
                          setTranscript(m.transcript);
                          setSummary(m.summary || "");
                        }}
                        className="w-full text-left p-4 pr-10 rounded-xl bg-[#080808] border border-[#1c1c1c] hover:border-[#2e2e2e] hover:bg-[#111111] transition-all text-sm group-active:scale-[0.98]"
                      >
                        <p className="font-medium text-white truncate mb-1">{m.title}</p>
                        <p className="text-xs text-zinc-500 truncate">
                          {m.transcript?.length || 0} segments transcribed
                        </p>
                      </button>
                      <button
                        onClick={(e) => deleteMeeting(m.id, e)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {JSON.parse(localStorage.getItem('talknote_meetings') || '[]').length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-[#1c1c1c] text-center">
                    <p className="text-sm text-zinc-500">No sessions yet.</p>
                  </div>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p>{uploadError}</p>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-[#1c1c1c]">
              <h3 className="text-sm font-semibold mb-3 text-zinc-400">Quick Guide</h3>
              <ul className="text-sm text-zinc-500 space-y-2">
                <li className="flex gap-2"><span className="text-indigo-400">1.</span> Upload a meeting audio file</li>
                <li className="flex gap-2"><span className="text-indigo-400">2.</span> Wait for background AI analysis</li>
                <li className="flex gap-2"><span className="text-indigo-400">3.</span> View results in History & Tasks</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Center: Live Transcript Area */}
        <div className="flex-1 flex flex-col bg-black relative">

          {/* Subtle Background Elements */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

          <div className="flex-1 overflow-y-auto px-6 py-10 lg:px-12 z-10">
            <div className="max-w-3xl mx-auto space-y-8">

              <AnimatePresence mode="wait">
                {/* AI Summary Card */}
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-indigo-500/5 border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />

                    <div className="flex items-center gap-2 mb-4 text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="font-semibold uppercase tracking-wider text-xs">AI Executive Summary</h3>
                    </div>
                    <p className="text-zinc-200 leading-relaxed text-lg font-medium relative z-10">
                      "{summary}"
                    </p>
                  </motion.div>
                )}

                {/* Empty State */}
                {transcript.length === 0 && !isProcessing && !summary && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 select-none"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#080808] border border-[#1c1c1c] flex items-center justify-center mb-6 shadow-2xl relative">
                      <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping pulse-slow" />
                      <FileAudio className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Ready to Analyze</h3>
                    <p className="text-center max-w-sm">Upload an audio or video file to generate a transcript, summary, and action items.</p>
                  </motion.div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[60vh] text-indigo-400 select-none"
                  >
                    <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                      <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400/50 animate-spin-reverse" />
                      <Mic className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Analyzing Audio Structure</h3>
                    <p className="text-zinc-500 text-center max-w-sm">
                      Our pipelines are currently transcribing your file. This may take a few moments.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transcript Bubbles */}
              <div className="space-y-6 pb-20">
                {transcript.map((seg, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index}
                    className="flex gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2e2e2e] flex items-center justify-center shrink-0 text-xs font-bold text-zinc-300 group-hover:border-indigo-500/50 transition-colors shadow-sm">
                      {seg.speaker ? seg.speaker.replace('SPEAKER_', '') : '?'}
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="flex items-center gap-3 mb-1.5 px-1">
                        <p className="font-semibold text-zinc-200 text-sm">
                          {seg.speaker || "Unknown Speaker"}
                        </p>
                        <p className="text-xs font-mono text-zinc-600">
                          {formatTime(seg.start)}
                        </p>
                      </div>
                      <div className="bg-[#080808] border border-[#1c1c1c] p-4 rounded-2xl rounded-tl-sm text-zinc-300 leading-relaxed shadow-sm">
                        {seg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper to format seconds to MM:SS
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
};

export default LiveMeeting;