-- PostgreSQL Schema for Neon

-- 1. Users Table (Login Feature)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'sales' CHECK (role IN ('admin', 'sales', 'manager')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Katalog)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers Table (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table (POS)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT,
    customer_id INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'credit')),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
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
('sales_agus', '123456', 'sales')
ON CONFLICT (username) DO NOTHING;

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
INSERT INTO customers (username, password, name, email, phone, address, status) VALUES
('maju_tech', '123456', 'PT. Maju Teknologi Nusantara', 'procurement@majutech.co.id', '021-55667788', 'Gedung Cyber, Jakarta Selatan', 'active'),
('dian_s', '123456', 'Dian Sastrowardoyo', 'dian.s@example.com', '081299998888', 'Residence Indah Menteng, Jakarta', 'active'),
('budi_cust', '123456', 'Budi Komputer Service', 'budiservice@example.com', '081344556677', 'Jl. Braga No 15, Bandung', 'lead')
ON CONFLICT (username) DO NOTHING;

-- Insert Initial Transactions (We will skip data seeding for transactions to avoid ID constraint issues on redeployments, or we just insert them as examples)
-- We use a simplified seed script to avoid serial ID mismatch:
-- The IDs generated above might be 1, 2, 3...
INSERT INTO transactions (user_id, customer_id, total_amount, payment_method) VALUES
(2, 1, 94500000.00, 'transfer'),
(2, 2, 24999000.00, 'credit');

INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 3, 3, 31500000.00, 94500000.00); 

INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(2, 1, 1, 24999000.00, 24999000.00);
