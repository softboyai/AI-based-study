/**
 * Progress Model
 * Mount Kigali University - AI Study Planner
 * 
 * Defines the schema for the 'progress' collection in MongoDB.
 * Tracks student's study progress for each course and session.
 * Allows students to mark sessions as completed and track hours studied.
 */

const mongoose = require('mongoose');

// Define the Progress schema
const progressSchema = new mongoose.Schema({
    // Reference to the user (student)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the course
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // The date of the study session
    date: {
        type: Date,
        required: true
    },
    // Hours actually studied
    hoursStudied: {
        type: Number,
        required: true,
        min: 0
    },
    // Whether the planned session was completed
    completed: {
        type: Boolean,
        default: false
    },
    // Student's self-assessment of understanding (1-5)
    understandingLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    // Optional notes about the study session
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Create and export the Progress model
const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
