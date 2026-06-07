/**
 * Database Configuration
 * Mount Kigali University - AI Study Planner
 * 
 * This file handles the MongoDB connection using Mongoose.
 * It reads the connection URI from environment variables.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses the MONGODB_URI from .env file
 * Exits the process if connection fails
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database] Connection Error: ${error.message}`);
        process.exit(1); // Exit process with failure code
    }
};

module.exports = connectDB;
