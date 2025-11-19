import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ProfilePage from './pages/ProfilePage'; // 1. IMPORT THE NEW PAGE
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const setAuthToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  // This simple check will be our 'isLoggedIn' logic
  const isLoggedIn = !!token; 

  const handleLogout = () => {
    setAuthToken(null); // Clear token from state and localStorage
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage setAuthToken={setAuthToken} />} 
          />
          <Route 
            path="/register" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage setAuthToken={setAuthToken} />} 
          />
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/project/:id" 
            element={isLoggedIn ? <ProjectPage /> : <Navigate to="/login" />} 
          />
          
          {/* 2. ADD THIS NEW ROUTE */}
          <Route 
            path="/profile" 
            element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;