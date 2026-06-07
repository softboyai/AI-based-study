/**
 * User Model (Updated with Roles)
 * Mount Kigali University - AI Study Planner
 * 
 * Defines the schema for the 'users' collection in MongoDB.
 * Supports three roles: admin, lecturer, student.
 * Stores registration info, profile details, and credentials.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const userSchema = new mongoose.Schema({
    // Student's/User's full name
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    // Email (used for login)
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    // Hashed password
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    // Registration number (for students) or staff ID (for lecturers/admin)
    registrationNumber: {
        type: String,
        required: [true, 'Registration/Staff number is required'],
        unique: true,
        trim: true
    },
    // User role: admin, lecturer, or student
    role: {
        type: String,
        enum: ['admin', 'lecturer', 'student'],
        default: 'student'
    },
    // Academic program/department
    program: {
        type: String,
        trim: true,
        default: ''
    },
    // Faculty (used by lecturers and for course organization)
    faculty: {
        type: String,
        trim: true,
        default: ''
    },
    // Current year of study (students only)
    yearOfStudy: {
        type: Number,
        min: 1,
        max: 6,
        default: 1
    },
    // Current semester
    semester: {
        type: Number,
        min: 1,
        max: 2,
        default: 1
    },
    // Preferred study hours per day (students only)
    preferredStudyHours: {
        type: Number,
        min: 1,
        max: 16,
        default: 4
    },
    // Whether the user has completed profile setup
    profileCompleted: {
        type: Boolean,
        default: false
    },
    // Whether the account is active (admin can deactivate)
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
});

/**
 * Pre-save middleware to hash password before saving
 * Only hashes if the password field has been modified
 */
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - The plain text password to compare
 * @returns {boolean} - True if passwords match
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
