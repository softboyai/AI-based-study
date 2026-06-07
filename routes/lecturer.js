/**
 * Lecturer Routes
 * Mount Kigali University - AI Study Planner
 * 
 * Handles all lecturer-specific operations:
 * - Add and manage their own courses/subjects
 * - Set exam dates and difficulty levels
 * - View students who registered their courses (linked by course code)
 * - View student progress and study plan reports
 * - Generate PDF reports
 * 
 * HOW STUDENT-LECTURER LINK WORKS:
 * 1. Lecturer creates a course with a code (e.g., CSC 4101)
 * 2. Student adds a course with the same code to their profile
 * 3. System automatically links them by matching course codes
 * 4. Lecturer can see all students who have their course codes
 */

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Course = require('../models/Course');
const StudyPlan = require('../models/StudyPlan');
const Progress = require('../models/Progress');
const { authMiddleware, lecturerOnly } = require('../middleware/auth');

// All lecturer routes require authentication + lecturer role
router.use(authMiddleware);
router.use(lecturerOnly);

// ============ COURSE MANAGEMENT ============

/**
 * GET /api/lecturer/courses
 * Get all courses created by this lecturer
 */
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find({ user: req.userId })
            .sort({ examDate: 1 });

        res.json({ courses, total: courses.length });
    } catch (error) {
        console.error('[Lecturer] Get courses error:', error.message);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
});

/**
 * POST /api/lecturer/courses
 * Create a new course
 */
router.post('/courses', async (req, res) => {
    try {
        const { courseName, courseCode, creditHours, difficultyLevel, examDate, instructor } = req.body;

        if (!courseName || !courseCode || !creditHours || !examDate) {
            return res.status(400).json({ message: 'Course name, code, credit hours, and exam date are required' });
        }

        const course = new Course({
            user: req.userId,
            courseName,
            courseCode: courseCode.toUpperCase().trim(),
            creditHours: Number(creditHours),
            difficultyLevel: Number(difficultyLevel) || 3,
            previousGrade: 50,
            examDate: new Date(examDate),
            instructor: instructor || ''
        });

        await course.save();
        res.status(201).json({ message: 'Course created successfully!', course });
    } catch (error) {
        console.error('[Lecturer] Create course error:', error.message);
        res.status(500).json({ message: 'Server error creating course' });
    }
});

/**
 * PUT /api/lecturer/courses/:id
 * Update a course (only if owned by this lecturer)
 */
router.put('/courses/:id', async (req, res) => {
    try {
        const { courseName, courseCode, creditHours, difficultyLevel, examDate, instructor } = req.body;

        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            {
                courseName,
                courseCode: courseCode ? courseCode.toUpperCase().trim() : undefined,
                creditHours: Number(creditHours),
                difficultyLevel: Number(difficultyLevel),
                examDate: new Date(examDate),
                instructor: instructor || ''
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found or access denied' });
        }

        res.json({ message: 'Course updated successfully!', course });
    } catch (error) {
        console.error('[Lecturer] Update course error:', error.message);
        res.status(500).json({ message: 'Server error updating course' });
    }
});

/**
 * DELETE /api/lecturer/courses/:id
 * Delete a course (only if owned by this lecturer)
 */
router.delete('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or access denied' });
        }
        res.json({ message: 'Course deleted successfully!' });
    } catch (error) {
        console.error('[Lecturer] Delete course error:', error.message);
        res.status(500).json({ message: 'Server error deleting course' });
    }
});

// ============ VIEW ENROLLED STUDENTS ============
// Students are linked to lecturers through COURSE CODE matching.
// When a student adds a course with the same code as a lecturer's course,
// they automatically appear in the lecturer's student list.

/**
 * GET /api/lecturer/students
 * Get all students who are enrolled in this lecturer's courses.
 * The link is automatic: student registers a course code that matches
 * one of the lecturer's course codes.
 */
