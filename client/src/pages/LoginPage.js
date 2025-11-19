import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // Import our API helper

// We get the setAuthToken function from App.js as a prop
const LoginPage = ({ setAuthToken }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      // 1. Make the API call to the login route
      const res = await api.post('/auth/login', { email, password });
      
      // 2. If successful, res.data will contain the token
      setAuthToken(res.data.token);
      
      // We don't need to navigate, App.js will do it for us
    } catch (err) {
      // --- THIS IS THE FIX ---
      // Check if the error has a response from the server
      if (err.response) {
        // The server responded with an error (e.g., "Invalid Credentials")
        setError(err.response.data.msg);
      } else {
        // No response was received (e.g., server is down)
        setError('Network Error: Could not connect to server.');
      }
      console.error(err); // Log the full error
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          minLength="6"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginPage;