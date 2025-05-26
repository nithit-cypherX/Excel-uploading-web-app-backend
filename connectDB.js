// connectDB.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from Backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Safe check: Make sure all required env variables are loaded
const requiredEnv = ['MYSQL_HOST', 'MYSQL_USERNAME', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];

requiredEnv.forEach((name) => {
    if (!process.env[name]) {
        console.error(`❌ Missing required environment variable: ${name}`);
        process.exit(1);
    }
});

// Debugging: Check loaded environment variables
console.log('🔎 ENV Variables:', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Create a reusable connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
