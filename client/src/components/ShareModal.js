import React, { useState } from 'react';
import api from '../api';

// --- We are using "CSS-in-JS" for the modal styles ---
// This keeps the component self-contained.
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.25rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#aaa',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  label: {
    fontWeight: 500,
    fontSize: '0.9rem',
    marginBottom: '-5px',
  }
};
// --- End of styles ---


const ShareModal = ({ project, onClose, onShareSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer'); // Default role is 'viewer'
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      // Make the API call to our new 'share' route
      const res = await api.post(`/projects/${project._id}/share`, { email, role });
      
      // Call the success function passed from the parent (ProjectPage)
      onShareSuccess(res.data);
      setMessage(`Successfully shared with ${email}`);
      setEmail(''); // Clear the email input on success
      
    } catch (err) {
      // Handle errors (e.g., "User not found") from the server
      setError(err.response?.data?.msg || 'Failed to share project');
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.headerTitle}>Share "{project.title}"</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <label htmlFor="email" style={modalStyles.label}>User's Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter user's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={modalStyles.input}
            required
          />
          
          <label htmlFor="role" style={modalStyles.label}>Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={modalStyles.select}
          >
            <option value="viewer">Viewer (Can only see tasks)</option>
            <option value="editor">Editor (Can edit and add tasks)</option>
          </select>
          
          <button type="submit" style={modalStyles.button}>
            Share Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;