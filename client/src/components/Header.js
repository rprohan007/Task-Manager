import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Notifications from './Notifications'; // 1. Import Notifications

const Header = ({ isLoggedIn, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  const authLinks = (
    <ul>
      <li><Link to="/dashboard">Dashboard</Link></li>
      <li><Link to="/profile">Profile</Link></li>
      <li><Link to="/" onClick={onLogout}>Logout</Link></li>
      <li className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </li>
      {/* 2. Add the Notifications component */}
      <Notifications />
    </ul>
  );

  const guestLinks = (
    <ul>
      <li><Link to="/register">Sign Up</Link></li>
      <li><Link to="/login">Login</Link></li>
      <li className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <h1><Link to="/">Task Manager</Link></h1>
      {isLoggedIn ? authLinks : guestLinks}
    </nav>
  );
};

export default Header;