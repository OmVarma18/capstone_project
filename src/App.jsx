import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react'; // Make sure SignUp is imported
import Navbar from "./components/Navbar";

// Pages (ALL start with capital letters)
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";
import LiveMeeting from "./pages/LiveMeeting";

// Custom Protected Route Component (Unchanged)
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
};

const App = () => {
console.log("App loaded");

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        
        {/* 1. Sign-In Route Configuration */}
        <Route 
          path="/sign-in" 
          element={
            <div className="flex justify-center items-center min-h-screen">
              <SignIn 
                path="/sign-in" 
                routing="path" 
                // Set the URL to redirect to the Sign-Up page
                signUpUrl="/sign-up" 
              />
            </div>
          } 
        />
        
        {/* 2. Sign-Up Route Configuration */}
        <Route 
          path="/sign-up" 
          element={
            <div className="flex justify-center items-center min-h-screen">
              <SignUp 
                path="/sign-up" 
                routing="path" 
                // Set the URL to redirect back to the Sign-In page
                signInUrl="/sign-in" 
              />
            </div>
          } 
        />

        {/* Protected Routes - (Unchanged) */}
        <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/Meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
        <Route path="/LiveMeeting" element={<ProtectedRoute><LiveMeeting /></ProtectedRoute>} />
        <Route path="/Tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;