const mysql = require('mysql2/promise');

// Jika ada URL koneksi dari Cloud, pakai URL tersebut. Kalau tidak pakai koneksi lokal.
let pool;
if (process.env.DATABASE_URL) {
    pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} else {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '', // XAMPP default is empty
        database: process.env.DB_NAME || 'sales_marketing_db', // Ensure this matches schema.sql
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = pool;
