import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const RegisterPage = ({ setAuthToken }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Make the API call to the register route
      const res = await api.post('/auth/register', { name, email, password });

      // 2. If successful, server returns a token
      setAuthToken(res.data.token);

      // App.js will handle redirecting to dashboard
    } catch (err) {
      // --- THIS IS THE FIX ---
      // Check if the error has a response from the server
      if (err.response) {
        // The server responded with an error (e.g., "User already exists")
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
      <h2>Sign Up</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          onChange={onChange}
          required
        />
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
          placeholder="Password (6+ characters)"
          name="password"
          value={password}
          onChange={onChange}
          minLength="6"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;