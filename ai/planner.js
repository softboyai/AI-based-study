/**
 * AI Study Planner - Rule-Based Weighted Scoring Algorithm
 * Mount Kigali University - AI Study Planner
 * 
 * This module implements the core AI logic for generating study plans.
 * It uses a weighted scoring system based on four factors:
 * 1. Days until exam (35% weight) - Closer exams get higher priority
 * 2. Previous grade (25% weight) - Lower grades need more attention
 * 3. Difficulty level (25% weight) - Harder subjects need more time
 * 4. Credit hours (15% weight) - Higher credit courses get priority
 * 
 * The algorithm generates a day-by-day study plan from today until
 * each exam date, distributing study sessions based on priority scores.
 */

// ============ WEIGHT CONSTANTS ============
// These weights determine how much each factor contributes to the final score
const WEIGHTS = {
    DAYS_UNTIL_EXAM: 0.35,   // 35% - Urgency factor
    PREVIOUS_GRADE: 0.25,    // 25% - Weakness factor
    DIFFICULTY_LEVEL: 0.25,  // 25% - Complexity factor
    CREDIT_HOURS: 0.15       // 15% - Importance factor
};

/**
 * Calculate the priority score for a single course
 * Higher score = higher study priority
 * 
 * @param {Object} course - The course object from database
 * @param {Date} currentDate - The current date for calculation
 * @returns {number} - Priority score between 0 and 100
 */
