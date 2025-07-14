// dynamic-ranking-backend/server.js
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Dynamic Ranking Backend is running!');
});

// We'll add user routes here later
const userRoutes = require('./routes/userRoutes'); // Will create this soon
app.use('/api', userRoutes); // All user-related routes will be prefixed with /api

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
