/**
 * Dashboard JavaScript
 * Mount Kigali University - AI Study Planner
 * 
 * Handles the dashboard page functionality including:
 * - Weekly calendar display
 * - Exam reminders (7 days or less)
 * - Statistics overview
 * - Today's study sessions
 */

// API base URL
const API_URL = '/api';

// ============ AUTHENTICATION CHECK ============
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// ============ PAGE INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadReminders();
    loadWeeklyCalendar();
    loadStats();
    loadTodayPlan();
});

// ============ LOAD USER INFO ============
/**
 * Display welcome message with user's name
 */
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('welcomeMessage').textContent = 
            `Welcome back, ${user.fullName}!`;
    }
}

// ============ LOAD EXAM REMINDERS ============
/**
 * Fetch and display exam reminders for exams within 7 days
 */
async function loadReminders() {
    try {
        const response = await fetch(`${API_URL}/study-plan/reminders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.reminders.length > 0) {
            const section = document.getElementById('remindersSection');
            section.classList.remove('hidden');

            document.getElementById('reminderCount').textContent = 
                `${data.reminders.length} exam${data.reminders.length > 1 ? 's' : ''}`;

            const container = document.getElementById('remindersContainer');
            let html = '';

            data.reminders.forEach(exam => {
                const examDate = new Date(exam.examDate).toLocaleDateString('en-GB', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                });

                // Determine urgency text
                let urgencyText = '';
                if (exam.daysUntilExam === 0) {
                    urgencyText = 'TODAY!';
                } else if (exam.daysUntilExam === 1) {
                    urgencyText = 'TOMORROW!';
                } else {
                    urgencyText = `${exam.daysUntilExam} days away`;
                }

                html += `
                    <div class="reminder-card">
                        <div class="reminder-title">${exam.courseName} (${exam.courseCode})</div>
                        <div class="reminder-date">Exam: ${examDate}</div>
                        <div class="reminder-days">${urgencyText}</div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

// ============ LOAD WEEKLY CALENDAR ============
/**
 * Fetch and display the weekly study calendar
 */
async function loadWeeklyCalendar() {
    try {
        const response = await fetch(`${API_URL}/study-plan/weekly`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        const calendarBody = document.getElementById('calendarBody');

        if (response.ok) {
            renderWeeklyCalendar(data.weeklyPlans, data.weekStart);
        } else {
            // No plan exists yet - show empty calendar
            renderEmptyCalendar();
        }
    } catch (error) {
        console.error('Error loading weekly calendar:', error);
        renderEmptyCalendar();
    }
}

/**
 * Render the weekly calendar with study sessions
 * @param {Array} weeklyPlans - Array of daily plans for the week
 * @param {string} weekStart - Start date of the week
 */
function renderWeeklyCalendar(weeklyPlans, weekStart) {
    const calendarBody = document.getElementById('calendarBody');
    const startDate = new Date(weekStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';

    // Generate 7 days (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);

        const isToday = dayDate.toDateString() === today.toDateString();
        const dayNumber = dayDate.getDate();

        // Find plan for this day
        const dayPlan = weeklyPlans.find(plan => {
            const planDate = new Date(plan.date);
            return planDate.toDateString() === dayDate.toDateString();
        });

        html += `<div class="calendar-day ${isToday ? 'today' : ''}">`;
        html += `<div class="day-number">${dayNumber}</div>`;
        html += `<div class="day-sessions">`;

        if (dayPlan && dayPlan.sessions.length > 0) {
            // Show up to 3 sessions, then indicate more
            const displaySessions = dayPlan.sessions.slice(0, 3);
            displaySessions.forEach(session => {
                html += `<div class="session-item">${session.courseCode} (${session.duration}h)</div>`;
            });
            if (dayPlan.sessions.length > 3) {
                html += `<div class="session-item">+${dayPlan.sessions.length - 3} more</div>`;
            }
        } else {
            html += `<span style="font-size: 0.7rem; color: var(--text-light);">No sessions</span>`;
        }

        html += `</div></div>`;
    }

    calendarBody.innerHTML = html;
}

/**
 * Render an empty calendar when no plan exists
 */
function renderEmptyCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    let html = '';

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        const isToday = dayDate.toDateString() === today.toDateString();

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${dayDate.getDate()}</div>
                <div class="day-sessions">
                    <span style="font-size: 0.7rem; color: var(--text-light);">No plan</span>
                </div>
            </div>
        `;
    }

    calendarBody.innerHTML = html;
}

// ============ LOAD STATISTICS ============
/**
 * Fetch and display study statistics
 */
async function loadStats() {
    try {
        // Load courses count
        const coursesResponse = await fetch(`${API_URL}/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const coursesData = await coursesResponse.json();
        if (coursesResponse.ok) {
            document.getElementById('totalCourses').textContent = coursesData.courses.length;
        }

        // Load progress stats
        const statsResponse = await fetch(`${API_URL}/progress/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        if (statsResponse.ok) {
            document.getElementById('completedSessions').textContent = 
                statsData.stats.completedSessions;
            document.getElementById('completionRate').textContent = 
                statsData.stats.completionRate + '%';
            document.getElementById('weeklyHours').textContent = 
                statsData.stats.totalHoursStudied;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============ LOAD TODAY'S PLAN ============
/**
 * Display today's study sessions from the active plan
 */
async function loadTodayPlan() {
    try {
        const response = await fetch(`${API_URL}/study-plan/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find today's plan
            const todayPlan = data.studyPlan.dailyPlans.find(plan => {
                const planDate = new Date(plan.date);
                planDate.setHours(0, 0, 0, 0);
                return planDate.toDateString() === today.toDateString();
            });

            const container = document.getElementById('todayPlan');

            if (todayPlan && todayPlan.sessions.length > 0) {
                let html = '';
                todayPlan.sessions.forEach(session => {
                    html += `
                        <div class="plan-session">
                            <div class="session-info">
                                <div class="course-name">${session.courseName} (${session.courseCode})</div>
                                <div class="session-topic">${session.topic}</div>
                            </div>
                            <div class="session-meta">
                                <div class="duration">${session.duration} hrs</div>
                                <div class="priority">Priority: ${session.priorityScore.toFixed(1)}</div>
                            </div>
                        </div>
                    `;
                });
                html += `
                    <div style="padding: 12px 20px; background: var(--accent-blue); border-radius: 0 0 8px 8px;">
                        <strong>Total: ${todayPlan.totalHours} hours of study planned</strong>
                    </div>
                `;
                container.innerHTML = html;
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No sessions scheduled for today</h3>
                        <p>Check your full study plan for upcoming sessions.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading today plan:', error);
    }
}

// ============ GENERATE NEW PLAN ============
/**
 * Generate a new AI study plan
 */
async function generatePlan() {
    if (!confirm('Generate a new study plan? This will replace your current plan.')) return;

    try {
        showAlert('Generating your AI study plan...', 'info');

        const response = await fetch(`${API_URL}/study-plan/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Study plan generated successfully!', 'success');
            // Reload the page to show new data
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert(data.message || 'Error generating plan', 'error');
        }
    } catch (error) {
        console.error('Error generating plan:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// ============ UTILITY FUNCTIONS ============
/**
 * Show alert message
 */
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.classList.remove('hidden');

    if (type === 'success') {
        setTimeout(() => alertDiv.classList.add('hidden'), 5000);
    }
}

/**
 * Logout function
 */
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
