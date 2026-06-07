/**
 * Authentication & Authorization Middleware
 * Mount Kigali University - AI Study Planner
 * 
 * This middleware provides:
 * 1. JWT token verification for protected routes
 * 2. Role-based access control (admin, lecturer, student)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Basic authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: 'Access denied. No token provided.' 
            });
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.replace('Bearer ', '');

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.userId = decoded.userId;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        res.status(401).json({ 
            message: 'Invalid or expired token. Please login again.' 
        });
    }
};

/**
 * Role-based authorization middleware factory
 * Creates middleware that only allows specified roles
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'lecturer', 'student')
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is in the allowed roles
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ 
                message: 'Access denied. You do not have permission to access this resource.' 
            });
        }
        next();
    };
};

/**
 * Admin-only middleware
 * Shortcut for authorize('admin')
 */
const adminOnly = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ 
            message: 'Access denied. Admin privileges required.' 
        });
    }
    next();
};

/**
 * Lecturer-only middleware
 * Shortcut for authorize('lecturer')
 */
const lecturerOnly = (req, res, next) => {
    if (req.userRole !== 'lecturer') {
        return res.status(403).json({ 
            message: 'Access denied. Lecturer privileges required.' 
        });
    }
    next();
};

/**
 * Student-only middleware
 * Shortcut for authorize('student')
 */
const studentOnly = (req, res, next) => {
    if (req.userRole !== 'student') {
        return res.status(403).json({ 
            message: 'Access denied. Student privileges required.' 
        });
    }
    next();
};

module.exports = { 
    authMiddleware, 
    authorize, 
    adminOnly, 
    lecturerOnly, 
    studentOnly 
};
