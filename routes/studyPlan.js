/**
 * Study Plan Routes
 * Mount Kigali University - AI Study Planner
 * 
 * Handles study plan generation and retrieval.
 * Uses the AI planner module to generate personalized study schedules.
 * All routes are protected and require authentication.
 */

const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');
const Course = require('../models/Course');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { generateStudyPlan, getUpcomingExams } = require('../ai/planner');

/**
 * POST /api/study-plan/generate
 * Generate a new AI-powered study plan based on the student's courses
 */
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const courses = await Course.find({ user: req.userId });
        if (courses.length === 0) {
            return res.status(400).json({ 
                message: 'Please add at least one course before generating a study plan' 
            });
        }

        // Deactivate existing active plans
        await StudyPlan.updateMany(
            { user: req.userId, isActive: true },
            { isActive: false }
        );

        // Generate the study plan using the AI algorithm
        const planData = generateStudyPlan(courses, user.preferredStudyHours || 4);

        if (planData.dailyPlans.length === 0) {
            return res.status(400).json({ 
                message: 'No upcoming exams found. Please check your exam dates.' 
            });
        }

        const studyPlan = new StudyPlan({
            user: req.userId,
            dailyPlans: planData.dailyPlans,
            startDate: planData.startDate,
            endDate: planData.endDate,
            isActive: true
        });

        await studyPlan.save();

        res.status(201).json({
            message: 'Study plan generated successfully using AI algorithm!',
            studyPlan
        });

    } catch (error) {
        console.error('[StudyPlan] Generate error:', error.message);
        res.status(500).json({ message: 'Server error generating study plan' });
    }
});

/**
 * GET /api/study-plan/current
 * Get the current active study plan
 */
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const studyPlan = await StudyPlan.findOne({ user: req.userId, isActive: true });

        if (!studyPlan) {
            return res.status(404).json({ message: 'No active study plan found. Generate one first!' });
        }

        res.json({ studyPlan });
    } catch (error) {
        console.error('[StudyPlan] Get current error:', error.message);
        res.status(500).json({ message: 'Server error fetching study plan' });
    }
});

/**
 * GET /api/study-plan/weekly
 * Get the study plan for the current week (for dashboard calendar)
 */
router.get('/weekly', authMiddleware, async (req, res) => {
    try {
        const studyPlan = await StudyPlan.findOne({ user: req.userId, isActive: true });

        if (!studyPlan) {
            return res.status(404).json({ message: 'No active study plan found' });
        }

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyPlans = studyPlan.dailyPlans.filter(plan => {
            const planDate = new Date(plan.date);
            return planDate >= startOfWeek && planDate <= endOfWeek;
        });

        res.json({ weeklyPlans, weekStart: startOfWeek, weekEnd: endOfWeek });
    } catch (error) {
        console.error('[StudyPlan] Get weekly error:', error.message);
        res.status(500).json({ message: 'Server error fetching weekly plan' });
    }
});

/**
 * GET /api/study-plan/reminders
 * Get exam reminders for exams within 7 days
 */
router.get('/reminders', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({ user: req.userId });
        const upcomingExams = getUpcomingExams(courses, 7);

        res.json({ reminders: upcomingExams, count: upcomingExams.length });
    } catch (error) {
        console.error('[StudyPlan] Reminders error:', error.message);
        res.status(500).json({ message: 'Server error fetching reminders' });
    }
});

/**
 * GET /api/study-plan/history
 * Get all past study plans
 */
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const plans = await StudyPlan.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .select('startDate endDate isActive generatedAt createdAt');

        res.json({ plans });
    } catch (error) {
        console.error('[StudyPlan] History error:', error.message);
        res.status(500).json({ message: 'Server error fetching plan history' });
    }
});

module.exports = router;
