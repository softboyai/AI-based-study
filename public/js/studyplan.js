/**
 * Study Plan Page JavaScript
 * Mount Kigali University - AI Study Planner
 * 
 * Handles the full study plan display page.
 * Shows the complete AI-generated day-by-day study schedule.
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
    loadStudyPlan();
});

// ============ LOAD FULL STUDY PLAN ============
/**
 * Fetch and display the complete study plan
 */
async function loadStudyPlan() {
    try {
        const response = await fetch(`${API_URL}/study-plan/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            displayPlanOverview(data.studyPlan);
            displayFullPlan(data.studyPlan);
        } else {
            // No plan exists
            document.getElementById('fullPlanContainer').innerHTML = `
                <div class="empty-state">
                    <h3>No Study Plan Generated Yet</h3>
                    <p>Add your courses in the Profile page, then click "Regenerate Plan" to create your AI-powered study schedule.</p>
                    <button class="btn btn-primary mt-2" onclick="regeneratePlan()">Generate Study Plan</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading study plan:', error);
        document.getElementById('fullPlanContainer').innerHTML = `
            <div class="empty-state">
                <h3>Error Loading Plan</h3>
                <p>Please check your connection and try again.</p>
            </div>
        `;
    }
}

// ============ DISPLAY PLAN OVERVIEW ============
/**
 * Display plan statistics in the overview section
 * @param {Object} studyPlan - The study plan object from API
 */
function displayPlanOverview(studyPlan) {
    const startDate = new Date(studyPlan.startDate);
    const endDate = new Date(studyPlan.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Calculate total study hours across all days
    const totalHours = studyPlan.dailyPlans.reduce((sum, day) => sum + day.totalHours, 0);
    const dailyAverage = studyPlan.dailyPlans.length > 0 
        ? (totalHours / studyPlan.dailyPlans.length).toFixed(1) 
        : 0;

    document.getElementById('planDuration').textContent = duration;
    document.getElementById('totalPlanHours').textContent = totalHours.toFixed(1);
    document.getElementById('dailyAverage').textContent = dailyAverage;
}

// ============ DISPLAY FULL DAY-BY-DAY PLAN ============
/**
 * Render the complete day-by-day study plan
 * @param {Object} studyPlan - The study plan object from API
 */
function displayFullPlan(studyPlan) {
    const container = document.getElementById('fullPlanContainer');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (studyPlan.dailyPlans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No study sessions in this plan</h3>
                <p>Make sure your courses have future exam dates.</p>
            </div>
        `;
        return;
    }

    let html = '';

    studyPlan.dailyPlans.forEach(day => {
        const dayDate = new Date(day.date);
        const isToday = dayDate.toDateString() === today.toDateString();
        const isPast = dayDate < today;

        // Format the date nicely
        const formattedDate = dayDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Determine day status label
        let statusLabel = '';
        if (isToday) statusLabel = ' (TODAY)';
        else if (isPast) statusLabel = ' (Past)';

        html += `
            <div class="plan-day" style="${isPast ? 'opacity: 0.6;' : ''}">
                <div class="plan-day-header">
                    <div class="day-title">${day.dayOfWeek}, ${formattedDate}${statusLabel}</div>
                    <div class="day-hours">${day.totalHours} hrs total</div>
                </div>
        `;

        // Display each session for this day
        day.sessions.forEach(session => {
            // Determine priority color
            let priorityColor = 'var(--primary-blue)';
            if (session.priorityScore >= 60) priorityColor = 'var(--danger)';
            else if (session.priorityScore >= 40) priorityColor = 'var(--warning)';

            html += `
                <div class="plan-session">
                    <div class="session-info">
                        <div class="course-name">${session.courseName} (${session.courseCode})</div>
                        <div class="session-topic">${session.topic}</div>
                    </div>
                    <div class="session-meta">
                        <div class="duration">${session.duration} hrs</div>
                        <div class="priority" style="color: ${priorityColor};">
                            Score: ${session.priorityScore.toFixed(1)}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

// ============ REGENERATE PLAN ============
/**
 * Generate a new study plan using the AI algorithm
 */
async function regeneratePlan() {
    if (!confirm('Generate a new study plan? This will replace your current plan.')) return;

    try {
        showAlert('AI is generating your personalized study plan...', 'info');

        const response = await fetch(`${API_URL}/study-plan/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('New study plan generated successfully!', 'success');
            // Reload to show new plan
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert(data.message || 'Error generating plan. Make sure you have courses added.', 'error');
        }
    } catch (error) {
        console.error('Error regenerating plan:', error);
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
