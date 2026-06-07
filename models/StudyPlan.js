/**
 * StudyPlan Model
 * Mount Kigali University - AI Study Planner
 * 
 * Defines the schema for the 'studyplans' collection in MongoDB.
 * Stores the AI-generated study plans with daily sessions.
 * Each plan is linked to a user and contains multiple daily entries.
 */

const mongoose = require('mongoose');

// Schema for individual study sessions within a day
const studySessionSchema = new mongoose.Schema({
    // Reference to the course for this session
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Course name (stored for quick access without population)
    courseName: {
        type: String,
        required: true
    },
    // Course code
    courseCode: {
        type: String,
        required: true
    },
    // Duration of study session in hours
    duration: {
        type: Number,
        required: true,
        min: 0.5,
        max: 4
    },
    // Priority score assigned by the AI algorithm
    priorityScore: {
        type: Number,
        required: true
    },
    // Suggested study topic or focus area
    topic: {
        type: String,
        default: 'General Review'
    }
}, { _id: false });

// Schema for each day in the study plan
const dailyPlanSchema = new mongoose.Schema({
    // The date for this day's plan
    date: {
        type: Date,
        required: true
    },
    // Day of the week (e.g., "Monday")
    dayOfWeek: {
        type: String,
        required: true
    },
    // Array of study sessions for this day
    sessions: [studySessionSchema],
    // Total study hours planned for this day
    totalHours: {
        type: Number,
        default: 0
    }
}, { _id: false });

// Main StudyPlan schema
const studyPlanSchema = new mongoose.Schema({
    // Reference to the user (student) who owns this plan
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Array of daily plans
    dailyPlans: [dailyPlanSchema],
    // Date when the plan was generated
    generatedAt: {
        type: Date,
        default: Date.now
    },
    // Start date of the plan
    startDate: {
        type: Date,
        required: true
    },
    // End date of the plan (last exam date)
    endDate: {
        type: Date,
        required: true
    },
    // Whether this plan is currently active
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create and export the StudyPlan model
const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
module.exports = StudyPlan;
