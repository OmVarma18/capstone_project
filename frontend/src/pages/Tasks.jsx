import React, { useState, useEffect } from "react";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Load tasks from all meetings in localStorage
    const meetings = JSON.parse(localStorage.getItem('talknote_meetings') || '[]');
    const allTasks = meetings.flatMap(m =>
      (m.tasks || []).map(t => ({
        ...t,
        meetingTitle: m.title,
        meetingId: m.id
      }))
    );
    setTasks(allTasks);
  }, []);

  const toggleTask = (meetingId, taskTitle) => {
    const meetings = JSON.parse(localStorage.getItem('talknote_meetings') || '[]');
    const updated = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          tasks: m.tasks.map(t =>
            t.title === taskTitle ? { ...t, completed: !t.completed } : t
          )
        };
      }
      return m;
    });
    localStorage.setItem('talknote_meetings', JSON.stringify(updated));

    // Refresh local state
    const allTasks = updated.flatMap(m =>
      (m.tasks || []).map(t => ({
        ...t,
        meetingTitle: m.title,
        meetingId: m.id
      }))
    );
    setTasks(allTasks);
  };

  return (
    <div className="min-h-screen bg-[#0c0321] text-white font-display pt-18">
      <main className="flex h-full grow flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">
              Action Items
            </h1>
            <p className="text-gray-400">Total Tasks: {tasks.length}</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#2a1255] bg-[#1a0938]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0c0321]">
                    <th className="px-4 py-3 text-left w-12">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Task Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Meeting</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Assignee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                        No tasks found. Upload a meeting audio to generate tasks!
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task, idx) => (
                      <tr key={idx} className="border-t border-[#2a1255] hover:bg-[#241044] transition-colors">
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={task.completed || task.status === 'Completed'}
                            onChange={() => toggleTask(task.meetingId, task.title)}
                            className="h-5 w-5 rounded border-[#2a1255] bg-[#1a0938] text-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className={`px-4 py-4 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {task.title}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400">
                          {task.meetingTitle}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {task.assignee || 'Unassigned'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {task.due || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tasks;