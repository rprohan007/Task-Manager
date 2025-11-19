import React, { useState, useEffect } from 'react';
import api from '../api';

// --- Modal Styles (CSS-in-JS) ---
// (We use this so we don't have to edit App.css again)
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
    backgroundColor: 'var(--card-bg)', // Use CSS Variable
    padding: '30px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)', // Use CSS Variable
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: 'var(--text-color)', // Use CSS Variable
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
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 500,
    fontSize: '0.9rem',
    marginBottom: '5px',
    color: 'var(--text-color-light)', // Use CSS Variable
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--input-border)', // Use CSS Variable
    backgroundColor: 'var(--input-bg)', // Use CSS Variable
    color: 'var(--text-color)', // Use CSS Variable
    borderRadius: '5px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--input-border)', // Use CSS Variable
    backgroundColor: 'var(--input-bg)', // Use CSS Variable
    color: 'var(--text-color)', // Use CSS Variable
    borderRadius: '5px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
    minHeight: '100px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  button: {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--btn-text-color)',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  deleteButton: {
    backgroundColor: '#e94560', // Red
    color: 'white',
  }
};
// --- End of styles ---

// Helper to format dates for <input type="date">
// It converts "2025-11-10T05:00:00.000Z" into "2025-11-10"
const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  try {
    return isoDate.split('T')[0];
  } catch (e) {
    return '';
  }
};


const TaskModal = ({ task, projectId, onClose, onTaskUpdated, onTaskDeleted, canEdit }) => {
  // Set up form state based on the task prop
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    dueDate: formatDateForInput(task.dueDate),
  });
  const [error, setError] = useState(null);

  const { title, description, dueDate } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Call the new PUT route to update the task
      const res = await api.put(
        `/projects/${projectId}/tasks/${task._id}`,
        formData
      );
      
      // Pass the updated task back to ProjectPage
      onTaskUpdated(res.data);
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    // Show a confirmation dialog before deleting
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/projects/${projectId}/tasks/${task._id}`);
        onTaskDeleted(task._id); // Pass the ID of the deleted task back
        onClose();
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete task');
      }
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.headerTitle}>{canEdit ? 'Edit Task' : 'View Task'}</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div style={modalStyles.formGroup}>
            <label htmlFor="title" style={modalStyles.label}>Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={title}
              onChange={onChange}
              style={modalStyles.input}
              readOnly={!canEdit} // Make read-only if user is a 'viewer'
              required
            />
          </div>
          
          <div style={modalStyles.formGroup}>
            <label htmlFor="description" style={modalStyles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              style={modalStyles.textarea}
              readOnly={!canEdit}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label htmlFor="dueDate" style={modalStyles.label}>Due Date</label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={dueDate}
              onChange={onChange}
              style={modalStyles.input}
              readOnly={!canEdit}
            />
          </div>
          
          {/* Only show buttons if user can edit */}
          {canEdit && (
            <div style={modalStyles.buttonContainer}>
              <button 
                type="button" 
                onClick={handleDelete} 
                style={{ ...modalStyles.button, ...modalStyles.deleteButton, marginRight: 'auto' }}
              >
                Delete Task
              </button>
              <button type="submit" style={modalStyles.button}>
                Save Changes
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default TaskModal;