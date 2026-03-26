import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import { Menu, X, Bell, User as UserIcon, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from "../lib/utils";
import { useNotifications } from "../context/NotificationContext";

// Your images
import logo from "../assets/talknote_logo.png";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  // Get notification state from global context
  let notificationState = { notifications: [], unreadCount: 0, isPolling: false, markAsRead: () => {}, markAllAsRead: () => {}, clearNotifications: () => {} };
  try {
    notificationState = useNotifications();
  } catch {
    // Context not available (e.g., not signed in), use defaults
  }
  const { notifications, unreadCount, isPolling, markAsRead, markAllAsRead, clearNotifications } = notificationState;

  // Handle scroll for navbar background
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  // Close dropdowns when navigating
  useEffect(() => {
    setOpenNotifications(false);
    setOpenProfile(false);
    setOpenMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setOpenProfile(false);
    await signOut();
    navigate("/");
  };

  const isLandingPage = location.pathname === "/" && !isSignedIn;

  const navLinkClasses = ({ isActive }) =>
    cn(
      "transition-colors text-sm font-medium px-3 py-2 rounded-lg",
      isActive
        ? "text-white bg-[#111111]"
        : "text-zinc-400 hover:text-white hover:bg-[#111111]/50"
    );

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-border-subtle py-3 shadow-sm"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

        {/* Left - Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#2e2e2e] group-hover:border-indigo-500/50 transition-colors">
            <img src={logo} alt="TalkNote" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">TalkNote</h1>
        </NavLink>

        {/* Middle - Desktop Navigation */}
        {!isLandingPage && (
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/Home" className={navLinkClasses}>Dashboard</NavLink>
            <NavLink to="/LiveMeeting" className={navLinkClasses}>Record</NavLink>
            <NavLink to="/Meetings" className={navLinkClasses}>History</NavLink>
            <NavLink to="/Tasks" className={navLinkClasses}>Tasks</NavLink>
          </div>
        )}

        {/* Right - Auth / Profile */}
        <div className="flex items-center gap-4">

          {/* Unauthenticated State */}
          {!isSignedIn && isLoaded && (
            <div className="hidden md:flex items-center gap-4">
              <NavLink to="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Sign In
              </NavLink>
              <NavLink to="/sign-in" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                Get Started
              </NavLink>
            </div>
          )}

          {/* Authenticated State */}
          {isSignedIn && isLoaded && (
            <>
              {/* ===== Notification Bell ===== */}
              <div className="relative">
                <button
                  onClick={() => {
                    setOpenNotifications(!openNotifications);
                    setOpenProfile(false);
                  }}
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-zinc-400 hover:text-white hover:bg-[#111111] transition-colors relative"
                >
                  <Bell className={cn("w-4 h-4", isPolling && "animate-pulse text-indigo-400")} />

                  {/* Red dot for unread notifications */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}

                  {/* Pulsing ring when polling */}
                  {isPolling && unreadCount === 0 && (
                    <span className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping" />
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {openNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenNotifications(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-[#080808] border border-[#1c1c1c] shadow-2xl rounded-xl overflow-hidden z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-[#1c1c1c] flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">Notifications</h3>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                Mark all read
                              </button>
                            )}
                            {notifications.length > 0 && (
                              <button
                                onClick={clearNotifications}
                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Currently Processing Banner */}
                        {isPolling && (
                          <div className="px-4 py-3 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-indigo-300">Processing in background...</p>
                              <p className="text-xs text-zinc-500">AI pipeline is running</p>
                            </div>
                          </div>
                        )}

                        {/* Notification List */}
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 && !isPolling ? (
                            <div className="px-4 py-8 text-center">
                              <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                              <p className="text-sm text-zinc-500">No notifications yet</p>
                              <p className="text-xs text-zinc-600 mt-1">Upload an audio file to get started</p>
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  markAsRead(notif.id);
                                  setOpenNotifications(false);
                                  navigate("/Meetings");
                                }}
                                className={cn(
                                  "px-4 py-3 border-b border-[#1c1c1c] cursor-pointer transition-colors hover:bg-[#111111]",
                                  !notif.read && "bg-indigo-500/5"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                    notif.read ? "bg-[#111111]" : "bg-emerald-500/10"
                                  )}>
                                    {notif.read ? (
                                      <Sparkles className="w-4 h-4 text-zinc-500" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className={cn(
                                        "text-sm font-medium truncate",
                                        notif.read ? "text-zinc-400" : "text-white"
                                      )}>
                                        {notif.title}
                                      </p>
                                      {!notif.read && (
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-zinc-500 line-clamp-2">{notif.summary}</p>
                                    <p className="text-xs text-zinc-600 mt-1">{formatTimeAgo(notif.timestamp)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="px-4 py-2.5 border-t border-[#1c1c1c]">
                            <button
                              onClick={() => {
                                setOpenNotifications(false);
                                navigate("/Meetings");
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors w-full text-center"
                            >
                              View all in History →
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setOpenProfile(!openProfile);
                    setOpenNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-[#2e2e2e] focus:border-indigo-500 transition-all bg-[#111111] flex items-center justify-center"
                >
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {openProfile && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenProfile(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 mt-2 w-48 bg-[#080808] border border-[#1c1c1c] shadow-2xl rounded-xl p-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-[#1c1c1c] mb-1.5">
                        <p className="text-sm text-white font-medium truncate">{user.fullName}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                      <NavLink
                        to="/Profile"
                        className="flex items-center w-full px-3 py-2 text-sm text-zinc-300 rounded-lg hover:bg-[#111111] hover:text-white transition-colors"
                        onClick={() => setOpenProfile(false)}
                      >
                        Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setOpenMenu(!openMenu)}
          >
            {openMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {openMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-[#1c1c1c] bg-[#080808]/95 backdrop-blur-xl absolute top-full left-0 w-full"
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {!isSignedIn ? (
              <>
                <NavLink to="/sign-in" onClick={() => setOpenMenu(false)} className="text-base font-medium text-white p-3 rounded-lg hover:bg-[#111111]">
                  Sign In
                </NavLink>
                <NavLink to="/sign-in" onClick={() => setOpenMenu(false)} className="text-base font-medium text-indigo-400 p-3 rounded-lg hover:bg-indigo-500/10">
                  Get Started Free &rarr;
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/Home" onClick={() => setOpenMenu(false)} className="text-base font-medium text-zinc-300 p-3 rounded-lg hover:bg-[#111111] hover:text-white">Dashboard</NavLink>
                <NavLink to="/LiveMeeting" onClick={() => setOpenMenu(false)} className="text-base font-medium text-zinc-300 p-3 rounded-lg hover:bg-[#111111] hover:text-white">Record</NavLink>
                <NavLink to="/Meetings" onClick={() => setOpenMenu(false)} className="text-base font-medium text-zinc-300 p-3 rounded-lg hover:bg-[#111111] hover:text-white">History</NavLink>
                <NavLink to="/Tasks" onClick={() => setOpenMenu(false)} className="text-base font-medium text-zinc-300 p-3 rounded-lg hover:bg-[#111111] hover:text-white">Tasks</NavLink>
                <NavLink to="/Profile" onClick={() => setOpenMenu(false)} className="text-base font-medium text-zinc-300 p-3 rounded-lg hover:bg-[#111111] hover:text-white border-t border-[#1c1c1c] mt-2 pt-4">Profile Settings</NavLink>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