function calculateCourseScore(course, currentDate) {
    // ---- Factor 1: Days Until Exam (35%) ----
    // Fewer days = higher score (more urgent)
    const examDate = new Date(course.examDate);
    const timeDiff = examDate.getTime() - currentDate.getTime();
    const daysUntilExam = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    // Score inversely proportional to days remaining (max 30 days considered)
    // If exam is tomorrow (1 day), score = 100; if 30+ days, score approaches 3.3
    const examUrgencyScore = Math.min(100, (1 / daysUntilExam) * 100 * 3);

    // ---- Factor 2: Previous Grade (25%) ----
    // Lower grade = higher score (needs more study)
    // Grade of 0 = score of 100, Grade of 100 = score of 0
    const gradeScore = 100 - course.previousGrade;

    // ---- Factor 3: Difficulty Level (25%) ----
    // Higher difficulty = higher score
    // Difficulty is on 1-5 scale, normalize to 0-100
    const difficultyScore = (course.difficultyLevel / 5) * 100;

    // ---- Factor 4: Credit Hours (15%) ----
    // More credit hours = higher score
    // Credit hours typically 1-6, normalize to 0-100
    const creditScore = (course.creditHours / 6) * 100;

    // ---- Calculate Weighted Total Score ----
    const totalScore = (
        (examUrgencyScore * WEIGHTS.DAYS_UNTIL_EXAM) +
        (gradeScore * WEIGHTS.PREVIOUS_GRADE) +
        (difficultyScore * WEIGHTS.DIFFICULTY_LEVEL) +
        (creditScore * WEIGHTS.CREDIT_HOURS)
    );

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate a complete study plan from today until the last exam
 * 
 * @param {Array} courses - Array of course objects from database
 * @param {number} dailyStudyHours - Student's preferred daily study hours
 * @returns {Object} - Complete study plan with daily sessions
 */
function generateStudyPlan(courses, dailyStudyHours) {
    // Validate inputs
    if (!courses || courses.length === 0) {
        return { dailyPlans: [], startDate: new Date(), endDate: new Date() };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // Find the last exam date to determine plan end date
    const lastExamDate = new Date(Math.max(...courses.map(c => new Date(c.examDate).getTime())));
    lastExamDate.setHours(23, 59, 59, 999);

    // Filter out courses whose exams have already passed
    const activeCourses = courses.filter(course => {
        const examDate = new Date(course.examDate);
        return examDate >= today;
    });

    if (activeCourses.length === 0) {
        return { dailyPlans: [], startDate: today, endDate: today };
    }

    // Array to hold all daily plans
    const dailyPlans = [];

    // Days of the week for labeling
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // ============ GENERATE DAY-BY-DAY PLAN ============
    let currentDate = new Date(today);

    while (currentDate <= lastExamDate) {
        // Get courses that still have upcoming exams on this date
        const relevantCourses = activeCourses.filter(course => {
            const examDate = new Date(course.examDate);
            examDate.setHours(23, 59, 59, 999);
            return examDate >= currentDate;
        });

        if (relevantCourses.length === 0) {
            // Move to next day if no relevant courses
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        // Calculate priority scores for each relevant course on this date
        const scoredCourses = relevantCourses.map(course => ({
            course: course,
            score: calculateCourseScore(course, currentDate)
        }));

        // Sort courses by score (highest priority first)
        scoredCourses.sort((a, b) => b.score - a.score);

        // Calculate total score for proportional time allocation
        const totalScore = scoredCourses.reduce((sum, sc) => sum + sc.score, 0);

        // ---- Allocate study time proportionally based on scores ----
        const sessions = [];
        let remainingHours = dailyStudyHours;

        for (const scoredCourse of scoredCourses) {
            if (remainingHours <= 0) break;

            // Calculate proportional time for this course
            const proportion = scoredCourse.score / totalScore;
            let allocatedHours = Math.round(proportion * dailyStudyHours * 2) / 2; // Round to nearest 0.5

            // Ensure minimum 0.5 hours and maximum of remaining hours
            allocatedHours = Math.max(0.5, Math.min(allocatedHours, remainingHours));

            // Don't allocate more than 3 hours for a single subject per day
            allocatedHours = Math.min(allocatedHours, 3);

            sessions.push({
                course: scoredCourse.course._id,
                courseName: scoredCourse.course.courseName,
                courseCode: scoredCourse.course.courseCode,
                duration: allocatedHours,
                priorityScore: scoredCourse.score,
                topic: generateStudyTopic(scoredCourse.course, currentDate)
            });

            remainingHours -= allocatedHours;
        }

        // Calculate total hours for this day
        const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);

        // Add this day's plan to the array
        dailyPlans.push({
            date: new Date(currentDate),
            dayOfWeek: daysOfWeek[currentDate.getDay()],
            sessions: sessions,
            totalHours: totalHours
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
        dailyPlans: dailyPlans,
        startDate: today,
        endDate: lastExamDate
    };
}

/**
 * Generate a suggested study topic based on how close the exam is
 * Provides different focus areas depending on the preparation phase
 * 
 * @param {Object} course - The course object
 * @param {Date} currentDate - The current date
 * @returns {string} - Suggested study topic/activity
 */
function generateStudyTopic(course, currentDate) {
    const examDate = new Date(course.examDate);
    const daysUntilExam = Math.ceil((examDate - currentDate) / (1000 * 60 * 60 * 24));

    // Different study strategies based on time remaining
    if (daysUntilExam <= 2) {
        return 'Final Review & Practice Questions';
    } else if (daysUntilExam <= 5) {
        return 'Revision & Past Papers';
    } else if (daysUntilExam <= 10) {
        return 'Practice Problems & Summary Notes';
    } else if (daysUntilExam <= 20) {
        return 'Deep Study & Concept Understanding';
    } else {
        return 'Reading & Note Taking';
    }
}

/**
 * Get courses with upcoming exams within specified days
 * Used for exam reminders on the dashboard
 * 
 * @param {Array} courses - Array of course objects
 * @param {number} withinDays - Number of days to look ahead
 * @returns {Array} - Courses with exams within the specified period
 */
function getUpcomingExams(courses, withinDays = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return courses.filter(course => {
        const examDate = new Date(course.examDate);
        const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExam >= 0 && daysUntilExam <= withinDays;
    }).map(course => {
        const examDate = new Date(course.examDate);
        const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        return {
            ...course.toObject ? course.toObject() : course,
            daysUntilExam: daysUntilExam
        };
    });
}

// Export all functions for use in routes
module.exports = {
    calculateCourseScore,
    generateStudyPlan,
    getUpcomingExams,
    WEIGHTS
};
