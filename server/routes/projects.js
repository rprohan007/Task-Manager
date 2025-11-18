const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Task = require('../models/Task'); // 1. IMPORT TASK MODEL (New)

// @route   GET api/projects
// @desc    Get all projects for a user (owned or collaborator)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const baseQuery = {
      $or: [{ owner: req.user.id }, { 'collaborators.user': req.user.id }],
    };
    const { search } = req.query;
    let finalQuery = baseQuery;
    if (search) {
      finalQuery = {
        $and: [
          baseQuery,
          { title: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const projects = await Project.find(finalQuery).sort({ date: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const newProject = new Project({
      title,
      description,
      owner: req.user.id,
      collaborators: [],
    });
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/:id
// @desc    Get a single project by its ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects/:id/share
// @desc    Share a project with another user
// @access  Private (Owner only)
router.post('/:id/share', auth, async (req, res) => {
  const { email, role } = req.body;
  const { id: projectId } = req.params;

  try {
    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only the project owner can share' });
    }
    
    if (project.collaborators.some(c => c.user.toString() === userToShareWith.id)) {
      return res.status(400).json({ msg: 'User is already a collaborator' });
    }

    if (userToShareWith.id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot share a project with yourself' });
    }

    project.collaborators.push({ user: userToShareWith.id, role });
    await project.save();
    
    const owner = await User.findById(req.user.id).select('name');
    const newNotification = new Notification({
      user: userToShareWith.id,
      text: `You were added as a ${role} to "${project.title}" by ${owner.name}`,
      link: `/project/${project._id}`
    });
    
    await newNotification.save();

    res.json(project.collaborators);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 2. NEW DELETE ROUTE ---
// @route   DELETE api/projects/:id
// @desc    Delete a project and all its tasks
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await project.deleteOne();

    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;