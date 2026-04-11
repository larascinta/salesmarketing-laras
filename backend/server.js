const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. Auth (Login)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await db.execute('SELECT id, username, role FROM users WHERE username = ? AND password = ?', [username, password]);
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. Products
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
         const { name, description, price, stock } = req.body;
         const [result] = await db.execute(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description, price, stock]
         );
         res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. Customers
// ==========================================
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM customers ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
         const { name, email, phone, address, status } = req.body;
         const [result] = await db.execute(
            'INSERT INTO customers (name, email, phone, address, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, address, status || 'lead']
         );
         res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. Transactions (POS)
// ==========================================
app.post('/api/transactions', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { user_id, customer_id, total_amount, payment_method, items } = req.body;

        // Create transaction
        const [txResult] = await connection.execute(
            'INSERT INTO transactions (user_id, customer_id, total_amount, payment_method) VALUES (?, ?, ?, ?)',
            [user_id, customer_id, total_amount, payment_method]
        );
        const transactionId = txResult.insertId;

        // Create items & deduct stock
        for (let item of items) {
            await connection.execute(
                'INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [transactionId, item.product_id, item.quantity, item.unit_price, item.subtotal]
            );
            
            // Deduct stock
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.json({ success: true, transactionId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ==========================================
// 5. Reports (Summary & Analytics)
// ==========================================
app.get('/api/reports/summary', async (req, res) => {
    try {
        // Total Sales Current Month
        const [salesRows] = await db.execute(
            `SELECT SUM(total_amount) as total_sales, COUNT(id) as total_transactions 
             FROM transactions 
             WHERE MONTH(transaction_date) = MONTH(CURRENT_DATE()) 
             AND YEAR(transaction_date) = YEAR(CURRENT_DATE())`
        );
        // Top Selling Products
        const [topProducts] = await db.execute(
            `SELECT p.name, SUM(ti.quantity) as total_sold
             FROM transaction_items ti 
             JOIN products p ON ti.product_id = p.id
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT 5`
        );

        res.json({
            summary: salesRows[0],
            topProducts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Sales Marketing API running on http://localhost:${PORT}`);
});
