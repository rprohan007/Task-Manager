import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Import Drag and Drop
import api from '../api';
import ShareModal from '../components/ShareModal';
import TaskModal from '../components/TaskModal';
import { useTheme } from '../ThemeContext';

// --- TaskList Sub-Component (Now Draggable!) ---
const TaskList = ({ title, tasks, id, canEdit, onTaskClick, onTaskCreated }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    try {
      const res = await api.post(`/projects/${id}/tasks`, { 
        title: newTaskTitle,
        status: title, 
      });
      onTaskCreated(res.data);
      setNewTaskTitle('');
    } catch (err) {
      alert("Error: " + (err.response?.data?.msg || 'Failed'));
    }
  };

  return (
    // 1. Make the column Droppable
    <Droppable droppableId={title}>
      {(provided, snapshot) => (
        <div 
          className="task-list"
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            // Change background slightly when dragging over
            backgroundColor: snapshot.isDraggingOver ? 'var(--input-bg)' : 'var(--card-bg)',
            transition: 'background-color 0.2s ease'
          }}
        >
          <h3>{title}</h3>
          
          {/* 2. Map through tasks and make them Draggable */}
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={!canEdit}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="task-card"
                  onClick={() => onTaskClick(task)}
                  style={{
                    ...provided.draggableProps.style,
                    // Change look when being dragged
                    backgroundColor: snapshot.isDragging ? 'var(--bg-color)' : 'var(--card-bg)',
                    opacity: snapshot.isDragging ? 0.8 : 1,
                    // Preserve existing transform style required by library
                  }}
                >
                  <h4>{task.title}</h4>
                  {/* Basic indication if description exists */}
                  {task.description && <p style={{fontSize: '0.8rem', color: 'var(--text-color-light)'}}>...</p>}
                </div>
              )}
            </Draggable>
          ))}
          
          {provided.placeholder}

          {canEdit && (
            <form onSubmit={handleCreateTask} className="task-add-form">
              <input 
                type="text" 
                placeholder="Add a task..." 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="task-input"
              />
              <button type="submit" className="add-task-btn">+</button>
            </form>
          )}
        </div>
      )}
    </Droppable>
  );
};


// --- Main ProjectPage Component ---
const ProjectPage = () => {
  const { id: projectId } = useParams();
  const { theme } = useTheme();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Permissions & Search
  const [userRole, setUserRole] = useState('viewer');
  const [taskSearchTerm, setTaskSearchTerm] = useState('');

  // Get User ID Helper
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).user.id;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectRes = await api.get(`/projects/${projectId}`);
        setProject(projectRes.data);

        const currentUserId = getUserIdFromToken();
        if (currentUserId === projectRes.data.owner) {
          setUserRole('owner');
        } else {
          const collaborator = projectRes.data.collaborators.find(c => c.user === currentUserId);
          setUserRole(collaborator ? collaborator.role : 'viewer');
        }
        
        const tasksRes = await api.get(`/projects/${projectId}/tasks`);
        setTasks(tasksRes.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [projectId]);

  const handleTaskCreated = (newTask) => setTasks([...tasks, newTask]);

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
    setSelectedTask(null);
  };

  const handleTaskDeleted = (id) => {
    setTasks(tasks.filter(t => t._id !== id));
    setSelectedTask(null);
  };

  // --- 3. The Drag End Logic ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a column or in the same place, do nothing
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 1. Find the task being moved
    const taskToMove = tasks.find(t => t._id === draggableId);
    
    // 2. Optimistically update the UI (Immediate feedback)
    // We create a new task object with the updated status
    const updatedTask = { ...taskToMove, status: destination.droppableId };
    
    // Update local state immediately
    const newTasks = tasks.map(t => t._id === draggableId ? updatedTask : t);
    setTasks(newTasks);

    // 3. Call the API to save the change in the background
    try {
      await api.put(`/projects/${projectId}/tasks/${draggableId}`, {
        status: destination.droppableId
      });
    } catch (err) {
      console.error("Failed to move task", err);
      // Ideally revert state here if it fails, but for a mini-project this is fine
      alert("Failed to save move. Please refresh.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!project) return <div>Project not found</div>;

  const canEdit = (userRole === 'owner' || userRole === 'editor');

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(taskSearchTerm.toLowerCase())
  );

  return (
    <div className={`project-page-container ${theme}`}>
      {showShareModal && <ShareModal project={project} onClose={() => setShowShareModal(false)} onShareSuccess={(c) => setProject({...project, collaborators: c})} />}
      {selectedTask && <TaskModal task={selectedTask} projectId={projectId} onClose={() => setSelectedTask(null)} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} canEdit={canEdit} />}

      <div className="project-header">
        <h2>{project.title}</h2>
        <div className="project-header-actions">
          {userRole === 'owner' && <button className="share-btn" onClick={() => setShowShareModal(true)}>Share Project</button>}
        </div>
      </div>

      <div className="dashboard-search">
        <input 
          type="search" placeholder="Search tasks..." className="search-bar"
          value={taskSearchTerm} onChange={(e) => setTaskSearchTerm(e.target.value)}
        />
      </div>

      {/* 4. Wrap the board in DragDropContext */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="project-board">
          {['To-Do', 'In Progress', 'Done'].map(status => (
            <TaskList 
              key={status}
              title={status}
              // Filter tasks for this specific column
              tasks={filteredTasks.filter(t => t.status === status)}
              projectId={projectId}
              id={projectId} // Pass projectId as 'id' for the sub-component
              onTaskCreated={handleTaskCreated}
              canEdit={canEdit}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjectPage;