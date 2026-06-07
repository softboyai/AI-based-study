/**
 * Profile Page JavaScript
 * Mount Kigali University - AI Study Planner
 * 
 * Handles profile setup and course management.
 * Allows students to update their academic info and add/remove courses.
 */

// API base URL
const API_URL = '/api';

// ============ AUTHENTICATION CHECK ============
// Redirect to login if no token found
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// ============ PAGE INITIALIZATION ============
// Load profile and courses when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadCourses();
});

// ============ LOAD PROFILE DATA ============
/**
 * Fetch and display the current user's profile information
 */
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            // Token expired, redirect to login
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            // Populate form fields with existing data
            document.getElementById('program').value = user.program || '';
            document.getElementById('yearOfStudy').value = user.yearOfStudy || '';
            document.getElementById('semester').value = user.semester || '';
            document.getElementById('preferredStudyHours').value = user.preferredStudyHours || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Error loading profile data.', 'error');
    }
}

// ============ UPDATE PROFILE ============
/**
 * Handle profile form submission
 * Updates the student's academic information
 */
async function handleProfileUpdate(event) {
    event.preventDefault();

    const profileData = {
        program: document.getElementById('program').value.trim(),
        yearOfStudy: Number(document.getElementById('yearOfStudy').value),
        semester: Number(document.getElementById('semester').value),
        preferredStudyHours: Number(document.getElementById('preferredStudyHours').value)
    };

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (response.ok) {
            // Update stored user data
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert('Profile updated successfully!', 'success');
        } else {
            showAlert(data.message || 'Error updating profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// ============ LOAD COURSES ============
/**
 * Fetch and display all courses for the current student
 */
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            displayCourses(data.courses);
        } else {
            showAlert('Error loading courses', 'error');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('coursesContainer').innerHTML = 
            '<p class="text-center" style="color: var(--text-medium);">Error loading courses.</p>';
    }
}

/**
 * Display courses in a table format
 * @param {Array} courses - Array of course objects
 */
function displayCourses(courses) {
    const container = document.getElementById('coursesContainer');

    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No courses added yet</h3>
                <p>Click "Add Course" to add your current semester courses.</p>
            </div>
        `;
        return;
    }

    // Build courses table
    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Code</th>
                        <th>Credits</th>
                        <th>Difficulty</th>
                        <th>Grade</th>
                        <th>Exam Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    courses.forEach(course => {
        const examDate = new Date(course.examDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        // Determine difficulty badge color
        let diffBadge = 'badge-primary';
        if (course.difficultyLevel >= 4) diffBadge = 'badge-danger';
        else if (course.difficultyLevel >= 3) diffBadge = 'badge-warning';

        html += `
            <tr>
                <td><strong>${course.courseName}</strong></td>
                <td>${course.courseCode}</td>
                <td>${course.creditHours}</td>
                <td><span class="badge ${diffBadge}">${course.difficultyLevel}/5</span></td>
                <td>${course.previousGrade}%</td>
                <td>${examDate}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourse('${course._id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ============ ADD COURSE ============
/**
 * Show the add course form
 */
function showAddCourseForm() {
    document.getElementById('addCourseForm').classList.remove('hidden');
}

/**
 * Hide the add course form
 */
function hideAddCourseForm() {
    document.getElementById('addCourseForm').classList.add('hidden');
}

/**
 * Handle add course form submission
 * Sends new course data to the API
 */
async function handleAddCourse(event) {
    event.preventDefault();

    const courseData = {
        courseName: document.getElementById('courseName').value.trim(),
        courseCode: document.getElementById('courseCode').value.trim(),
        creditHours: document.getElementById('creditHours').value,
        difficultyLevel: document.getElementById('difficultyLevel').value,
        previousGrade: document.getElementById('previousGrade').value,
        examDate: document.getElementById('examDate').value,
        instructor: document.getElementById('instructor').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Course added successfully!', 'success');
            // Reset form and reload courses
            event.target.reset();
            hideAddCourseForm();
            loadCourses();
        } else {
            showAlert(data.message || 'Error adding course', 'error');
        }
    } catch (error) {
        console.error('Error adding course:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// ============ DELETE COURSE ============
/**
 * Delete a course after confirmation
 * @param {string} courseId - The ID of the course to delete
 */
async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Course deleted successfully!', 'success');
            loadCourses(); // Reload the courses list
        } else {
            showAlert(data.message || 'Error deleting course', 'error');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
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
 * Logout function - clear storage and redirect
 */
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
