import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

// Pages (ALL start with capital letters)
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";
import LiveMeeting from "./pages/LiveMeeting";

const App = () => {
console.log("App loaded");

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Meetings" element={<Meetings />} />
        <Route path="/LiveMeeting" element={<LiveMeeting />} />
        
        <Route path="/Tasks" element={<Tasks />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
