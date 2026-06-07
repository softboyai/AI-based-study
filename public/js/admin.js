/**
 * Admin Dashboard JavaScript
 * Mount Kigali University - AI Study Planner
 * 
 * Handles all admin dashboard functionality:
 * - User management (CRUD)
 * - Course viewing
 * - System statistics
 * - PDF report download
 */

const API_URL = '/api';

// ============ AUTHENTICATION CHECK ============
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'admin') {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ============ PAGE INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.fullName} (Admin)`;
    loadStats();
    loadUsers();
});

// ============ SECTION SWITCHING ============
function showSection(section) {
    // Hide all sections
    document.getElementById('sectionUsers').classList.add('hidden');
    document.getElementById('sectionCourses').classList.add('hidden');
    document.getElementById('sectionReports').classList.add('hidden');

    // Remove active from all tabs
    document.getElementById('tabUsers').classList.remove('active');
    document.getElementById('tabCourses').classList.remove('active');
    document.getElementById('tabReports').classList.remove('active');

    // Show selected section
    document.getElementById('section' + section.charAt(0).toUpperCase() + section.slice(1)).classList.remove('hidden');
    document.getElementById('tab' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');

    // Load data for the section
    if (section === 'courses') loadCourses();
    if (section === 'reports') loadRecentUsers();
}

// ============ LOAD STATISTICS ============
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById('totalStudents').textContent = data.stats.totalStudents;
            document.getElementById('totalLecturers').textContent = data.stats.totalLecturers;
            document.getElementById('totalCourses').textContent = data.stats.totalCourses;
            document.getElementById('totalPlans').textContent = data.stats.totalPlans;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============ USER MANAGEMENT ============
async function loadUsers() {
    try {
        const role = document.getElementById('filterRole').value;
        const search = document.getElementById('searchUser').value;
        let url = `${API_URL}/admin/users?`;
        if (role) url += `role=${role}&`;
        if (search) url += `search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayUsers(data.users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersContainer');

    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No users found</h3></div>';
        return;
    }

    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Reg/Staff No</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    users.forEach(u => {
        const roleBadge = u.role === 'admin' ? 'badge-danger' : u.role === 'lecturer' ? 'badge-primary' : 'badge-success';
        const statusBadge = u.isActive ? 'badge-success' : 'badge-danger';

        html += `
            <tr>
                <td><strong>${u.fullName}</strong></td>
                <td>${u.email}</td>
                <td>${u.registrationNumber}</td>
                <td><span class="badge ${roleBadge}">${u.role}</span></td>
                <td><span class="badge ${statusBadge}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}" 
                        onclick="toggleUserStatus('${u._id}', ${!u.isActive})">
                        ${u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}', '${u.fullName}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function showCreateUserForm() {
    document.getElementById('createUserForm').classList.remove('hidden');
}

function hideCreateUserForm() {
    document.getElementById('createUserForm').classList.add('hidden');
}

async function handleCreateUser(event) {
    event.preventDefault();

    const userData = {
        fullName: document.getElementById('newUserName').value.trim(),
        email: document.getElementById('newUserEmail').value.trim(),
        registrationNumber: document.getElementById('newUserRegNo').value.trim(),
        role: document.getElementById('newUserRole').value,
        password: document.getElementById('newUserPassword').value,
        faculty: document.getElementById('newUserFaculty').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(data.message, 'success');
            hideCreateUserForm();
            event.target.reset();
            loadUsers();
            loadStats();
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function toggleUserStatus(userId, isActive) {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive })
        });

        if (response.ok) {
            showAlert(`User ${isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
            loadUsers();
        }
    } catch (error) {
        showAlert('Error updating user', 'error');
    }
}

async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete "${userName}"? This will also delete all their courses, plans, and progress data.`)) return;

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(data.message, 'success');
            loadUsers();
            loadStats();
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        showAlert('Error deleting user', 'error');
    }
}

// ============ COURSES ============
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/admin/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayCourses(data.courses);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function displayCourses(courses) {
    const container = document.getElementById('coursesContainer');

    if (courses.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No courses in the system</h3></div>';
        return;
    }

    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Code</th>
                        <th>Credits</th>
                        <th>Difficulty</th>
                        <th>Exam Date</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    courses.forEach(course => {
        const examDate = new Date(course.examDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        const assignedTo = course.user ? `${course.user.fullName} (${course.user.role})` : 'Unassigned';

        html += `
            <tr>
                <td><strong>${course.courseName}</strong></td>
                <td>${course.courseCode}</td>
                <td>${course.creditHours}</td>
                <td>${course.difficultyLevel}/5</td>
                <td>${examDate}</td>
                <td>${assignedTo}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourse('${course._id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function deleteCourse(courseId) {
    if (!confirm('Delete this course?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showAlert('Course deleted!', 'success');
            loadCourses();
            loadStats();
        }
    } catch (error) {
        showAlert('Error deleting course', 'error');
    }
}

// ============ REPORTS ============
async function loadRecentUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.recentUsers) {
            let html = '<div class="table-container"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>';
            data.recentUsers.forEach(u => {
                const joined = new Date(u.createdAt).toLocaleDateString('en-GB');
                html += `<tr><td>${u.fullName}</td><td>${u.email}</td><td><span class="badge badge-primary">${u.role}</span></td><td>${joined}</td></tr>`;
            });
            html += '</tbody></table></div>';
            document.getElementById('recentUsersContainer').innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading recent users:', error);
    }
}

function downloadPDFReport() {
    // Open PDF in new tab (browser will handle download)
    window.open(`${API_URL}/admin/reports/pdf?token=${token}`, '_blank');
    
    // Alternative: use fetch with auth header
    fetch(`${API_URL}/admin/reports/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MKU_System_Report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showAlert('PDF report downloaded successfully!', 'success');
    })
    .catch(error => {
        showAlert('Error downloading report', 'error');
    });
}

// ============ UTILITY FUNCTIONS ============
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.classList.remove('hidden');
    setTimeout(() => alertDiv.classList.add('hidden'), 5000);
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
