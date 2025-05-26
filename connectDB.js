// connectDB.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from Backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Safe check
const requiredEnv = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DB', 'MYSQL_PORT'];

requiredEnv.forEach((name) => {
    if (!process.env[name]) {
        console.error(`❌ Missing required environment variable: ${name}`);
        process.exit(1);
    }
});

// Debug
console.log('🔎 ENV Variables:', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT,
});

// Create pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
