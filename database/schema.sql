-- Create Database
DROP DATABASE IF EXISTS sales_marketing_db;
CREATE DATABASE sales_marketing_db;
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
    price DECIMAL(15,2) NOT NULL,
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
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'transfer', 'credit') DEFAULT 'cash',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================
-- REALISTIC DATA SEEDING : Electro Ayas
-- ==========================================

-- Insert Default Users
INSERT INTO users (username, password, role) VALUES 
('admin_ayas', '123456', 'admin'),
('sales_agus', '123456', 'sales');

-- Insert Electronics Products
INSERT INTO products (name, description, price, stock) VALUES
('iPhone 15 Pro Max 256GB', 'Apple A17 Pro, 48MP Camera, Titanium Body', 24999000.00, 15),
('Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3 for Galaxy, S Pen, AI', 21999000.00, 20),
('MacBook Pro M3 14-inch', 'Apple M3 Chip, 16GB Unified Memory, 512GB SSD', 31500000.00, 10),
('Sony Bravia XR 65" 4K OLED', 'Smart Google TV, Acoustic Surface Audio+', 27500000.00, 8),
('ASUS ROG Strix G16', 'Intel Core i9-13980HX, RTX 4070, Nebula Display', 35999000.00, 5),
('Xiaomi Smart TV A2 43"', 'Android TV, Dolby Audio, Bezel-less', 3800000.00, 25),
('DJI Mini 4 Pro', 'Drone dengan Remote RC 2, Video 4K HDR', 14500000.00, 12);

-- Insert Corporate & Individual Customers
INSERT INTO customers (name, email, phone, address, status) VALUES
('PT. Maju Teknologi Nusantara', 'procurement@majutech.co.id', '021-55667788', 'Gedung Cyber, Jakarta Selatan', 'active'),
('Dian Sastrowardoyo', 'dian.s@example.com', '081299998888', 'Residence Indah Menteng, Jakarta', 'active'),
('Budi Komputer Service', 'budiservice@example.com', '081344556677', 'Jl. Braga No 15, Bandung', 'lead');

-- Insert Initial Transactions
-- Transaksi 1: 3x MacBook Pro (PT. Maju Teknologi) -> 94,500,000
-- Transaksi 2: 1x iPhone 15 Pro Max (Dian) -> 24,999,000
INSERT INTO transactions (user_id, customer_id, total_amount, payment_method) VALUES
(2, 1, 94500000.00, 'transfer'),
(2, 2, 24999000.00, 'credit');

-- Insert Transaction Items
-- Untuk PT. Maju Teknologi
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 3, 3, 31500000.00, 94500000.00); 

-- Untuk Dian 
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(2, 1, 1, 24999000.00, 24999000.00);
