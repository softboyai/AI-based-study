/**
 * Course Model
 * Mount Kigali University - AI Study Planner
 * 
 * Defines the schema for the 'courses' collection in MongoDB.
 * Stores course information including exam dates, difficulty, and grades.
 * Supports both student-owned courses and lecturer-created courses.
 */

const mongoose = require('mongoose');

// Define the Course schema
const courseSchema = new mongoose.Schema({
    // Reference to the student who enrolled in this course (optional for lecturer-created)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Reference to the lecturer who teaches this course (optional for student-added)
    lecturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Course name (e.g., "Database Systems")
    courseName: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true
    },
    // Course code (e.g., "CSC 401")
    courseCode: {
        type: String,
        required: [true, 'Course code is required'],
        trim: true
    },
    // Number of credit hours for this course
    creditHours: {
        type: Number,
        required: [true, 'Credit hours are required'],
        min: 1,
        max: 6
    },
    // Difficulty level rated (1-5 scale)
    difficultyLevel: {
        type: Number,
        required: [true, 'Difficulty level is required'],
        min: 1,
        max: 5
    },
    // Previous grade in this subject (percentage, 0-100)
    previousGrade: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    // Exam date for this course
    examDate: {
        type: Date,
        required: [true, 'Exam date is required']
    },
    // Instructor name (text field for display)
    instructor: {
        type: String,
        trim: true,
        default: ''
    },
    // Faculty/Department this course belongs to
    faculty: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Create and export the Course model
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
