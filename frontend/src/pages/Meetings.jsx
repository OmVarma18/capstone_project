import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";

const MeetingsPage = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;

        try {
            const token = await getToken();
            await api.deleteSession(id, token, user.id);
            // Remove from local state
            setMeetings(meetings.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete meeting.");
        }
    };

    const renderTranscript = (transcriptObj) => {
        if (!transcriptObj) return <p className="text-gray-400">No transcript available.</p>;

        // Handle array of segment objects
        if (Array.isArray(transcriptObj)) {
            return transcriptObj.map((seg, i) => (
                <div key={i} className="mb-4">
                    <span className="font-bold text-purple-400 mr-2">[{seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s] {seg.speaker}:</span>
                    <span className="text-gray-200">{seg.text}</span>
                </div>
            ));
        }

        // Handle plain string fallback
        if (typeof transcriptObj === 'string') {
            return <p className="text-gray-200">{transcriptObj}</p>;
        }

        return <p className="text-gray-400">Invalid transcript format.</p>;
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#0c0321] text-white font-display pt-18">

            <main className="flex-1 p-10 overflow-auto relative">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-wrap justify-between gap-6 items-center mb-8">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                            My Meetings
                        </h1>

                        {/* Stats Cards */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-2 rounded-lg p-4 bg-[#1a0938] border border-[#2a1255] min-w-[200px]">
                                <p className="text-gray-300 text-sm font-medium leading-normal">
                                    Total Meetings
                                </p>
                                <p className="text-white text-2xl font-bold leading-tight">
                                    {meetings.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters Section */}
                    {/* ... Search input remains visually the same but non-functional for MVP ... */}

                    {/* Meetings Table */}
                    <div className="mt-8 overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden rounded-xl border border-[#2a1255]">
                                <table className="min-w-full divide-y divide-[#2a1255]">
                                    <thead className="bg-[#1a0938]">
                                        <tr>
                                            <th className="py-3.5 px-6 text-left text-sm font-semibold text-gray-300" scope="col">
                                                Meeting Title
                                            </th>
                                            <th className="py-3.5 px-6 text-left text-sm font-semibold text-gray-300" scope="col">
                                                Date
                                            </th>
                                            <th className="py-3.5 px-6 text-left text-sm font-semibold text-gray-300" scope="col">
                                                Summary
                                            </th>
                                            <th className="relative py-3.5 px-6" scope="col">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2a1255] bg-[#0c0321]">
                                        {isLoading && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-400">Loading meetings...</td>
                                            </tr>
                                        )}
                                        {error && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-red-400">{error}</td>
                                            </tr>
                                        )}
                                        {!isLoading && !error && meetings.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-400">No meetings found. Start one!</td>
                                            </tr>
                                        )}
                                        {!isLoading && meetings.map((meeting) => (
                                            <tr key={meeting.id} className="hover:bg-[#1a0938]/50 transition-colors">
                                                <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-white">
                                                    {(meeting.title || 'Untitled').replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, '')}
                                                </td>
                                                <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                    {new Date(meeting.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-300 max-w-xs truncate cursor-pointer hover:text-purple-300 transition-colors" onClick={() => setSelectedMeeting(meeting)}>
                                                    {meeting.summary || "No summary available."}
                                                </td>
                                                <td className="whitespace-nowrap py-4 px-6 text-right text-sm font-medium space-x-2">
                                                    <button onClick={() => setSelectedMeeting(meeting)} className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                        <span className="material-symbols-outlined text-xl">description</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(meeting.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                        <span className="material-symbols-outlined text-xl">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <button className="absolute bottom-10 right-10 flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors z-0">
                    <a className=" text-md py-2 px-4 flex items-center" href="/LiveMeeting"> Start new meeting +</a>
                </button>
            </main>

            {/* Transcript Modal */}
            {selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#1a0938] border border-[#2a1255] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#2a1255] flex justify-between items-start bg-[#0c0321]">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{(selectedMeeting.title || 'Untitled').replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, '')}</h2>
                                <p className="text-sm text-gray-400">{new Date(selectedMeeting.created_at).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMeeting(null)}
                                className="text-gray-400 hover:text-red-400 transition-colors bg-[#1a0938] hover:bg-[#2a1255] rounded-full p-2"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                            {/* Summary Box */}
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-5 mb-8">
                                <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                    AI Summary
                                </h3>
                                <p className="text-gray-200 leading-relaxed text-lg">
                                    {selectedMeeting.summary || "Generating summary..."}
                                </p>
                            </div>

                            {/* Full Transcript */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 border-b border-[#2a1255] pb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">record_voice_over</span>
                                    Full Conversation
                                </h3>
                                <div className="space-y-4">
                                    {renderTranscript(selectedMeeting.transcript)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MeetingsPage;