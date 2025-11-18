

require('dotenv').config(); // Loads .env file contents
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
// 1. Enable CORS for all routes (so your client can talk to it)
app.use(cors()); 

// 2. Allow express to parse JSON in the request body
app.use(express.json());

// --- Define Routes ---
// A simple test route
app.get('/', (req, res) => res.send('Task Manager API Running...'));

// Use the authentication routes
app.use('/api/auth', require('./routes/auth'));
// Use the project routes
app.use('/api/projects', require('./routes/projects'));
// Use the task routes
// This forwards any request like /api/projects/:projectId/tasks to our tasks router
app.use('/api/projects/:projectId/tasks', require('./routes/tasks'));

// --- THIS IS THE NEW LINE FOR STEP 4 ---
// Use the notification routes
app.use('/api/notifications', require('./routes/notifications'));
// ------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));