/**
 * Course Routes (Student)
 * Mount Kigali University - AI Study Planner
 * 
 * Handles CRUD operations for student courses.
 * All routes are protected and require student authentication.
 */

const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/courses
 * Get all courses for the logged-in student
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({ user: req.userId }).sort({ examDate: 1 });
        res.json({ courses });
    } catch (error) {
        console.error('[Courses] Get all error:', error.message);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
});

/**
 * POST /api/courses
 * Add a new course for the logged-in student
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { courseName, courseCode, creditHours, difficultyLevel, previousGrade, examDate, instructor } = req.body;

        if (!courseName || !courseCode || !creditHours || !difficultyLevel || !previousGrade || !examDate) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const course = new Course({
            user: req.userId,
            courseName,
            courseCode,
            creditHours: Number(creditHours),
            difficultyLevel: Number(difficultyLevel),
            previousGrade: Number(previousGrade),
            examDate: new Date(examDate),
            instructor: instructor || ''
        });

        await course.save();

        res.status(201).json({ message: 'Course added successfully!', course });
    } catch (error) {
        console.error('[Courses] Create error:', error.message);
        res.status(500).json({ message: 'Server error adding course' });
    }
});

/**
 * PUT /api/courses/:id
 * Update an existing course
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { courseName, courseCode, creditHours, difficultyLevel, previousGrade, examDate, instructor } = req.body;

        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            {
                courseName,
                courseCode,
                creditHours: Number(creditHours),
                difficultyLevel: Number(difficultyLevel),
                previousGrade: Number(previousGrade),
                examDate: new Date(examDate),
                instructor: instructor || ''
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully!', course });
    } catch (error) {
        console.error('[Courses] Update error:', error.message);
        res.status(500).json({ message: 'Server error updating course' });
    }
});

/**
 * DELETE /api/courses/:id
 * Delete a course
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.userId });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully!' });
    } catch (error) {
        console.error('[Courses] Delete error:', error.message);
        res.status(500).json({ message: 'Server error deleting course' });
    }
});

module.exports = router;
