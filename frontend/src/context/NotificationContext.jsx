import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { api } from "../services/api";

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30000; // Poll every 30 seconds
const NOTIFICATION_STORAGE_KEY = "talknote_notifications";

/**
 * Global Notification Provider
 * 
 * This context manages background polling for completed AI sessions.
 * It lives above the router so it persists across page navigations.
 * 
 * Flow:
 * 1. User uploads audio on LiveMeeting page → calls registerUpload()
 * 2. This context starts polling GET /api/sessions every 30 seconds
 * 3. When session count increases → a new notification is created
 * 4. Navbar bell icon shows a red dot + dropdown with notification details
 * 5. User can dismiss notifications
 */
export const NotificationProvider = ({ children }) => {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();

  // Notifications: array of { id, title, summary, timestamp, read }
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Polling state
  const [isPolling, setIsPolling] = useState(false);
  const [pollElapsed, setPollElapsed] = useState(0);
  const pollIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const sessionCountRef = useRef(null); // session count at time of upload
  const uploadTimestampRef = useRef(null); // when the upload happened

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  /**
   * Called by LiveMeeting.jsx after a successful upload.
   * Starts background polling to detect when the AI pipeline finishes.
   */
  const registerUpload = useCallback(async (filename) => {
    if (!user) return;

    try {
      // Snapshot current session count
      const token = await getToken();
      const currentSessions = await api.fetchSessions(token, user.id, true);
      sessionCountRef.current = currentSessions ? currentSessions.length : 0;
      uploadTimestampRef.current = Date.now();
    } catch {
      sessionCountRef.current = 0;
      uploadTimestampRef.current = Date.now();
    }

    // Stop any existing polling
    stopPolling();

    // Start fresh polling
    setIsPolling(true);
    setPollElapsed(0);

    // Elapsed timer (ticks every second)
    timerIntervalRef.current = setInterval(() => {
      setPollElapsed(prev => prev + 1);
    }, 1000);

    // API poller (every 30 seconds)
    pollIntervalRef.current = setInterval(async () => {
      try {
        const token = await getToken();
        const sessions = await api.fetchSessions(token, user.id, true);

        if (sessions && sessions.length > sessionCountRef.current) {
          // New session(s) found — the pipeline finished!
          const newSession = sessions[0]; // most recent (API returns DESC order)

          // Create a notification
          const notification = {
            id: `notif_${Date.now()}`,
            sessionId: newSession.id,
            title: (newSession.title || "Untitled Meeting").replace('___', ' - ').replace(/^[a-zA-Z0-9_]+ - \d+_/, ''),
            summary: newSession.summary || "Processing complete.",
            timestamp: Date.now(),
            read: false,
          };

          setNotifications(prev => [notification, ...prev]);

          // Update the baseline count so we don't re-notify
          sessionCountRef.current = sessions.length;

          // Stop polling (this upload is done)
          stopPolling();
        }
      } catch (err) {
        console.error("Background poll error:", err);
        // Don't stop polling on network errors — just wait for next tick
      }
    }, POLL_INTERVAL_MS);
  }, [user, getToken, stopPolling]);

  const markAsRead = useCallback((notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    // Notification state
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,

    // Polling state (for LiveMeeting to show status)
    isPolling,
    pollElapsed,
    stopPolling,

    // Action
    registerUpload,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
