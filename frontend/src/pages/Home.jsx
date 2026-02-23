import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Hero from "../sections/Hero";
import BentoBox from "../sections/BentoBox";
import FinalCTA from "../sections/FinalCTA";
import { Mic, CheckSquare, History, PlusCircle, Settings } from 'lucide-react';
import { api } from "../services/api";

const Home = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [stats, setStats] = useState({ meetings: 0, tasks: 0 });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isSignedIn || !user) return;
      try {
        const token = await getToken();
        // Since we added caching in api.js, this will be super fast and avoid redundant calls
        const fetchedMeetings = await api.fetchSessions(token, user.id);

        let pendingTasks = 0;

        fetchedMeetings.forEach(session => {
          const sessionTasks = session.tasks || [];
          sessionTasks.forEach(t => {
            if (!t.completed && t.status !== 'Completed') {
              pendingTasks++;
            }
          })
        });

        setStats({
          meetings: fetchedMeetings.length,
          tasks: pendingTasks,
        });

        // Sort by date descending and take top 3
        const sorted = [...fetchedMeetings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentMeetings(sorted.slice(0, 3));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(true);
      }
    };

    fetchDashboardData();
  }, [isSignedIn, user, getToken]);

  // UN-AUTHENTICATED: The New Antigravity Landing Page
  if (!isSignedIn) {
    return (
      <div className="bg-black text-zinc-100 min-h-screen">
        <Hero />
        <BentoBox />
        <FinalCTA />
      </div>
    );
  }

  // AUTHENTICATED: The Restyled Pure Black Dashboard
  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Welcome Section */}
        <header className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white"
          >
            Welcome back, <span className="text-zinc-400">{user.firstName}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 text-lg"
          >
            Here's what's happening with your meetings today.
          </motion.p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#080808] border border-[#1c1c1c] p-8 rounded-2xl hover:border-[#2e2e2e] transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 font-medium mb-1">Total Sessions</p>
                <h3 className="text-4xl font-bold text-white">{stats.meetings}</h3>
              </div>
              <div className="bg-[#111111] border border-[#1c1c1c] p-3 rounded-xl text-zinc-400 group-hover:text-white transition-colors">
                <History className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#080808] border border-[#1c1c1c] p-8 rounded-2xl hover:border-indigo-500/50 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 font-medium mb-1">Pending Tasks</p>
                <h3 className="text-4xl font-bold text-indigo-400">{stats.tasks}</h3>
              </div>
              <div className="bg-[#111111] border border-[#1c1c1c] p-3 rounded-xl text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Recent Sessions</h2>
              <Link to="/Meetings" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                View All &rarr;
              </Link>
            </div>

            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12 text-center h-64 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-red-400 text-xl font-bold">!</span>
                </div>
                <p className="text-red-400 font-medium mb-1">Database Connection Failed</p>
                <p className="text-red-400/80 text-sm max-w-sm">
                  Unable to reach the server. Please check if your local backend is running properly.
                </p>
              </div>
            ) : recentMeetings.length === 0 ? (
              <div className="bg-[#080808] border border-dashed border-[#2e2e2e] rounded-2xl p-12 text-center h-64 flex flex-col items-center justify-center">
                <p className="text-zinc-500 mb-6">No meetings recorded yet.</p>
                <Link to="/LiveMeeting" className="bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-zinc-200 transition-colors">
                  Start First Meeting
                </Link>
              </div>
            ) : (
              recentMeetings.map((meeting, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={meeting.id}
                  className="bg-[#080808] border border-[#1c1c1c] p-6 rounded-xl flex items-center justify-between hover:bg-[#111111] hover:border-[#2e2e2e] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#111111] border border-[#1c1c1c] rounded-full flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-zinc-100">{meeting.title}</h4>
                      <p className="text-sm text-zinc-500">
                        {new Date(meeting.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 text-zinc-600 group-hover:text-indigo-400 transition-colors">
                    &rarr;
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Side Column: Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/LiveMeeting" className="flex items-center gap-4 bg-[#111111] border border-[#1c1c1c] p-4 rounded-xl font-medium text-zinc-100 hover:border-indigo-500/50 hover:bg-[#1a1a1a] transition-colors group">
                <PlusCircle className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                New Session
              </Link>
              <Link to="/Tasks" className="flex items-center gap-4 bg-[#080808] border border-[#1c1c1c] p-4 rounded-xl font-medium text-zinc-100 hover:border-[#2e2e2e] hover:bg-[#111111] transition-colors group">
                <CheckSquare className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                View Action Items
              </Link>
              <Link to="/Profile" className="flex items-center gap-4 bg-[#080808] border border-[#1c1c1c] p-4 rounded-xl font-medium text-zinc-100 hover:border-[#2e2e2e] hover:bg-[#111111] transition-colors group">
                <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                App Settings
              </Link>
            </div>

            <div className="mt-8 bg-[#080808] border border-[#1c1c1c] p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none" />
              <h4 className="font-semibold text-zinc-300 mb-2 relative z-10">Pro Tip</h4>
              <p className="text-sm text-zinc-500 leading-relaxed relative z-10">
                Upload clean audio files for the best transcription accuracy. AI works best with minimal background noise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;