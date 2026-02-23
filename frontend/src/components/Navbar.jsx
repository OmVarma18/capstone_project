import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X, Bell, User as UserIcon } from 'lucide-react';
import { cn } from "../lib/utils";

// Your images
import logo from "../assets/talknote_logo.png";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  // Handle scroll for navbar background
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const handleLogout = async () => {
    setOpenProfile(false);
    await signOut();
    navigate("/");
  };

  // Only show nav links if signed in OR if on a specific public page where we want them
  // For this design, we keep the navbar ultra-clean for the landing page.
  const isLandingPage = location.pathname === "/" && !isSignedIn;

  // Active link styling - exact match to the design system goals
  const navLinkClasses = ({ isActive }) =>
    cn(
      "transition-colors text-sm font-medium px-3 py-2 rounded-lg",
      isActive
        ? "text-white bg-[#111111]"
        : "text-zinc-400 hover:text-white hover:bg-[#111111]/50"
    );

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

        {/* Middle - Desktop Navigation (Only show if authenticated) */}
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
              {/* Notification */}
              <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-zinc-400 hover:text-white hover:bg-[#111111] transition-colors">
                <Bell className="w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenProfile(!openProfile)}
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
