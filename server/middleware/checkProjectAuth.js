

const Project = require('../models/Project');

// This middleware checks if a user has a specific role on a project
const checkProjectRole = (roles) => async (req, res, next) => {
  try {
    // projectId can come from req.params OR from the task's project
    let projectId = req.params.projectId;

    if (!projectId) {
      // This is for routes like 'delete task' where we have taskId
      if (req.params.taskId) {
        const task = await Task.findById(req.params.taskId);
        if (task) projectId = task.project;
      }
    }
    
    // If we still don't have a projectId, something is wrong
    if (!projectId) {
        return res.status(400).json({ msg: 'Project ID not found' });
    }

    const userId = req.user.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // 1. Check if user is the owner
    const isOwner = project.owner.toString() === userId;
    
    // 2. Check if user is a collaborator with the required role
    const collaborator = project.collaborators.find(
      (c) => c.user.toString() === userId
    );

    let hasRole = false;
    if (isOwner) {
      hasRole = true; // Owner can do anything
    } else if (collaborator && roles.includes(collaborator.role)) {
      hasRole = true; // Collaborator has one of the required roles
    }

    if (!hasRole) {
      return res.status(403).json({ msg: 'Access denied: Insufficient permissions for this project.' });
    }

    // If all checks pass, add project and user's role to the request
    req.project = project;
    req.userRole = isOwner ? 'owner' : (collaborator ? collaborator.role : null);
    
    next();

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Invalid ID' });
    }
    res.status(500).send('Server Error');
  }
};

// We will export specific versions of this middleware for convenience
module.exports = {
  // Allows owner or any collaborator (editor or viewer)
  checkProjectMember: checkProjectRole(['owner', 'editor', 'viewer']),
  // Allows only owner or editors
  checkProjectEditor: checkProjectRole(['owner', 'editor'])
};