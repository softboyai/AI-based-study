/**
 * Progress Tracking JavaScript
 * Mount Kigali University - AI Study Planner
 * 
 * Handles progress logging and statistics display.
 * Allows students to track their study sessions and view performance.
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
    loadCourseOptions();
    loadProgressStats();
    loadRecentProgress();
    setDefaultDate();
});

// ============ SET DEFAULT DATE ============
/**
 * Set the date input to today's date by default
 */
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('progressDate').value = today;
}

// ============ LOAD COURSE OPTIONS ============
/**
 * Populate the course dropdown with student's courses
 */
async function loadCourseOptions() {
    try {
        const response = await fetch(`${API_URL}/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            const select = document.getElementById('progressCourse');
            // Clear existing options except the first placeholder
            select.innerHTML = '<option value="">Select Course</option>';

            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course._id;
                option.textContent = `${course.courseName} (${course.courseCode})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading course options:', error);
    }
}

// ============ LOAD PROGRESS STATISTICS ============
/**
 * Fetch and display overall progress statistics
 */
async function loadProgressStats() {
    try {
        const response = await fetch(`${API_URL}/progress/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            // Update stat cards
            document.getElementById('totalHours').textContent = data.stats.totalHoursStudied;
            document.getElementById('totalSessions').textContent = data.stats.completedSessions;
            document.getElementById('completionRate').textContent = data.stats.completionRate + '%';
            document.getElementById('avgUnderstanding').textContent = data.stats.avgUnderstanding;

            // Display per-course progress
            displayCourseProgress(data.courseBreakdown);
        }
    } catch (error) {
        console.error('Error loading progress stats:', error);
    }
}

/**
 * Display progress breakdown by course
 * @param {Array} courseBreakdown - Array of per-course statistics
 */
function displayCourseProgress(courseBreakdown) {
    const container = document.getElementById('courseProgressContainer');

    if (!courseBreakdown || courseBreakdown.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No progress data yet</h3>
                <p>Start logging your study sessions to see progress by course.</p>
            </div>
        `;
        return;
    }

    let html = '';

    courseBreakdown.forEach(course => {
        html += `
            <div class="progress-item">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <strong>${course.courseName} (${course.courseCode})</strong>
                        <span style="color: var(--text-medium); font-size: 0.85rem;">
                            ${course.totalHours} hrs | ${course.completionRate}% complete
                        </span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${course.completionRate}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.8rem; color: var(--text-light);">
                        <span>Sessions: ${course.sessionsCompleted}/${course.totalSessions}</span>
                        <span>Understanding: ${course.avgUnderstanding}/5</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============ LOAD RECENT PROGRESS ============
/**
 * Fetch and display recent study session logs
 */
async function loadRecentProgress() {
    try {
        const response = await fetch(`${API_URL}/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            displayRecentProgress(data.progress);
        }
    } catch (error) {
        console.error('Error loading recent progress:', error);
    }
}

/**
 * Display recent progress entries in a table
 * @param {Array} progressEntries - Array of progress objects
 */
function displayRecentProgress(progressEntries) {
    const container = document.getElementById('recentProgressContainer');

    if (!progressEntries || progressEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No study sessions logged</h3>
                <p>Use the form above to log your first study session.</p>
            </div>
        `;
        return;
    }

    // Show last 20 entries
    const recentEntries = progressEntries.slice(0, 20);

    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Course</th>
                        <th>Hours</th>
                        <th>Status</th>
                        <th>Understanding</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
    `;

    recentEntries.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        const statusBadge = entry.completed 
            ? '<span class="badge badge-success">Completed</span>'
            : '<span class="badge badge-warning">Partial</span>';

        // Understanding level stars
        const stars = '★'.repeat(entry.understandingLevel) + '☆'.repeat(5 - entry.understandingLevel);

        html += `
            <tr>
                <td>${date}</td>
                <td>${entry.course ? entry.course.courseName : 'Unknown'}</td>
                <td>${entry.hoursStudied}h</td>
                <td>${statusBadge}</td>
                <td style="color: var(--warning);">${stars}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${entry.notes || '-'}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ============ LOG PROGRESS ============
/**
 * Handle progress form submission
 * Logs a new study session to the database
 */
async function handleLogProgress(event) {
    event.preventDefault();

    const progressData = {
        courseId: document.getElementById('progressCourse').value,
        date: document.getElementById('progressDate').value,
        hoursStudied: Number(document.getElementById('progressHours').value),
        understandingLevel: Number(document.getElementById('progressUnderstanding').value),
        completed: document.getElementById('progressCompleted').value === 'true',
        notes: document.getElementById('progressNotes').value.trim()
    };

    // Validate course selection
    if (!progressData.courseId) {
        showAlert('Please select a course.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(progressData)
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Study session logged successfully!', 'success');
            // Reset form
            document.getElementById('logProgressForm').reset();
            setDefaultDate();
            // Reload data
            loadProgressStats();
            loadRecentProgress();
        } else {
            showAlert(data.message || 'Error logging progress', 'error');
        }
    } catch (error) {
        console.error('Error logging progress:', error);
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

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Logout function
 */
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
