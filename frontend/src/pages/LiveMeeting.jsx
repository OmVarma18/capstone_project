import React, { useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";

const LiveMeeting = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError(null);

    try {
      const token = await getToken();
      const result = await api.uploadAudio(file, token); // Assumes api.uploadAudio exists

      // Transform backend result to match UI structure if needed
      // Backend returns { transcript: [{start, end, text, speaker}], speakers: [] }
      const finalTranscript = result.transcript || [];
      const finalSummary = result.summary || "";
      setTranscript(finalTranscript);
      setSummary(finalSummary);

      // PERSISTENCE: Save to localStorage
      const newMeeting = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        date: new Date().toLocaleDateString(),
        transcript: finalTranscript,
        summary: finalSummary,
        tasks: result.tasks || [], // AI generated tasks from backend
      };

      const existing = JSON.parse(localStorage.getItem('talknote_meetings') || '[]');
      localStorage.setItem('talknote_meetings', JSON.stringify([newMeeting, ...existing]));

    } catch (err) {
      console.error(err);
      setUploadError("Failed to process audio. Please try again.");
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
    <div className="relative flex h-screen w-full flex-col bg-[#0c0321] text-white overflow-hidden font-sans pt-18">
      {/* Header */}
      <header className=" flex items-center justify-between border-b border-[#1e0d3f] px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 text-purple-400">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-lg font-semibold">
            {isProcessing ? "Processing Audio..." : "Meeting Transcription"}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-spin' : 'bg-green-500'} `} />
            <span className={`text-sm font-medium ${isProcessing ? 'text-yellow-500' : 'text-green-500'}`}>
              {isProcessing ? "Analyzing" : "Ready"}
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isProcessing ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {isProcessing ? "Please Wait..." : "Upload Audio"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Instructions & Past Sessions */}
        <aside className="w-72 border-r border-[#1e0d3f] p-6 hidden md:flex flex-col overflow-y-auto">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold mb-1 text-purple-400">Past Sessions</h3>
              <div className="space-y-2 mt-4">
                {JSON.parse(localStorage.getItem('talknote_meetings') || '[]').map((m) => (
                  <div key={m.id} className="group relative">
                    <button
                      onClick={() => {
                        setTranscript(m.transcript);
                        setSummary(m.summary || "");
                      }}
                      className="w-full text-left p-3 pr-10 rounded-lg bg-[#1a0938] border border-[#2a1255] hover:border-purple-500 transition-colors text-sm truncate"
                    >
                      {m.title}
                    </button>
                    <button
                      onClick={(e) => deleteMeeting(m.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Session"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
                {JSON.parse(localStorage.getItem('talknote_meetings') || '[]').length === 0 && (
                  <p className="text-xs text-gray-500">No sessions yet.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-base font-semibold mb-1">New Upload</h3>
              <p className="text-sm text-gray-400">
                {transcript.length > 0 ? `${transcript.length} Segments` : "No data yet"}
              </p>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-900/50 border border-red-800 rounded text-sm text-red-200">
                {uploadError}
              </div>
            )}

            <div className="text-sm text-gray-400 space-y-2 border-t border-[#1e0d3f] pt-6">
              <p className="font-semibold text-gray-300">Quick Guide:</p>
              <p>1. Upload a meeting audio</p>
              <p>2. Wait for AI analysis</p>
              <p>3. View tasks in the "Tasks" page</p>
            </div>
          </div>
        </aside>

        {/* Center: Live Transcript */}
        <div className="flex-1 flex flex-col bg-[#0c0321]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {summary && (
              <div className="bg-purple-900/10 border border-purple-500/30 p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-2 mb-3 text-purple-400">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  <h3 className="font-bold uppercase tracking-wider text-xs">AI Summary</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg italic font-medium">
                  "{summary}"
                </p>
              </div>
            )}


            {transcript.length === 0 && !isProcessing && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                <p>Upload a file to see the transcript here.</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center justify-center h-full text-purple-400 animate-pulse">
                <span className="material-symbols-outlined text-4xl mb-2">graphic_eq</span>
                <p>AI is listening and analyzing...</p>
              </div>
            )}

            {transcript.map((seg, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 text-xs font-bold ring-1 ring-purple-500/30">
                  {seg.speaker ? seg.speaker.replace('SPEAKER_', '') : '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-purple-300">
                      {seg.speaker || "Unknown Speaker"}
                    </p>
                    <p className="text-sm text-gray-500">
                      [{formatTime(seg.start)}]
                    </p>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{seg.text}</p>
                </div>
              </div>
            ))}

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