router.get('/students', async (req, res) => {
    try {
        // Step 1: Get all course codes belonging to this lecturer
        const lecturerCourses = await Course.find({ user: req.userId });
        const myCoursesCodes = lecturerCourses.map(c => c.courseCode);

        if (myCoursesCodes.length === 0) {
            return res.json({ students: [], total: 0 });
        }

        // Step 2: Find all student courses that match these codes
        // (exclude the lecturer's own courses)
        const studentCourses = await Course.find({
            courseCode: { $in: myCoursesCodes },
            user: { $ne: req.userId }
        }).populate('user', 'fullName email registrationNumber program yearOfStudy');

        // Step 3: Group by student and show which courses they're taking
        const studentMap = {};
        studentCourses.forEach(sc => {
            if (!sc.user) return;
            const id = sc.user._id.toString();
            if (!studentMap[id]) {
                studentMap[id] = {
                    _id: sc.user._id,
                    fullName: sc.user.fullName,
                    email: sc.user.email,
                    registrationNumber: sc.user.registrationNumber,
                    program: sc.user.program,
                    yearOfStudy: sc.user.yearOfStudy,
                    courses: []
                };
            }
            studentMap[id].courses.push({
                courseCode: sc.courseCode,
                courseName: sc.courseName,
                examDate: sc.examDate
            });
        });

        const students = Object.values(studentMap);

        res.json({ students, total: students.length });
    } catch (error) {
        console.error('[Lecturer] Get students error:', error.message);
        res.status(500).json({ message: 'Server error fetching students' });
    }
});

// ============ VIEW STUDENT PROGRESS ============

/**
 * GET /api/lecturer/progress
 * View progress for students enrolled in this lecturer's courses.
 * Automatically linked by course code.
 */
router.get('/progress', async (req, res) => {
    try {
        // Get lecturer's course codes
        const lecturerCourses = await Course.find({ user: req.userId });
        const courseCodes = lecturerCourses.map(c => c.courseCode);

        if (courseCodes.length === 0) {
            return res.json({ progress: [], total: 0 });
        }

        // Find all student courses with matching codes
        const studentCourses = await Course.find({
            courseCode: { $in: courseCodes },
            user: { $ne: req.userId }
        });

        const studentCourseIds = studentCourses.map(c => c._id);

        // Get progress for those courses
        const progress = await Progress.find({ course: { $in: studentCourseIds } })
            .populate('user', 'fullName email registrationNumber')
            .populate('course', 'courseName courseCode')
            .sort({ date: -1 });

        res.json({ progress, total: progress.length });
    } catch (error) {
        console.error('[Lecturer] Get progress error:', error.message);
        res.status(500).json({ message: 'Server error fetching student progress' });
    }
});

/**
 * GET /api/lecturer/study-plans
 * View study plans of students enrolled in this lecturer's courses
 */
router.get('/study-plans', async (req, res) => {
    try {
        const lecturerCourses = await Course.find({ user: req.userId });
        const courseCodes = lecturerCourses.map(c => c.courseCode);

        // Find students who have these courses
        const studentIds = await Course.find({
            courseCode: { $in: courseCodes },
            user: { $ne: req.userId }
        }).distinct('user');

        // Get study plans for those students
        const plans = await StudyPlan.find({ user: { $in: studentIds }, isActive: true })
            .populate('user', 'fullName email registrationNumber')
            .sort({ createdAt: -1 });

        res.json({ plans, total: plans.length });
    } catch (error) {
        console.error('[Lecturer] Get study plans error:', error.message);
        res.status(500).json({ message: 'Server error fetching study plans' });
    }
});

// ============ LECTURER DASHBOARD STATS ============

