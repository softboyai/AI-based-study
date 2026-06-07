/**
 * Progress Routes
 * Mount Kigali University - AI Study Planner
 * 
 * Handles progress tracking for study sessions.
 * Students can log completed sessions, track hours, and view statistics.
 * All routes are protected and require authentication.
 */

const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/progress
 * Log a completed study session
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { courseId, date, hoursStudied, completed, understandingLevel, notes } = req.body;

        if (!courseId || !date || hoursStudied === undefined) {
            return res.status(400).json({ message: 'courseId, date, and hoursStudied are required' });
        }

        const course = await Course.findOne({ _id: courseId, user: req.userId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const progress = new Progress({
            user: req.userId,
            course: courseId,
            date: new Date(date),
            hoursStudied: Number(hoursStudied),
            completed: completed || false,
            understandingLevel: understandingLevel || 3,
            notes: notes || ''
        });

        await progress.save();

        res.status(201).json({ message: 'Progress logged successfully!', progress });
    } catch (error) {
        console.error('[Progress] Create error:', error.message);
        res.status(500).json({ message: 'Server error logging progress' });
    }
});

/**
 * GET /api/progress
 * Get all progress entries for the logged-in student
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.userId })
            .populate('course', 'courseName courseCode')
            .sort({ date: -1 });

        res.json({ progress });
    } catch (error) {
        console.error('[Progress] Get all error:', error.message);
        res.status(500).json({ message: 'Server error fetching progress' });
    }
});

/**
 * GET /api/progress/stats
 * Get study statistics for the logged-in student
 */
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const allProgress = await Progress.find({ user: req.userId })
            .populate('course', 'courseName courseCode');

        const totalSessions = allProgress.length;
        const completedSessions = allProgress.filter(p => p.completed).length;
        const totalHoursStudied = allProgress.reduce((sum, p) => sum + p.hoursStudied, 0);
        const completionRate = totalSessions > 0 
            ? Math.round((completedSessions / totalSessions) * 100) : 0;
        const avgUnderstanding = totalSessions > 0
            ? Math.round((allProgress.reduce((sum, p) => sum + p.understandingLevel, 0) / totalSessions) * 10) / 10 : 0;

        // Per-course statistics
        const courseStats = {};
        allProgress.forEach(p => {
            if (!p.course) return;
            const courseId = p.course._id.toString();
            if (!courseStats[courseId]) {
                courseStats[courseId] = {
                    courseName: p.course.courseName,
                    courseCode: p.course.courseCode,
                    totalHours: 0,
                    sessionsCompleted: 0,
                    totalSessions: 0,
                    understandingSum: 0
                };
            }
            courseStats[courseId].totalHours += p.hoursStudied;
            courseStats[courseId].totalSessions += 1;
            if (p.completed) courseStats[courseId].sessionsCompleted += 1;
            courseStats[courseId].understandingSum += p.understandingLevel;
        });

        const courseBreakdown = Object.values(courseStats).map(stat => ({
            ...stat,
            avgUnderstanding: Math.round((stat.understandingSum / stat.totalSessions) * 10) / 10,
            completionRate: Math.round((stat.sessionsCompleted / stat.totalSessions) * 100)
        }));

        res.json({
            stats: { totalSessions, completedSessions, totalHoursStudied: Math.round(totalHoursStudied * 10) / 10, completionRate, avgUnderstanding },
            courseBreakdown
        });
    } catch (error) {
        console.error('[Progress] Stats error:', error.message);
        res.status(500).json({ message: 'Server error fetching statistics' });
    }
});

/**
 * GET /api/progress/course/:courseId
 * Get progress entries for a specific course
 */
router.get('/course/:courseId', authMiddleware, async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.userId, course: req.params.courseId })
            .sort({ date: -1 });
        res.json({ progress });
    } catch (error) {
        console.error('[Progress] Get by course error:', error.message);
        res.status(500).json({ message: 'Server error fetching course progress' });
    }
});

module.exports = router;
