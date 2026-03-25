import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";
import { motion } from "motion/react";
import { CheckSquare, Clock, User as UserIcon, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const Tasks = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingTask, setSavingTask] = useState(null); // key = `${meetingId}-${taskIndex}`
  const [toggleError, setToggleError] = useState(null);

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
          (session.tasks || []).map((t, taskIndex) => ({
            ...t,
            taskIndex,           // position in the DB tasks JSONB array
            meetingTitle: session.title.replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, ''),
            meetingId: session.id
          }))
        );

        setTasks(allTasks);
      } catch (err) {
        console.error("Failed to load tasks", err);
        setError("Unable to reach the database. Please ensure the local backend server is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user, getToken]);

  const toggleTask = async (meetingId, taskIndex, currentCompleted) => {
    const newCompleted = !currentCompleted;
    const key = `${meetingId}-${taskIndex}`;

    // 1. Optimistic UI update immediately
    setTasks(prev =>
      prev.map(t =>
        (t.meetingId === meetingId && t.taskIndex === taskIndex)
          ? { ...t, completed: newCompleted, status: newCompleted ? 'Completed' : 'Pending' }
          : t
      )
    );
    setToggleError(null);
    setSavingTask(key);

    // 2. Persist to DB
    try {
      const token = await getToken();
      await api.updateTask(meetingId, taskIndex, newCompleted, token, user.id);
    } catch (err) {
      // 3. Roll back optimistic update on failure
      setTasks(prev =>
        prev.map(t =>
          (t.meetingId === meetingId && t.taskIndex === taskIndex)
            ? { ...t, completed: currentCompleted, status: currentCompleted ? 'Completed' : 'Pending' }
            : t
        )
      );
      setToggleError("Failed to save task. Please check your connection and try again.");
    } finally {
      setSavingTask(null);
    }
  };

  const pendingCount = tasks.filter(t => !t.completed && t.status !== 'Completed').length;

  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-zinc-100 pt-24">
      <main className="flex-1 px-6 md:px-12 py-8 relative">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-end mb-10">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                <CheckSquare className="w-8 h-8 text-indigo-400" />
                Action Items
              </h1>
              <p className="text-zinc-500">Track and manage tasks automatically extracted from your meetings.</p>
            </div>

            {/* Stats Pill */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-[#080808] border border-[#1c1c1c] rounded-full">
              <span className="text-zinc-400 text-sm font-medium">Pending Tasks</span>
              <span className="text-indigo-400 font-bold ml-1">{pendingCount}</span>
              <span className="text-zinc-600 mx-2">|</span>
              <span className="text-zinc-400 text-sm font-medium">Total</span>
              <span className="text-white font-bold ml-1">{tasks.length}</span>
            </div>
          </div>

          {/* Toggle error banner */}
          {toggleError && (
            <div className="mb-4 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center justify-between">
              <span>⚠️ {toggleError}</span>
              <button onClick={() => setToggleError(null)} className="text-red-400/60 hover:text-red-400 ml-4 text-xs">Dismiss</button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#080808]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#111111]">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Task Item</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source Meeting</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider w-40">Assignee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider w-32">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                        Gathering action items...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-red-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <CheckSquare className="w-10 h-10 text-red-500/30 mb-2" />
                          <p className="font-medium text-red-400">Connection Error</p>
                          <p className="text-sm text-red-400/80">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-4">
                        <CheckSquare className="w-12 h-12 text-zinc-800" />
                        <p>No tasks found. Upload a meeting audio to generate tasks!</p>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task, idx) => {
                      const isCompleted = task.completed || task.status === 'Completed';

                      return (
                        <motion.tr
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx}
                          className={cn(
                            "group transition-colors",
                            isCompleted ? "bg-[#050505] hover:bg-[#0a0a0a]" : "bg-[#080808] hover:bg-[#111111]"
                          )}
                        >
                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={() => toggleTask(task.meetingId, task.taskIndex, task.completed || task.status === 'Completed')}
                              disabled={savingTask === `${task.meetingId}-${task.taskIndex}`}
                              className="focus:outline-none transition-transform active:scale-90 disabled:opacity-50"
                            >
                              {savingTask === `${task.meetingId}-${task.taskIndex}` ? (
                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                              )}
                            </button>
                          </td>
                          <td className={cn(
                            "px-6 py-5 text-sm transition-colors",
                            isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-200 font-medium'
                          )}>
                            {task.title}
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#111111] border border-[#1c1c1c] text-xs font-medium text-zinc-400 truncate max-w-[200px]">
                              {task.meetingTitle}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <UserIcon className="w-3.5 h-3.5" />
                              {task.assignee || 'Unassigned'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Clock className="w-3.5 h-3.5" />
                              {task.due || 'N/A'}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
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