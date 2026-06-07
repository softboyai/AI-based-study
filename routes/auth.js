/**
 * Authentication Routes (Updated with Roles)
 * Mount Kigali University - AI Study Planner
 * 
 * Handles user registration, login, and profile management.
 * Supports admin, lecturer, and student roles.
 * Uses bcrypt for password hashing and JWT for token generation.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user account (student, lecturer, or admin)
 * 
 * Request body: { fullName, email, password, registrationNumber, role }
 * Response: { token, user }
 */
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, registrationNumber, role } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !registrationNumber) {
            return res.status(400).json({ 
                message: 'All fields are required: fullName, email, password, registrationNumber' 
            });
        }

        // Validate password strength (must contain letters AND numbers, min 6 chars)
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < 6 || !hasLetter || !hasNumber) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters and contain both letters and numbers' 
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                message: 'A user with this email already exists' 
            });
        }

        // Check if registration number already exists
        const existingReg = await User.findOne({ registrationNumber });
        if (existingReg) {
            return res.status(400).json({ 
                message: 'This registration/staff number is already in use' 
            });
        }

        // Validate role (default to student if not provided)
        const validRoles = ['admin', 'lecturer', 'student'];
        const userRole = validRoles.includes(role) ? role : 'student';

        // Create new user (password will be hashed by the pre-save middleware)
        const user = new User({
            fullName,
            email,
            password,
            registrationNumber,
            role: userRole
        });

        // Save user to database
        await user.save();

        // Generate JWT token (includes role for authorization)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response (exclude password)
        res.status(201).json({
            message: 'Registration successful! Welcome to MKU Study Planner.',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                registrationNumber: user.registrationNumber,
                role: user.role,
                profileCompleted: user.profileCompleted
            }
        });

    } catch (error) {
        console.error('[Auth] Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * POST /api/auth/login
 * Login an existing user (any role)
 * 
 * Request body: { email, password }
 * Response: { token, user } - includes role for frontend redirect
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ 
                message: 'Your account has been deactivated. Contact admin.' 
            });
        }

        // Compare passwords using bcrypt
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token with role
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response with role for frontend redirect
        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                registrationNumber: user.registrationNumber,
                role: user.role,
                profileCompleted: user.profileCompleted
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});

/**
 * POST /api/auth/forgot-password
 * Reset password using email + registration number verification
 * No email sending needed — verifies identity via registration number
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, registrationNumber, newPassword } = req.body;

        // Validate required fields
        if (!email || !registrationNumber || !newPassword) {
            return res.status(400).json({ 
                message: 'Email, registration number, and new password are required' 
            });
        }

        // Validate password strength
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        if (newPassword.length < 6 || !hasLetter || !hasNumber) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters and contain both letters and numbers' 
            });
        }

        // Find user by email AND registration number (both must match)
        const user = await User.findOne({ email, registrationNumber });
        if (!user) {
            return res.status(404).json({ 
                message: 'No account found with this email and registration number combination' 
            });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password reset successful! You can now login with your new password.' });

    } catch (error) {
        console.error('[Auth] Forgot password error:', error.message);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

/**
 * GET /api/auth/me
 * Get current logged-in user's profile
 * Protected route - requires valid JWT token
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('[Auth] Get profile error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile information
 * Protected route - requires valid JWT token
 */
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { program, faculty, yearOfStudy, semester, preferredStudyHours } = req.body;

        // Build update object based on role
        const updateData = { profileCompleted: true };

        if (program) updateData.program = program;
        if (faculty) updateData.faculty = faculty;
        if (yearOfStudy) updateData.yearOfStudy = yearOfStudy;
        if (semester) updateData.semester = semester;
        if (preferredStudyHours) updateData.preferredStudyHours = preferredStudyHours;

        // Update user profile
        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully!',
            user
        });

    } catch (error) {
        console.error('[Auth] Profile update error:', error.message);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

module.exports = router;
