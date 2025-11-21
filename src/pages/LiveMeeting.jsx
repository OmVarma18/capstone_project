import React from "react";

const LiveMeeting = () => {
  return (
    <div className="relative flex h-screen w-full flex-col bg-[#0c0321] text-white overflow-hidden font-sans pt-18">
      {/* Header */}
      <header className=" flex items-center justify-between border-b border-[#1e0d3f] px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 text-purple-400">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Project Phoenix - Weekly Sync</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-500">Live</span>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
            End Meeting
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Speakers */}
        <aside className="w-64 border-r border-[#1e0d3f] p-6 hidden md:flex flex-col">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold mb-1">Speakers</h3>
              <p className="text-sm text-gray-400">2 Participants</p>
            </div>
            <div className="flex flex-col gap-3">
              {/* Speaker 1 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a0938]">
                <div
                  className="w-10 h-10 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaITrUm3KPsIyXU7iRKPvmcyOAKFHOBLXZjNZrtCXnPZiqfBPNw0iyJapp4AA-gjZQiZK9mZ5J583vEAYMirFSb7KcbvwoDPzzoBPfVadaNrJN_zO56Gfxy1iCqlv7vULueuZNdbuMb0ChC-dXlsJyod2257186V7GH4ORMOzjGpVWuNNnM_HOur_sACQrerS31rj5MqVyJGQcL4s9m255ZunRBWZ9w9A1NoPYnVUEFpqFxzMR4N9c56EOEaFH167OPLMRjoH_baA')",
                  }}
                  aria-label="Avatar for Jane Doe"
                />
                <div>
                  <p className="text-sm font-medium">Jane Doe</p>
                  <p className="text-xs text-gray-400">(Host)</p>
                </div>
              </div>
              {/* Speaker 2 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a0938]">
                <div
                  className="w-10 h-10 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByykYPN7kQHnWuapDsVroO1YAdKrUPwVd97jWBSM_dAGHzrxDVBCMn1AsALxP9qX0dgF2u_j6S__gFWOXsGs_MwJ-9peOLy_Vre0v7rnAfVAbT5p9x7QtA51TrEttZeUk0zYd7vfg7Iyw3M034p56TqRBJ1ia_9bdfZDlGEn0g5_exCwXRkzHuAw7CEYop_El-CdsZnkQZ90KFPqTpKc8m3IPeheqUFlrM2-vpneeqtN7C-t_rionlaVmHRpuCk7dmY0veML64l14')",
                  }}
                  aria-label="Avatar for John Smith"
                />
                <p className="text-sm font-medium">John Smith</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Live Transcript */}
        <div className="flex-1 flex flex-col bg-[#0c0321]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Transcript Entry 1 */}
            <div className="flex gap-4">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSb0eR1Yt14ShcsmC_dZQaEYSytNUHLOWuYudrGRByTieJ_XvCZwQzv8il0S7MoTUGoud3b-yJN3_MEuXHHNMdHK1qpIno5tLw2E75DPl8lrzTzR8g1_C6ZSeWHxjId0mseetdFG2AXLRAYihhlnP92csu9jCaW3IJklXQdld-R8zg_Hv8Ci7YjugK3zIZ5SmSyeoVzuS6I3t-d47UENfrWF-ZfZ6ZjjDnH-1GZzK5DpVHq0plmTam4Kh1mN3cJspV9W7US6IsKds')",
                }}
                aria-label="Avatar for Jane Doe"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-sm text-gray-400">[00:05:12]</p>
                </div>
                <p className="text-gray-200">Let's circle back on the Q3 roadmap.</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1e0d3f] my-4"></div>

            {/* Transcript Entry 2 */}
            <div className="flex gap-4">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDo6nRAX9fFON5fVx1jBxJLu43PIRY3xavqm72RKOMt9zDhueeY3DhqOKEylqS8GcMA0WEJ1th7BGUAh8DJLsfdVVIEp0xTM672dZPoCTlG-z7hwnyMLHRwDTM_kA8g3KGLLjV38ds8kN1Ituf3aquRgZEFm_nfGR6wGpL1eLsEfk08G4yKQ99mQi6RjVlze_L91_XQSr4GDb7DAyQuRfqadonrHqDnETxcLdF1O6B3bTowLsysVEcVKIG5iqHf7NXF0gt5YN9g0A')",
                }}
                aria-label="Avatar for John Smith"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">John Smith</p>
                  <p className="text-sm text-gray-400">[00:05:45]</p>
                </div>
                <p className="text-gray-200">Sounds good. I'll need to finalize the budget report first.</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1e0d3f] my-4"></div>

            {/* Transcript Entry 3 */}
            <div className="flex gap-4">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVO7ld1HAQgVF2z85P5AkGoHAbOJzMKwzkzcbfm7viuI_k8rUnBwnA2Qb_9MFKhwPKEqgFj_k6zpya3F08i6FNUdeO6GAbMlsO4tZaSe_H4FHNc6MZDITm37fRq-IVJoTT_sr7Ns0CRM4l7tZwUZL1NP2_qffDv1U9FmFV0Ukqs2Obn3Bd5ZkFP9CdO7Zv8a0oPX6itZCY6NDs-VUEnhs9YIy6yzbumUOy1jNBbtoYeCmya60q9M8XVL-stCxvvmWo_-q1RcCKRvg')",
                }}
                aria-label="Avatar for Jane Doe"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-sm text-gray-400">[00:06:18]</p>
                </div>
                <p className="text-gray-200">
                  Okay, please get that to me by end of day Friday. We need to present the consolidated plan next Monday.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <footer className="flex items-center justify-between border-t border-[#1e0d3f] px-6 py-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1a0938] hover:bg-[#241044] rounded-lg text-sm font-medium transition-colors">
              <span className="material-symbols-outlined text-base">mic</span>
              <span>Mute</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1a0938] hover:bg-[#241044] rounded-lg text-sm font-medium transition-colors">
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export</span>
            </button>
          </footer>
        </div>

        {/* Right Sidebar: AI Insights */}
        <aside className="w-80 border-l border-[#1e0d3f] p-6 space-y-6 overflow-y-auto hidden lg:block">
          {/* Live Summary Card */}
          <div className="rounded-lg bg-[#1a0938] border border-[#2a1255] p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-purple-400 mb-1">AI Insights</p>
              <p className="text-lg font-semibold">Live Summary</p>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
              <li>Discussion on Q3 roadmap.</li>
              <li>Budget concerns raised for new marketing campaign.</li>
              <li>Consolidated plan presentation scheduled for next Monday.</li>
            </ul>
          </div>

          {/* Action Items Card */}
          <div className="rounded-lg bg-[#1a0938] border border-[#2a1255] p-4">
            <p className="text-lg font-semibold mb-4">Action Items</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-gray-600 bg-gray-800"
                  id="action-1"
                />
                <label htmlFor="action-1" className="flex flex-col">
                  <span className="text-sm">John to finalize the budget report by EOD Friday.</span>
                  <span className="text-xs text-gray-400 mt-1">Assignment: John Smith</span>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-gray-600 bg-gray-800"
                  id="action-2"
                />
                <label htmlFor="action-2" className="flex flex-col">
                  <span className="text-sm">Jane to prepare slides for Monday's presentation.</span>
                  <span className="text-xs text-gray-400 mt-1">Assignment: Jane Doe</span>
                </label>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LiveMeeting;