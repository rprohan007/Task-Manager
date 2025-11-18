const express = require('express');
// We need to merge params to get the :projectId from the parent router (in server.js)
const router = express.Router({ mergeParams: true }); 
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Import our new permission-checking middleware
const { 
  checkProjectMember, 
  checkProjectEditor 
} = require('../middleware/checkProjectAuth');

// --- @route   GET api/projects/:projectId/tasks ---
// --- @desc    Get all tasks for a specific project ---
// --- @access  Private (Must be a project member) ---
router.get('/', [auth, checkProjectMember], async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId }).sort({ date: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- @route   POST api/projects/:projectId/tasks ---
// --- @desc    Create a new task in a project ---
// --- @access  Private (Must be owner or editor) ---
router.post('/', [auth, checkProjectEditor], async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  const { projectId } = req.params;

  try {
    const newTask = new Task({
      title,
      description,
      status: status || 'To-Do',
      dueDate,
      project: projectId,
      createdBy: req.user.id,
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- @route   PUT api/projects/:projectId/tasks/:taskId ---
// --- @desc    Update a task ---
// --- @access  Private (Must be owner or editor) ---
router.put('/:taskId', [auth, checkProjectEditor], async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  const { taskId } = req.params;

  // Build task object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (status) taskFields.status = status;
  if (dueDate) taskFields.dueDate = dueDate;

  try {
    let task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Note: The checkProjectEditor middleware has already confirmed
    // that this user has permission for this project.
    
    task = await Task.findByIdAndUpdate(
      taskId,
      { $set: taskFields },
      { new: true } // Return the updated document
    );

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- @route   DELETE api/projects/:projectId/tasks/:taskId ---
// --- @desc    Delete a task ---
// --- @access  Private (Must be owner or editor) ---
router.delete('/:taskId', [auth, checkProjectEditor], async (req, res) => {
  const { taskId } = req.params;
  try {
    let task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Note: checkProjectEditor middleware already confirmed permissions.

    await Task.findByIdAndDelete(taskId);

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;