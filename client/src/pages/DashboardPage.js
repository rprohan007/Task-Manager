import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // Helper to get user ID from token
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).user.id;
    } catch (e) { return null; }
  };

  useEffect(() => {
    setCurrentUserId(getUserId()); // Set user ID on mount
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get(`/projects?search=${searchTerm}`);
        setProjects(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchTerm]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle) return;

    try {
      const res = await api.post('/projects', { title: newProjectTitle });
      setProjects([res.data, ...projects]);
      setNewProjectTitle('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to create project');
    }
  };

  // --- NEW: Delete Project Handler ---
  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault(); // Stop the click from opening the project (Link)
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this project? This will delete ALL tasks inside it.')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      // Remove from UI
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete project');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Your Projects</h2>
        <form onSubmit={handleCreateProject} className="create-project-form">
          <input
            type="text"
            placeholder="New Project Title..."
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            className="search-bar"
          />
          <button type="submit" className="create-project-btn">Create Project</button>
        </form>
      </div>

      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Search your projects..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      
      {loading ? (
        <div>Loading projects...</div>
      ) : (
        <div className="project-list">
          {projects.length > 0 ? (
            projects.map(project => (
              <Link to={`/project/${project._id}`} key={project._id} className="project-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{project.title}</h3>
                  
                  {/* Only show delete button if current user is the owner */}
                  {project.owner === currentUserId && (
                    <button 
                      onClick={(e) => handleDeleteProject(e, project._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e94560', // Red color
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0 5px',
                        lineHeight: '1'
                      }}
                      title="Delete Project"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <p>{project.description || 'No description'}</p>
              </Link>
            ))
          ) : (
            <p>{searchTerm ? 'No projects found.' : 'No projects yet. Create one!'}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;