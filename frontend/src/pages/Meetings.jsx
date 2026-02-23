import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Trash2, FileText, Sparkles, Mic } from "lucide-react";
import { cn } from "../lib/utils";

const MeetingsPage = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [showFullTranscript, setShowFullTranscript] = useState(false);

    useEffect(() => {
        const fetchMeetings = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const token = await getToken();
                const data = await api.fetchSessions(token, user.id);
                setMeetings(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load meetings.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeetings();
    }, [user, getToken]);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening the modal when clicking delete
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;

        try {
            const token = await getToken();
            await api.deleteSession(id, token, user.id);
            setMeetings(meetings.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete meeting.");
        }
    };

    const renderTranscript = (transcriptObj) => {
        if (!transcriptObj) return <p className="text-zinc-500 italic">No transcript available.</p>;

        if (Array.isArray(transcriptObj)) {
            return transcriptObj.map((seg, i) => (
                <div key={i} className="mb-4">
                    <span className="font-semibold text-indigo-400 mr-2 text-sm uppercase tracking-wider">
                        [{seg.start.toFixed(1)}s] {seg.speaker}:
                    </span>
                    <span className="text-zinc-300 leading-relaxed">{seg.text}</span>
                </div>
            ));
        }

        if (typeof transcriptObj === 'string') {
            return <p className="text-zinc-300 leading-relaxed">{transcriptObj}</p>;
        }

        return <p className="text-zinc-500">Invalid transcript format.</p>;
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-black text-zinc-100 pt-24">
            <main className="flex-1 px-6 md:px-12 py-8 relative">
                <div className="max-w-7xl mx-auto">

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-end mb-10">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Meeting History
                            </h1>
                            <p className="text-zinc-500">Review your past conversations and generated AI summaries.</p>
                        </div>

                        {/* Stats Pill */}
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#080808] border border-[#1c1c1c] rounded-full">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-zinc-400 text-sm font-medium">Total Sessions</span>
                            <span className="text-white font-bold ml-1">{meetings.length}</span>
                        </div>
                    </div>

                    {/* Table / List View */}
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#080808]">
                                <table className="min-w-full divide-y divide-[#1c1c1c]">
                                    <thead className="bg-[#111111]">
                                        <tr>
                                            <th className="py-4 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider w-1/4">Meeting Title</th>
                                            <th className="py-4 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider w-1/6">Date</th>
                                            <th className="py-4 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider w-2/4">AI Summary</th>
                                            <th className="py-4 px-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1c1c1c] bg-[#080808]">
                                        {isLoading ? (
                                            <tr><td colSpan="4" className="py-12 text-center text-zinc-500">Loading your history...</td></tr>
                                        ) : error ? (
                                            <tr><td colSpan="4" className="py-12 text-center text-red-400">{error}</td></tr>
                                        ) : meetings.length === 0 ? (
                                            <tr><td colSpan="4" className="py-12 text-center text-zinc-500">No meetings found. Start recording!</td></tr>
                                        ) : (
                                            meetings.map((meeting) => (
                                                <tr
                                                    key={meeting.id}
                                                    onClick={() => {
                                                        setSelectedMeeting(meeting);
                                                        setShowFullTranscript(false);
                                                    }}
                                                    className="hover:bg-[#111111] transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-4 px-6 text-sm font-medium text-white">
                                                        {(meeting.title || 'Untitled').replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, '')}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-zinc-500 whitespace-nowrap">
                                                        {new Date(meeting.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-zinc-400 truncate max-w-xs group-hover:text-zinc-200 transition-colors">
                                                        {meeting.summary || <span className="italic text-zinc-600">Processing summary...</span>}
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-sm">
                                                        <div className="flex justify-end gap-2 isolate">
                                                            <button
                                                                onClick={(e) => handleDelete(meeting.id, e)}
                                                                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors z-10"
                                                                title="Delete Session"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <a
                    href="/LiveMeeting"
                    className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-transform active:scale-95 shadow-accent group z-40"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                    New Session
                </a>
            </main>

            {/* Transcript Modal */}
            <AnimatePresence>
                {selectedMeeting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMeeting(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#080808] border border-[#1c1c1c] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-[#1c1c1c] flex justify-between items-start bg-[#0a0a0a]">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {(selectedMeeting.title || 'Untitled').replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, '')}
                                    </h2>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                                        {new Date(selectedMeeting.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedMeeting(null)}
                                    className="text-zinc-500 hover:text-white transition-colors bg-[#111111] hover:bg-[#1c1c1c] rounded-full p-2"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                                {/* AI Summary Box */}
                                <div className="bg-indigo-500/5 items-start border border-indigo-500/20 rounded-xl p-6 mb-8">
                                    <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                        <Sparkles className="w-4 h-4" />
                                        Executive Summary
                                    </h3>
                                    <p className="text-zinc-300 leading-relaxed text-[15px]">
                                        {selectedMeeting.summary || "Generating summary..."}
                                    </p>
                                </div>

                                {/* Full Transcript Toggle */}
                                <div className="mt-8 border-t border-[#1c1c1c] pt-6 text-left">
                                    <button
                                        onClick={() => setShowFullTranscript(!showFullTranscript)}
                                        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors outline-none"
                                    >
                                        <Mic className="w-4 h-4" />
                                        {showFullTranscript ? "Hide Full Transcript" : "View Full Transcript"}
                                    </button>

                                    {/* Transcript Body */}
                                    <AnimatePresence>
                                        {showFullTranscript && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden mt-4"
                                            >
                                                <div className="space-y-4 bg-[#050505] p-6 rounded-xl border border-[#111111]">
                                                    {renderTranscript(selectedMeeting.transcript)}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MeetingsPage;