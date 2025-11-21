import React, { useState } from "react";
import Navbar from "../components/Navbar";
import userImage from "../assets/user_image_default.jpg";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: "Alex Hartman",
    email: "alex.hartman@example.com",
  });

  const [autoStart, setAutoStart] = useState(true);
  const [lang, setLang] = useState("English (US)");
  const [apiKey] = useState("•••••••••••••••••••••••••••••");

  return (
    <div className="min-h-screen bg-[#0c0321] text-white pt-18">

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">

        {/* ================= PROFILE SECTION ================= */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">My Profile</h2>

          <div className="flex items-center gap-6 mb-6">
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="profile"
              className="w-30 h-30 rounded-full"
            />

            <div>
              <p className="font-medium text-lg">Profile Picture</p>
              <p className="text-gray-400 text-sm">Update your photo</p>
            </div>

            <button className="ml-auto bg-[#1E293B] hover:bg-[#243044] px-4 py-2 rounded-md text-sm">
              Upload
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 mb-1 text-sm">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                className="w-full bg-[#1F2430] rounded-md px-4 py-3 text-white border-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 text-sm">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full bg-[#1F2430] rounded-md px-4 py-3 text-white border-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md">
            Update Profile
          </button>
        </section>

        {/* ================= MEETING PREFERENCES ================= */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Default Meeting Preferences</h2>

          <div className="bg-[#1C212D] p-6 rounded-xl space-y-8">
            {/* Auto-start */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Auto-start recording</p>
                <p className="text-gray-400 text-sm">
                  Automatically start recording when a new meeting begins.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={() => setAutoStart(!autoStart)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:bg-blue-600 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Language dropdown */}
            <div>
              <label className="block text-gray-400 mb-1 text-sm">
                Default transcription language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#1F2430] px-4 py-3 rounded-md w-60 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md">
              Save Preferences
            </button>
          </div>
        </section>

        {/* ================= INTEGRATIONS & API ================= */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Integrations & API</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Calendar */}
            <div className="bg-[#1C212D] p-6 rounded-lg flex justify-between  items-center">
              <div className="">
              <p className="text-lg font-semibold">Google Calendar</p>
              <p className="text-green-400 text-sm mt-2">Connected</p>
              </div>
              <button className="mt-4 text-red-400 hover:text-red-500 font-medium">
                Disconnect
              </button>
            </div>

            {/* Slack */}
            <div className="bg-[#1C212D] p-6 rounded-lg flex justify-between  items-center">
              <div>
              <p className="text-lg font-semibold">Slack</p>
              <p className="text-gray-400 text-sm mt-2">Not Connected</p>
              </div>
              <button className="mt-4 bg-gray-700 px-4 py-2 rounded-md  hover:bg-gray-600">
                Connect
              </button>
            </div>
          </div>

          {/* API Key */}
          <div className="mt-8">
            <p className="text-gray-400 text-sm mb-2">
              Use this key to integrate TalkNote with your custom applications.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={apiKey}
                readOnly
                className="flex-1 bg-[#1F2430] px-4 py-3 rounded-md text-lg"
              />

              <button className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600">
                Regenerate
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Profile;
