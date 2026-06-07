/**
 * Admin Routes
 * Mount Kigali University - AI Study Planner
 * 
 * Handles all admin-specific operations:
 * - Manage user accounts (students and lecturers)
 * - Add, edit, and delete courses
 * - View all study plans and system reports
 * - Manage exam timetables for all faculties
 * - Generate PDF reports
 */

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Course = require('../models/Course');
const StudyPlan = require('../models/StudyPlan');
const Progress = require('../models/Progress');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(adminOnly);

// ============ USER MANAGEMENT ============

/**
 * GET /api/admin/users
 * Get all users in the system with optional role filter
 */
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        // Filter by role if specified
        if (role && ['admin', 'lecturer', 'student'].includes(role)) {
            query.role = role;
        }

        // Search by name or email
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ users, total: users.length });
    } catch (error) {
        console.error('[Admin] Get users error:', error.message);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

/**
 * POST /api/admin/users
 * Create a new user (admin can create any role)
 */
router.post('/users', async (req, res) => {
    try {
        const { fullName, email, password, registrationNumber, role, faculty, program } = req.body;

        if (!fullName || !email || !password || !registrationNumber || !role) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Validate password strength
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < 6 || !hasLetter || !hasNumber) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters and contain both letters and numbers' 
            });
        }

        // Check for existing user
        const existing = await User.findOne({ $or: [{ email }, { registrationNumber }] });
        if (existing) {
            return res.status(400).json({ message: 'User with this email or registration number already exists' });
        }

        const user = new User({
            fullName,
            email,
            password,
            registrationNumber,
            role,
            faculty: faculty || '',
            program: program || ''
        });

        await user.save();

        res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('[Admin] Create user error:', error.message);
        res.status(500).json({ message: 'Server error creating user' });
    }
});

/**
 * PUT /api/admin/users/:id
 * Update a user account
 */
router.put('/users/:id', async (req, res) => {
    try {
        const { fullName, email, role, faculty, program, isActive } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (faculty !== undefined) updateData.faculty = faculty;
        if (program !== undefined) updateData.program = program;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully!', user });
    } catch (error) {
        console.error('[Admin] Update user error:', error.message);
        res.status(500).json({ message: 'Server error updating user' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user account
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Also delete related data
        await Course.deleteMany({ user: req.params.id });
        await StudyPlan.deleteMany({ user: req.params.id });
        await Progress.deleteMany({ user: req.params.id });

        res.json({ message: 'User and all related data deleted successfully!' });
    } catch (error) {
        console.error('[Admin] Delete user error:', error.message);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// ============ COURSE MANAGEMENT ============

/**
 * GET /api/admin/courses
 * Get all courses in the system
 */
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('user', 'fullName email role')
            .sort({ examDate: 1 });

        res.json({ courses, total: courses.length });
    } catch (error) {
        console.error('[Admin] Get courses error:', error.message);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
});

/**
 * POST /api/admin/courses
 * Admin can create a course and assign it to any user
 */
router.post('/courses', async (req, res) => {
    try {
        const { userId, courseName, courseCode, creditHours, difficultyLevel, previousGrade, examDate, instructor } = req.body;

        if (!userId || !courseName || !courseCode || !creditHours || !examDate) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const course = new Course({
            user: userId,
            courseName,
            courseCode,
            creditHours: Number(creditHours),
            difficultyLevel: Number(difficultyLevel) || 3,
            previousGrade: Number(previousGrade) || 50,
            examDate: new Date(examDate),
            instructor: instructor || ''
        });

        await course.save();
        res.status(201).json({ message: 'Course created successfully!', course });
    } catch (error) {
        console.error('[Admin] Create course error:', error.message);
        res.status(500).json({ message: 'Server error creating course' });
    }
});

/**
 * PUT /api/admin/courses/:id
 * Admin can update any course
 */
router.put('/courses/:id', async (req, res) => {
    try {
        const { courseName, courseCode, creditHours, difficultyLevel, previousGrade, examDate, instructor } = req.body;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { courseName, courseCode, creditHours, difficultyLevel, previousGrade, examDate, instructor },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully!', course });
    } catch (error) {
        console.error('[Admin] Update course error:', error.message);
        res.status(500).json({ message: 'Server error updating course' });
    }
});

/**
 * DELETE /api/admin/courses/:id
 * Admin can delete any course
 */
router.delete('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully!' });
    } catch (error) {
        console.error('[Admin] Delete course error:', error.message);
        res.status(500).json({ message: 'Server error deleting course' });
    }
});

// ============ STUDY PLANS & REPORTS ============

/**
 * GET /api/admin/study-plans
 * View all study plans in the system
 */
router.get('/study-plans', async (req, res) => {
    try {
        const plans = await StudyPlan.find()
            .populate('user', 'fullName email registrationNumber')
            .sort({ createdAt: -1 });

        res.json({ plans, total: plans.length });
    } catch (error) {
        console.error('[Admin] Get study plans error:', error.message);
        res.status(500).json({ message: 'Server error fetching study plans' });
    }
});

/**
 * GET /api/admin/stats
 * Get system-wide statistics for admin dashboard
 */
router.get('/stats', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalLecturers = await User.countDocuments({ role: 'lecturer' });
        const totalCourses = await Course.countDocuments();
        const totalPlans = await StudyPlan.countDocuments({ isActive: true });
        const totalProgress = await Progress.countDocuments();

        // Get recent registrations
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            stats: {
                totalStudents,
                totalLecturers,
                totalCourses,
                totalPlans,
                totalProgress
            },
            recentUsers
        });
    } catch (error) {
        console.error('[Admin] Stats error:', error.message);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// ============ PDF REPORT GENERATION ============

/**
 * GET /api/admin/reports/pdf
 * Generate a PDF system report
 */
router.get('/reports/pdf', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalLecturers = await User.countDocuments({ role: 'lecturer' });
        const totalCourses = await Course.countDocuments();
        const totalPlans = await StudyPlan.countDocuments({ isActive: true });

        const courses = await Course.find().populate('user', 'fullName').sort({ examDate: 1 });

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=MKU_System_Report.pdf');

        // Pipe PDF to response
        doc.pipe(res);

        // ---- PDF Header ----
        doc.fontSize(20).font('Helvetica-Bold')
            .text('Mount Kigali University', { align: 'center' });
        doc.fontSize(14).font('Helvetica')
            .text('AI-Based Study Planner System - Admin Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // ---- System Statistics ----
        doc.fontSize(14).font('Helvetica-Bold').text('System Statistics');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total Students: ${totalStudents}`);
        doc.text(`Total Lecturers: ${totalLecturers}`);
        doc.text(`Total Courses: ${totalCourses}`);
        doc.text(`Active Study Plans: ${totalPlans}`);
        doc.moveDown(2);

        // ---- Course List ----
        doc.fontSize(14).font('Helvetica-Bold').text('All Courses & Exam Timetable');
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica');

        courses.forEach((course, index) => {
            const examDate = new Date(course.examDate).toLocaleDateString('en-GB');
            const studentName = course.user ? course.user.fullName : 'Unassigned';
            doc.text(
                `${index + 1}. ${course.courseCode} - ${course.courseName} | Credits: ${course.creditHours} | Exam: ${examDate} | Student: ${studentName}`,
                { indent: 10 }
            );
        });

        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica')
            .text('--- End of Report ---', { align: 'center' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('[Admin] PDF report error:', error.message);
        res.status(500).json({ message: 'Server error generating PDF report' });
    }
});

module.exports = router;
