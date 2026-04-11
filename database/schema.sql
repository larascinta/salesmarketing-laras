-- Create Database
CREATE DATABASE IF NOT EXISTS sales_marketing_db;
USE sales_marketing_db;

-- 1. Users Table (Login Feature)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sales', 'manager') DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Katalog)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers Table (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    status ENUM('lead', 'active', 'inactive') DEFAULT 'lead',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table (POS)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'transfer', 'credit') DEFAULT 'cash',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Transaction Items Table (Detail barang yang dibeli per transaksi)
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================
-- DUMMY DATA SEEDING
-- ==========================================

-- Insert Default Users
-- Catatan: Untuk demo sementara, saya beri password polos '123456'. 
-- Di implementasi backend nanti kita bisa buat logic hash menggunakan bcrypt, 
-- namun agar mudah dites manual dulu kita masukkan teksnya apa adanya.
INSERT INTO users (username, password, role) VALUES 
('admin_sales', '123456', 'admin'),
('sales_1', '123456', 'sales');

-- Insert Products
INSERT INTO products (name, description, price, stock) VALUES
('Laptop Pro 15', 'Laptop performa tinggi 16GB RAM', 15000000.00, 10),
('Wireless Mouse', 'Mouse kerja nirkabel ergonomis', 250000.00, 50),
('Mechanical Keyboard', 'Keyboard mekanik switch merah', 750000.00, 30),
('Monitor 24 inch', 'Monitor IPS lebar warna tajam', 2500000.00, 15);

-- Insert Customers
INSERT INTO customers (name, email, phone, address, status) VALUES
('Budi Santoso', 'budi@example.com', '081234567890', 'Jl. Merdeka No. 1, Jakarta', 'active'),
('Citra Lestari', 'citra@example.com', '089876543210', 'Jl. Sudirman No. 2, Bandung', 'lead'),
('Andi Wijaya', 'andi@example.com', '081122334455', 'Jl. Pahlawan No. 3, Surabaya', 'active');

-- Insert Transactions
-- Total Mesti sesuai dengan logic. 
-- Transaksi 1: 1 Laptop + 1 Mouse = 15.000.000 + 250.000 = 15.250.000
-- Transaksi 2: 1 Monitor + 1 Keyboard = 2.500.000 + 750.000 = 3.250.000
INSERT INTO transactions (user_id, customer_id, total_amount, payment_method) VALUES
(2, 1, 15250000.00, 'transfer'),
(2, 3, 3250000.00, 'cash');

-- Insert Transaction Items
-- Transaksi 1 (ID 1)
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 15000000.00, 15000000.00),
(1, 2, 1, 250000.00, 250000.00);

-- Transaksi 2 (ID 2)
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(2, 4, 1, 2500000.00, 2500000.00),
(2, 3, 1, 750000.00, 750000.00);
