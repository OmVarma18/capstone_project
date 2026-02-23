import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Settings, User as UserIcon, Globe, Webhook, MonitorPlay } from "lucide-react";
import { cn } from "../lib/utils";

const Profile = () => {
  const { user } = useUser();
  const [autoStart, setAutoStart] = useState(true);
  const [lang, setLang] = useState("English (US)");

  // Local state for form
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");

  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-zinc-100 pt-24">
      <main className="max-w-4xl mx-auto px-6 py-8 w-full">

        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-400" />
            Account Settings
          </h1>
          <p className="text-zinc-500">Manage your profile, preferences, and integrations.</p>
        </header>

        <div className="space-y-8">

          {/* ================= PROFILE SECTION ================= */}
          <section className="bg-[#080808] border border-[#1c1c1c] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-zinc-400" />
              Personal Information
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-[#1c1c1c]">
              <div className="w-20 h-20 rounded-full bg-[#111111] border border-[#2e2e2e] overflow-hidden flex items-center justify-center shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-zinc-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-white mb-1">Profile Avatar</p>
                <p className="text-zinc-500 text-sm mb-4">Update your avatar through your auth provider.</p>
                <button className="px-4 py-2 border border-[#2e2e2e] rounded-lg text-sm font-medium hover:bg-[#111111] hover:text-white transition-colors">
                  Manage Avatar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#111111] border border-[#1c1c1c] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full bg-[#050505] border border-[#1c1c1c] rounded-lg px-4 py-2.5 text-zinc-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors active:scale-95">
                Save Changes
              </button>
            </div>
          </section>

          {/* ================= PREFERENCES ================= */}
          <section className="bg-[#080808] border border-[#1c1c1c] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-zinc-400" />
              Capture Preferences
            </h2>

            <div className="space-y-6">
              {/* Auto-start Toggle */}
              <div className="flex items-center justify-between py-4 border-b border-[#1c1c1c]">
                <div>
                  <p className="font-medium text-white">Auto-start recording</p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Immediately begin capturing audio when opening the Live Meeting page.
                  </p>
                </div>

                <button
                  onClick={() => setAutoStart(!autoStart)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black hover:cursor-pointer",
                    autoStart ? "bg-indigo-500" : "bg-zinc-800"
                  )}
                >
                  <span className="sr-only">Enable auto-start</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      autoStart ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Language Select */}
              <div className="pt-2">
                <label className="block text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Default Transcription Language
                </label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full md:w-64 bg-[#111111] border border-[#1c1c1c] px-4 py-2.5 rounded-lg text-white focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
          </section>

          {/* ================= INTEGRATIONS ================= */}
          <section className="bg-[#080808] border border-[#1c1c1c] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Webhook className="w-5 h-5 text-zinc-400" />
              Integrations & API
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {/* Calendar */}
              <div className="bg-[#111111] border border-[#1c1c1c] p-5 rounded-xl flex items-center justify-between group hover:border-[#2e2e2e] transition-colors">
                <div>
                  <p className="font-semibold text-white">Google Calendar</p>
                  <p className="text-indigo-400 text-sm mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Connected
                  </p>
                </div>
                <button className="text-sm font-medium text-zinc-500 hover:text-red-400 transition-colors">
                  Disconnect
                </button>
              </div>

              {/* Slack */}
              <div className="bg-[#111111] border border-[#1c1c1c] p-5 rounded-xl flex items-center justify-between group hover:border-[#2e2e2e] transition-colors">
                <div>
                  <p className="font-semibold text-white">Slack</p>
                  <p className="text-zinc-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Not Connected
                  </p>
                </div>
                <button className="px-4 py-1.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors active:scale-95">
                  Connect
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Profile;
