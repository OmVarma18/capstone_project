import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";

const Tasks = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const token = await getToken();
        // Fetch all sessions (transcripts + tasks) for this user from DB
        const data = await api.fetchSessions(token, user.id);

        // Extract tasks from all sessions
        const allTasks = data.flatMap(session =>
          (session.tasks || []).map(t => ({
            ...t,
            meetingTitle: session.title.replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, ''),
            meetingId: session.id
          }))
        );

        setTasks(allTasks);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user, getToken]);

  const toggleTask = (meetingId, taskTitle) => {
    // For MVP MVP, we just toggle locally since we don't have a specific
    // "update task" endpoint yet in the serverless backend.
    setTasks(prevTasks =>
      prevTasks.map(t =>
        (t.meetingId === meetingId && t.title === taskTitle)
          ? { ...t, completed: !t.completed, status: !t.completed ? 'Completed' : 'Pending' }
          : t
      )
    );
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