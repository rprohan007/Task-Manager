import React, { useState, useEffect } from 'react';
import api from '../api';

const ProfilePage = () => {
  // State for the profile details form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // State for the password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for messages
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 1. Fetch user's current data on page load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/auth/me');
        setName(res.data.name);
        setEmail(res.data.email);
      } catch (err) {
        setProfileError('Failed to load user data.');
      }
    };
    fetchUserData();
  }, []); // Empty array means run once on load

  // 2. Handle Profile Update (Name)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    try {
      const res = await api.put('/auth/update', { name });
      setName(res.data.name); // Update state with new name from server
      setProfileMessage('Name updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.msg || 'Failed to update name.');
    }
  };

  // 3. Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return setPasswordError('New passwords do not match.');
    }

    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      setPasswordMessage('Password updated successfully!');
      // Clear password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.msg || 'Failed to update password.');
    }
  };

  return (
    <div className="profile-page-container">
      
      {/* --- PROFILE DETAILS CARD --- */}
      <div className="profile-card form-container">
        <h2>Profile Details</h2>
        <form onSubmit={handleProfileUpdate}>
          {profileMessage && <div className="alert alert-success">{profileMessage}</div>}
          {profileError && <div className="alert alert-error">{profileError}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              readOnly // Email is not editable
            />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>

      {/* --- CHANGE PASSWORD CARD --- */}
      <div className="profile-card form-container">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          {passwordMessage && <div className="alert alert-success">{passwordMessage}</div>}
          {passwordError && <div className="alert alert-error">{passwordError}</div>}

          <div className="form-group">
            <label htmlFor="oldPassword">Old Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;