/**
 * GET /api/lecturer/stats
 * Get lecturer dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments({ user: req.userId });
        
        // Get course codes for this lecturer
        const lecturerCourses = await Course.find({ user: req.userId });
        const courseCodes = lecturerCourses.map(c => c.courseCode);

        // Count unique students enrolled in lecturer's courses
        const enrolledStudents = await Course.find({
            courseCode: { $in: courseCodes },
            user: { $ne: req.userId }
        }).distinct('user');

        // Count progress entries for lecturer's courses
        const studentCourses = await Course.find({
            courseCode: { $in: courseCodes },
            user: { $ne: req.userId }
        });
        const studentCourseIds = studentCourses.map(c => c._id);
        const totalProgressEntries = await Progress.countDocuments({ course: { $in: studentCourseIds } });

        res.json({
            stats: {
                totalCourses,
                totalStudents: enrolledStudents.length,
                totalProgressEntries
            }
        });
    } catch (error) {
        console.error('[Lecturer] Stats error:', error.message);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// ============ PDF REPORT GENERATION ============

/**
 * GET /api/lecturer/reports/pdf
 * Generate a PDF report for the lecturer's courses and student progress
 */
router.get('/reports/pdf', async (req, res) => {
    try {
        const lecturer = await User.findById(req.userId).select('-password');
        const courses = await Course.find({ user: req.userId }).sort({ examDate: 1 });
        const courseCodes = courses.map(c => c.courseCode);

        // Get enrolled students
        const studentCourses = await Course.find({
            courseCode: { $in: courseCodes },
            user: { $ne: req.userId }
        }).populate('user', 'fullName registrationNumber');

        // Get progress
        const studentCourseIds = studentCourses.map(c => c._id);
        const progress = await Progress.find({ course: { $in: studentCourseIds } })
            .populate('user', 'fullName registrationNumber')
            .populate('course', 'courseName courseCode');

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=MKU_Lecturer_Report.pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold')
            .text('Mount Kigali University', { align: 'center' });
        doc.fontSize(14).font('Helvetica')
            .text('Lecturer Course & Student Progress Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Lecturer: ${lecturer.fullName}`, { align: 'center' });
        doc.text(`Faculty: ${lecturer.faculty || 'N/A'}`, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // My Courses
        doc.fontSize(14).font('Helvetica-Bold').text('My Courses');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');

        courses.forEach((course, i) => {
            const examDate = new Date(course.examDate).toLocaleDateString('en-GB');
            doc.text(`${i + 1}. ${course.courseCode} - ${course.courseName} | Credits: ${course.creditHours} | Difficulty: ${course.difficultyLevel}/5 | Exam: ${examDate}`);
        });

        doc.moveDown(2);

        // Enrolled Students
        doc.fontSize(14).font('Helvetica-Bold').text('Enrolled Students');
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica');

        if (studentCourses.length === 0) {
            doc.text('No students enrolled yet.');
        } else {
            // Group by student
            const studentMap = {};
            studentCourses.forEach(sc => {
                if (!sc.user) return;
                const name = sc.user.fullName;
                if (!studentMap[name]) studentMap[name] = [];
                studentMap[name].push(sc.courseCode);
            });
            Object.entries(studentMap).forEach(([name, codes], i) => {
                doc.text(`${i + 1}. ${name} - Courses: ${codes.join(', ')}`);
            });
        }

        doc.moveDown(2);

        // Student Progress
        doc.fontSize(14).font('Helvetica-Bold').text('Student Progress Summary');
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica');

        if (progress.length === 0) {
            doc.text('No student progress data available yet.');
        } else {
            progress.slice(0, 50).forEach((p, i) => {
                const date = new Date(p.date).toLocaleDateString('en-GB');
                const studentName = p.user ? p.user.fullName : 'Unknown';
                const courseName = p.course ? `${p.course.courseCode}` : 'Unknown';
                doc.text(`${i + 1}. ${studentName} | ${courseName} | ${p.hoursStudied}hrs | ${p.completed ? 'Completed' : 'Partial'} | Understanding: ${p.understandingLevel}/5 | ${date}`);
            });
        }

        doc.moveDown(2);
        doc.fontSize(8).text('--- End of Report ---', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('[Lecturer] PDF report error:', error.message);
        res.status(500).json({ message: 'Server error generating PDF report' });
    }
});

module.exports = router;
