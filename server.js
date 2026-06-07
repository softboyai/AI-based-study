/**
 * AI-Based Study Planner System - Main Server File
 * Mount Kigali University (MKU)
 * 
 * This is the entry point of the application.
 * It sets up Express server, connects to MongoDB,
 * and registers all route handlers for admin, lecturer, and student roles.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const connectDB = require('./config/db');

// Import route handlers
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const studyPlanRoutes = require('./routes/studyPlan');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const lecturerRoutes = require('./routes/lecturer');

// Initialize Express application
const app = express();

// Connect to MongoDB database
connectDB();

// ============ MIDDLEWARE SETUP ============

// Enable CORS for cross-origin requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory (no cache for development)
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
    }
}));

// ============ API ROUTES ============

// Authentication routes (login, register, profile)
app.use('/api/auth', authRoutes);

// Student course management routes
app.use('/api/courses', courseRoutes);

// Study plan generation and retrieval routes
app.use('/api/study-plan', studyPlanRoutes);

// Progress tracking routes
app.use('/api/progress', progressRoutes);

// Admin routes (user management, system reports, PDF)
app.use('/api/admin', adminRoutes);

// Lecturer routes (course management, student progress, PDF)
app.use('/api/lecturer', lecturerRoutes);

// ============ SERVE FRONTEND ============

// Serve the main HTML page for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║   MKU AI-Based Study Planner System             ║
    ║   Server running on port ${PORT}                    ║
    ║   http://localhost:${PORT}                        ║
    ╚══════════════════════════════════════════════════╝
    `);

    // Auto-open browser on Windows
    const url = `http://localhost:${PORT}`;
    exec(`start ${url}`);
});
