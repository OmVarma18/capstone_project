import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Hero from "../sections/Hero";

const Home = () => {
  const { isSignedIn, user } = useUser();
  const [stats, setStats] = useState({ meetings: 0, tasks: 0 });
  const [recentMeetings, setRecentMeetings] = useState([]);

  useEffect(() => {
    if (isSignedIn) {
      const meetings = JSON.parse(localStorage.getItem("talknote_meetings") || "[]");
      const allTasks = meetings.flatMap((m) => m.tasks || []);
      const pendingTasks = allTasks.filter((t) => !t.completed).length;

      setStats({
        meetings: meetings.length,
        tasks: pendingTasks,
      });
      setRecentMeetings(meetings.slice(0, 3));
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="bg-[#09031c]">
        <Hero />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0321] text-white pt-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Welcome back, <span className="text-purple-400">{user.firstName}</span>!
          </h1>
          <p className="text-gray-400 text-lg">
            Here's what's happening with your meetings today.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1a0938] border border-[#2a1255] p-8 rounded-2xl hover:border-purple-500 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-medium mb-1">Total Sessions</p>
                <h3 className="text-4xl font-bold">{stats.meetings}</h3>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">history</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0938] border border-[#2a1255] p-8 rounded-2xl hover:border-blue-500 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-medium mb-1">Pending Tasks</p>
                <h3 className="text-4xl font-bold text-blue-400">{stats.tasks}</h3>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">checklist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Sessions</h2>
              <Link to="/LiveMeeting" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                View All →
              </Link>
            </div>

            {recentMeetings.length === 0 ? (
              <div className="bg-[#1a0938]/30 border-2 border-dashed border-[#2a1255] rounded-2xl p-12 text-center h-64 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">No meetings recorded yet.</p>
                <Link to="/LiveMeeting" className="bg-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition">
                  Start First Meeting
                </Link>
              </div>
            ) : (
              recentMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-[#1a0938] border border-[#2a1255] p-6 rounded-xl flex items-center justify-between hover:bg-[#241044] transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center text-purple-400">
                      <span className="material-symbols-outlined">mic</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{meeting.title}</h4>
                      <p className="text-sm text-gray-400">{meeting.date}</p>
                    </div>
                  </div>
                  <Link to="/LiveMeeting" className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Side Column: Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/LiveMeeting" className="flex items-center gap-4 bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-xl font-bold hover:opacity-90 transition">
                <span className="material-symbols-outlined">add_circle</span>
                New Session
              </Link>
              <Link to="/Tasks" className="flex items-center gap-4 bg-[#1a0938] border border-[#2a1255] p-5 rounded-xl font-bold hover:border-purple-500 transition">
                <span className="material-symbols-outlined">assignment</span>
                View Action Items
              </Link>
              <Link to="/Profile" className="flex items-center gap-4 bg-[#1a0938] border border-[#2a1255] p-5 rounded-xl font-bold hover:border-purple-500 transition">
                <span className="material-symbols-outlined">settings</span>
                App Settings
              </Link>
            </div>

            <div className="mt-8 bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl">
              <h4 className="font-bold text-purple-400 mb-2">Pro Tip 💡</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Upload clean audio files for the best transcription accuracy. AI works best with minimal background noise!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;