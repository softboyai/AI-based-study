/**
 * Lecturer Dashboard JavaScript
 * Mount Kigali University - AI Study Planner
 * 
 * HOW STUDENT-LECTURER LINKING WORKS:
 * - Lecturer creates courses with course codes (e.g., CSC 4101)
 * - Students register courses with the same course codes
 * - The system AUTOMATICALLY links them by matching course codes
 * - Lecturer sees all students who have their course codes
 * - No manual assignment needed!
 */

const API_URL = '/api';

// ============ AUTHENTICATION CHECK ============
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'lecturer') {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ============ PAGE INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.fullName} (Lecturer)`;
    loadStats();
    loadCourses();
});

// ============ SECTION SWITCHING ============
function showSection(section) {
    document.getElementById('sectionCourses').classList.add('hidden');
    document.getElementById('sectionStudents').classList.add('hidden');
    document.getElementById('sectionProgress').classList.add('hidden');
    document.getElementById('sectionReports').classList.add('hidden');

    document.getElementById('tabCourses').classList.remove('active');
    document.getElementById('tabStudents').classList.remove('active');
    document.getElementById('tabProgress').classList.remove('active');
    document.getElementById('tabReports').classList.remove('active');

    const sectionId = 'section' + section.charAt(0).toUpperCase() + section.slice(1);
    const tabId = 'tab' + section.charAt(0).toUpperCase() + section.slice(1);

    document.getElementById(sectionId).classList.remove('hidden');
    document.getElementById(tabId).classList.add('active');

    // Load data for the section
    if (section === 'students') loadStudents();
    if (section === 'progress') loadProgress();
}

// ============ LOAD STATISTICS ============
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/lecturer/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById('totalCourses').textContent = data.stats.totalCourses;
            document.getElementById('totalStudents').textContent = data.stats.totalStudents;
            document.getElementById('totalProgress').textContent = data.stats.totalProgressEntries;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============ COURSE MANAGEMENT ============
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/lecturer/courses`, {
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
        container.innerHTML = `
            <div class="empty-state">
                <h3>No courses added yet</h3>
                <p>Click "Add Course" to create your first course. Students who register the same course code will automatically appear in your Students tab.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="alert alert-info mb-2">
            <strong>How it works:</strong> Students who register a course with the same course code (e.g., CSC 4101) are automatically linked to you. Check the "My Students" tab to see them.
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Code</th>
                        <th>Credits</th>
                        <th>Difficulty</th>
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

        let diffBadge = 'badge-primary';
        if (course.difficultyLevel >= 4) diffBadge = 'badge-danger';
        else if (course.difficultyLevel >= 3) diffBadge = 'badge-warning';

        html += `
            <tr>
                <td><strong>${course.courseName}</strong></td>
                <td><span class="badge badge-primary">${course.courseCode}</span></td>
                <td>${course.creditHours}</td>
                <td><span class="badge ${diffBadge}">${course.difficultyLevel}/5</span></td>
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

function showAddCourseForm() {
    document.getElementById('addCourseForm').classList.remove('hidden');
}

function hideAddCourseForm() {
    document.getElementById('addCourseForm').classList.add('hidden');
}

async function handleAddCourse(event) {
    event.preventDefault();

    const courseData = {
        courseName: document.getElementById('courseName').value.trim(),
        courseCode: document.getElementById('courseCode').value.trim().toUpperCase(),
        creditHours: document.getElementById('creditHours').value,
        difficultyLevel: document.getElementById('difficultyLevel').value,
        examDate: document.getElementById('examDate').value,
        instructor: document.getElementById('instructor').value.trim() || user.fullName
    };

    try {
        const response = await fetch(`${API_URL}/lecturer/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Course added successfully! Students who register this course code will be linked automatically.', 'success');
            event.target.reset();
            hideAddCourseForm();
            loadCourses();
            loadStats();
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Delete this course?')) return;

    try {
        const response = await fetch(`${API_URL}/lecturer/courses/${courseId}`, {
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

// ============ STUDENTS (AUTO-LINKED BY COURSE CODE) ============
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/lecturer/students`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayStudents(data.students);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function displayStudents(students) {
    const container = document.getElementById('studentsContainer');

    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No students linked yet</h3>
                <p>Students will appear here automatically when they register a course with the same course code as yours.</p>
                <p style="color: var(--text-light); font-size: 0.85rem; margin-top: 8px;">
                    For example: If you created course <strong>CSC 4101</strong>, any student who adds CSC 4101 to their profile will appear here.
                </p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="alert alert-info mb-2">
            These students are automatically linked because they registered courses with the same course codes as yours.
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Reg Number</th>
                        <th>Email</th>
                        <th>Program</th>
                        <th>Year</th>
                        <th>Enrolled Courses</th>
                    </tr>
                </thead>
                <tbody>
    `;

    students.forEach(student => {
        const courseBadges = student.courses.map(c => 
            `<span class="badge badge-primary" style="margin: 2px;">${c.courseCode}</span>`
        ).join(' ');

        html += `
            <tr>
                <td><strong>${student.fullName}</strong></td>
                <td>${student.registrationNumber}</td>
                <td>${student.email}</td>
                <td>${student.program || '-'}</td>
                <td>${student.yearOfStudy || '-'}</td>
                <td>${courseBadges}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ============ STUDENT PROGRESS ============
async function loadProgress() {
    try {
        const response = await fetch(`${API_URL}/lecturer/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayProgress(data.progress);
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

function displayProgress(progressEntries) {
    const container = document.getElementById('progressContainer');

    if (!progressEntries || progressEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No student progress data yet</h3>
                <p>Progress will appear here when students log study sessions for your courses.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Hours</th>
                        <th>Status</th>
                        <th>Understanding</th>
                    </tr>
                </thead>
                <tbody>
    `;

    progressEntries.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-GB');
        const studentName = entry.user ? entry.user.fullName : 'Unknown';
        const courseName = entry.course ? `${entry.course.courseCode} - ${entry.course.courseName}` : 'Unknown';
        const statusBadge = entry.completed ? 'badge-success' : 'badge-warning';
        const stars = '★'.repeat(entry.understandingLevel) + '☆'.repeat(5 - entry.understandingLevel);

        html += `
            <tr>
                <td><strong>${studentName}</strong></td>
                <td>${courseName}</td>
                <td>${date}</td>
                <td>${entry.hoursStudied}h</td>
                <td><span class="badge ${statusBadge}">${entry.completed ? 'Done' : 'Partial'}</span></td>
                <td style="color: var(--warning);">${stars}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ============ PDF REPORT ============
function downloadPDFReport() {
    fetch(`${API_URL}/lecturer/reports/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MKU_Lecturer_Report.pdf';
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
