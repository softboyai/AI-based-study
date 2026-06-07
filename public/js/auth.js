/**
 * Authentication JavaScript (Updated with Role-Based Redirects)
 * Mount Kigali University - AI Study Planner
 * 
 * Handles login and registration for all roles.
 * Redirects each role to their appropriate dashboard after login:
 * - admin -> admin-dashboard.html
 * - lecturer -> lecturer-dashboard.html
 * - student -> dashboard.html (or profile.html if not set up)
 */

// API base URL
const API_URL = '/api';

// ============ CHECK IF ALREADY LOGGED IN ============
(function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
        redirectByRole(user.role, user.profileCompleted);
    }
})();

/**
 * Redirect user to appropriate dashboard based on their role
 * @param {string} role - User role (admin, lecturer, student)
 * @param {boolean} profileCompleted - Whether profile setup is done
 */
function redirectByRole(role, profileCompleted) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'lecturer':
            window.location.href = 'lecturer-dashboard.html';
            break;
        case 'student':
        default:
            if (profileCompleted) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'profile.html';
            }
            break;
    }
}

// ============ TAB SWITCHING ============
function showTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    hideAlert();

    // Hide all forms
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    forgotForm.classList.add('hidden');
    loginTab.classList.remove('active');
    registerTab.classList.remove('active');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        loginTab.classList.add('active');
    } else if (tab === 'register') {
        registerForm.classList.remove('hidden');
        registerTab.classList.add('active');
    } else if (tab === 'forgot') {
        forgotForm.classList.remove('hidden');
    }
}

// ============ LOGIN HANDLER ============
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showAlert('Login successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                redirectByRole(data.user.role, data.user.profileCompleted);
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check your connection.', 'error');
    }
}

// ============ REGISTRATION HANDLER ============
async function handleRegister(event) {
    event.preventDefault();

    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const registrationNumber = document.getElementById('regNumber').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    // Validate password contains both letters and numbers
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
        showAlert('Password must contain both letters and numbers (e.g., Study2024).', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password, registrationNumber, role })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showAlert('Registration successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                redirectByRole(data.user.role, data.user.profileCompleted);
            }, 1500);
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Network error. Please check your connection.', 'error');
    }
}

// ============ FORGOT PASSWORD HANDLER ============
/**
 * Handle forgot password form submission
 * Verifies email + registration number, then resets password
 */
async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();
    const registrationNumber = document.getElementById('forgotRegNumber').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }

    // Validate password strength
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 6 || !hasLetter || !hasNumber) {
        showAlert('Password must be at least 6 characters and contain both letters and numbers.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, registrationNumber, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Password reset successful! You can now login with your new password.', 'success');
            setTimeout(() => showTab('login'), 2000);
        } else {
            showAlert(data.message || 'Password reset failed', 'error');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showAlert('Network error. Please check your connection.', 'error');
    }
}

// ============ ALERT HELPERS ============
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.classList.remove('hidden');
}

function hideAlert() {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.classList.add('hidden');
}
