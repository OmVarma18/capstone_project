import React from "react";

const Tasks = () => {
  return (
    <div className="min-h-screen bg-[#0c0321] text-white font-display pt-18">
      {/* Main Content */}
      <main className="flex h-full grow flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">
              My Tasks
            </h1>
            <button className="flex items-center justify-center gap-2 px-4 py-2 h-10 rounded-lg bg-purple-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-purple-700 transition-colors">
              <span className="material-symbols-outlined">Add New Task</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-grow">
              <div className="flex w-full items-stretch rounded-lg h-12">
                <div className="text-gray-400 flex border border-[#2a1255] bg-[#1a0938] items-center justify-center px-4 rounded-l-lg">
                  <span className="material-symbols-outlined">Search</span>
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-1 focus:ring-purple-500 border border-l-0 border-[#2a1255] bg-[#1a0938] h-full placeholder:text-gray-400 px-4 rounded-l-none text-base font-normal leading-normal"
                  placeholder="Search by task name..."
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-3">
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#1a0938] border border-[#2a1255] pl-4 pr-2 text-sm font-medium leading-normal hover:border-purple-500 transition-colors">
                <span>Assignee</span>
                <span className="material-symbols-outlined text-gray-400">arrow_drop_down</span>
              </button>
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#1a0938] border border-[#2a1255] pl-4 pr-2 text-sm font-medium leading-normal hover:border-purple-500 transition-colors">
                <span>Status</span>
                <span className="material-symbols-outlined text-gray-400">arrow_drop_down</span>
              </button>
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#1a0938] border border-[#2a1255] pl-4 pr-2 text-sm font-medium leading-normal hover:border-purple-500 transition-colors">
                <span>Due Date</span>
                <span className="material-symbols-outlined text-gray-400">arrow_drop_down</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-[#2a1255] bg-[#1a0938]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0c0321]">
                    <th className="px-4 py-3 text-left w-12">
                      <span className="font-medium text-sm">Check</span>

                      {/* <input
                        className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        type="checkbox"
                      /> */}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-2/5">
                      Task Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Meeting Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Assignee
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Task 1 */}
                  <tr className="border-t border-[#2a1255] hover:bg-[#241044] transition-colors">
                    <td className="h-[72px] px-4 py-2 text-center">
                      <input
                        className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        type="checkbox"
                      />
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      Finalize Q3 budget report
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Q3 Financial Planning
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Alice Johnson
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      2023-09-15
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      <div className="inline-flex items-center justify-center rounded-full py-1 px-3 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        In Progress
                      </div>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-gray-300 text-center">
                      <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-base">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                  {/* Task 2 */}
                  <tr className="border-t border-[#2a1255] hover:bg-[#241044] transition-colors">
                    <td className="h-[72px] px-4 py-2 text-center">
                      <input
                        className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        type="checkbox"
                      />
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      Draft initial marketing campaign brief
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Project Phoenix Kickoff
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      David Chen
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      2023-09-20
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      <div className="inline-flex items-center justify-center rounded-full py-1 px-3 text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        To Do
                      </div>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-gray-300 text-center">
                      <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-base">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                  {/* Task 3 */}
                  <tr className="border-t border-[#2a1255] hover:bg-[#241044] transition-colors">
                    <td className="h-[72px] px-4 py-2 text-center">
                      <input
                        checked
                        className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        type="checkbox"
                      />
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300 line-through">
                      Review user feedback from survey
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Weekly Sync - Product Team
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Sophia Martinez
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      2023-09-12
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      <div className="inline-flex items-center justify-center rounded-full py-1 px-3 text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        Completed
                      </div>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-gray-300 text-center">
                      <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-base">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                  {/* Task 4 */}
                  <tr className="border-t border-[#2a1255] hover:bg-[#241044] transition-colors">
                    <td className="h-[72px] px-4 py-2 text-center">
                      <input
                        className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        type="checkbox"
                      />
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      Schedule follow-up with client
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Client Onboarding - Acme Corp
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Alice Johnson
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      2023-09-18
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      <div className="inline-flex items-center justify-center rounded-full py-1 px-3 text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        To Do
                      </div>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-gray-300 text-center">
                      <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-base">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                  {/* Task 5 */}
                  <tr className="border-t border-[#2a1255] hover:bg-[#241044] transition-colors">
                    <td className="h-[72px] px-4 py-2 text-center">
                      <input
                        className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        type="checkbox"
                      />
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      Update server deployment scripts
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Engineering Standup
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      Michael Brown
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal text-gray-300">
                      2023-09-14
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal">
                      <div className="inline-flex items-center justify-center rounded-full py-1 px-3 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        In Progress
                      </div>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-gray-300 text-center">
                      <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-base">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-gray-300">
              Showing 1 to 5 of 24 results
            </p>
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a1255] bg-[#1a0938] text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500 bg-purple-500/20 text-purple-400 text-sm font-bold">
                1
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a1255] bg-[#1a0938] text-sm text-gray-300 hover:border-purple-500 hover:text-purple-400 transition-colors">
                2
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a1255] bg-[#1a0938] text-sm text-gray-300 hover:border-purple-500 hover:text-purple-400 transition-colors">
                3
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a1255] bg-[#1a0938] text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tasks;