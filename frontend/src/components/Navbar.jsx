import React, { useState } from "react";
import { NavLink } from "react-router-dom";

// Your images
import user from "../assets/user_image_default.jpg";
import logo from "../assets/talknote_logo.png";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);       // Mobile nav
  const [openProfile, setOpenProfile] = useState(false); // Profile dropdown

    console.log("Navbar loaded");


  // Active link styling
  const navLinkClasses = ({ isActive }) =>
    `transition text-sm md:text-base ${
      isActive
        ? "text-blue-400 font-medium border-b-2 border-blue-400 pb-1"
        : "text-gray-300 hover:text-blue-300"
    }`;

  return (
    <nav className="w-full bg-[#0F172A] text-white px-10 py-4 shadow-md fixed z-10">

      {/* Navbar Container */}
      <div className="flex items-center justify-between">

        {/* Left - Logo + Text */}
        <div className="flex items-center gap-5">
          <img
            src={logo}
            alt="logo"
            className="w-8 h-8 rounded-full"
          />
          <h1 className="text-xl font-semibold">TalkNote</h1>
        </div>

        {/* Middle - Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/Home" className={navLinkClasses}>
            Home
          </NavLink>

          <NavLink to="/Meetings" className={navLinkClasses}>
            Meetings
          </NavLink>

          <NavLink to="/LiveMeeting" className={navLinkClasses}>
            Live Meeting
          </NavLink>

          <NavLink to="/Tasks" className={navLinkClasses}>
            Tasks
          </NavLink>
        </div>

        {/* Right - Icons + Profile */}
        <div className="flex items-center gap-5">

          {/* Notification */}
          <button className="hidden md:block hover:text-blue-300 transition">
            <i className="fa-regular fa-bell text-lg"></i>
          </button>

          {/* Settings
          <button className="hidden md:block hover:text-blue-300 transition">
            <i className="fa-solid fa-gear text-lg"></i>
          </button> */}

          {/* Profile + Dropdown */}
          <div className="relative">
            <div
              onClick={() => setOpenProfile(!openProfile)}
              className="w-10 h-10 cursor-pointer border-2 border-gray-400 hover:border-blue-400 rounded-full overflow-hidden"
            >
              <img src={user} alt="user avatar" className="w-full h-full object-cover" />
            </div>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-40 bg-[#1E293B] shadow-lg rounded-lg p-2 text-gray-200 z-50">
                <NavLink
                  to="/profile"
                  className="block px-3 py-2 rounded hover:bg-blue-600"
                >
                  My Profile
                </NavLink>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-red-600">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-xl"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <i className={`fa-solid ${openMenu ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {openMenu && (
        <div className="md:hidden mt-4 flex flex-col gap-3 bg-[#1E293B] p-4 rounded-lg text-gray-200">
          <NavLink
            to="/Home"
            className="px-3 py-2 rounded hover:bg-blue-600"
            onClick={() => setOpenMenu(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/meetings"
            className="px-3 py-2 rounded hover:bg-blue-600"
            onClick={() => setOpenMenu(false)}
          >
            Meetings
          </NavLink>

          <NavLink
            to="/tasks"
            className="px-3 py-2 rounded hover:bg-blue-600"
            onClick={() => setOpenMenu(false)}
          >
            Tasks
          </NavLink>

          <NavLink
            to="/profile"
            className="px-3 py-2 rounded hover:bg-blue-600"
            onClick={() => setOpenMenu(false)}
          >
            Profile
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
