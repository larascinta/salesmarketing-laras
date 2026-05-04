import Script from "next/script";

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: `
    
    <!-- Public Landing Page -->
    <div id="landing-view" class="view active">
        <nav class="public-navbar glassmorphism">
            <div class="nav-brand"><i class="fa-solid fa-microchip"></i> Electro Ayas</div>
            <ul class="public-nav-links">
                <li><a href="#hero-section">Beranda</a></li>
                <li><a href="#public-products">Produk</a></li>
            </ul>
            <div class="nav-actions">
                <div id="user-actions" style="display: none; align-items: center; gap: 10px;">
                    <span id="customer-name-display" style="font-weight: 600;"></span>
                    <button id="btn-public-cart" class="btn-primary hover-anim"><i class="fa-solid fa-cart-shopping"></i> Keranjang (<span id="cart-count">0</span>)</button>
                    <button id="btn-customer-logout" class="btn-outline hover-anim"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
                <div id="guest-actions">
                    <button id="btn-show-customer-login" class="btn-primary hover-anim">Login / Daftar</button>
                </div>
                <button id="btn-show-admin-login" class="btn-outline hover-anim" style="margin-left: 10px;" title="Admin Portal"><i class="fa-solid fa-user-shield"></i></button>
            </div>
        </nav>

        <section id="hero-section" class="public-hero">
            <div class="hero-content">
                <h1>Teknologi Terdepan di Tangan Anda</h1>
                <p>Temukan perangkat elektronik premium bergaransi resmi untuk kebutuhan personal maupun corporate.</p>
                <a href="#public-products" class="btn-primary hover-anim hero-btn">Mulai Belanja</a>
            </div>
        </section>

        <section id="public-products" class="public-section">
            <h2 class="section-title">Katalog Kami</h2>
            <div class="public-product-grid" id="public-product-list">
                <!-- Products injected by JS -->
            </div>
        </section>
        
        <footer class="public-footer glassmorphism text-center">
            <p>&copy; 2026 Electro Ayas. All rights reserved.</p>
        </footer>
    </div>

    <!-- Admin Login Screen -->
    <div id="admin-login-view" class="view" style="display: none;">
        <div class="login-container glassmorphism">
            <div class="login-header">
                <i class="fa-solid fa-user-shield logo-icon"></i>
                <h2>Admin Portal</h2>
                <p>Sales Marketing Pro System</p>
            </div>
            <form id="admin-login-form">
                <div class="input-group">
                    <label for="admin-username">Username</label>
                    <div class="input-icon">
                        <i class="fa-regular fa-user"></i>
                        <input type="text" id="admin-username" placeholder="Demo: admin_ayas" required>
                    </div>
                </div>
                <div class="input-group">
                    <label for="admin-password">Password</label>
                    <div class="input-icon">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" id="admin-password" placeholder="Demo: 123456" required>
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-top: 15px;">
                    <button type="button" id="btn-back-home" class="btn-outline w-100 hover-anim">Batal</button>
                    <button type="submit" class="btn-primary w-100 hover-anim">Log In</button>
                </div>
                <div id="admin-login-error" class="error-msg"></div>
            </form>
        </div>
    </div>

    <!-- Main Application (Admin Dashboard) -->
    <div id="app-view" class="view" style="display: none;">
        <nav class="sidebar glassmorphism">
            <div class="sidebar-brand">
                <i class="fa-solid fa-chart-line"></i> SalesPro
            </div>
            <ul class="nav-links">
                <li><a href="#" data-target="dashboard" class="nav-item active"><i class="fa-solid fa-chart-pie"></i> Laporan Dashboard</a></li>
                <li><a href="#" data-target="transactions" class="nav-item"><i class="fa-solid fa-cart-shopping"></i> Transaksi POS</a></li>
                <li><a href="#" data-target="products" class="nav-item"><i class="fa-solid fa-box"></i> Data Produk</a></li>
                <li><a href="#" data-target="customers" class="nav-item"><i class="fa-solid fa-users"></i> Data Customer</a></li>
            </ul>
            <div class="user-profile">
                <div class="avatar"><i class="fa-solid fa-user"></i></div>
                <div class="user-info">
                    <span id="user-display-name">Admin</span>
                    <small id="user-role">Manager</small>
                </div>
                <button id="logout-btn" title="Logout"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
        </nav>

        <main class="main-content">
            <header class="topbar">
                <h2 id="page-title">Dashboard</h2>
            </header>

            <div class="content-wrapper">
                <!-- Dashboard View -->
                <section id="dashboard" class="page-section active">
                    <div class="stats-grid">
                        <div class="stat-card glassmorphism hover-anim">
                            <div class="stat-icon b-blue"><i class="fa-solid fa-money-bill-wave"></i></div>
                            <div class="stat-info">
                                <h3>Total Penjualan Bulan Ini</h3>
                                <p id="total-sales">Rp 0</p>
                            </div>
                        </div>
                        <div class="stat-card glassmorphism hover-anim">
                            <div class="stat-icon b-green"><i class="fa-solid fa-bag-shopping"></i></div>
                            <div class="stat-info">
                                <h3>Total Transaksi</h3>
                                <p id="total-trx">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-container glassmorphism mt-4 hover-anim">
                        <h3>Top 5 Produk Terlaris</h3>
                        <table class="data-table mt-2">
                            <thead>
                                <tr>
                                    <th>Produk</th>
                                    <th>Terjual</th>
                                </tr>
                            </thead>
                            <tbody id="top-products-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- Transactions View -->
                <section id="transactions" class="page-section" style="display: none;">
                    <div class="pos-layout">
                        <!-- Product Selection -->
                        <div class="pos-products glassmorphism">
                            <h3>Pilih Produk</h3>
                            <div class="product-grid" id="pos-product-list">
                            </div>
                        </div>
                        <!-- Cart -->
                        <div class="pos-cart glassmorphism">
                            <h3>Keranjang Transaksi</h3>
                            <div class="cart-items" id="cart-items">
                                <p class="empty-cart">Keranjang masih kosong</p>
                            </div>
                            
                            <div class="cart-summary mt-3">
                                <div class="form-group mb-2">
                                    <label>Customer:</label>
                                    <select id="pos-customer-select" class="form-control">
                                        <option value="">-- Pilih Customer --</option>
                                    </select>
                                </div>
                                <div class="form-group mb-2">
                                    <label>Metode Pembayaran:</label>
                                    <select id="pos-payment" class="form-control">
                                        <option value="cash">Tunai (Cash)</option>
                                        <option value="transfer">Transfer Bank</option>
                                        <option value="credit">Kartu Kredit</option>
                                    </select>
                                </div>
                                <div class="total-bar">
                                    <span>Total:</span>
                                    <strong id="pos-total">Rp 0</strong>
                                </div>
                                <button class="btn-primary w-100 mt-2 hover-anim" id="btn-checkout">Bayar Sekarang</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Products View -->
                <section id="products" class="page-section" style="display: none;">
                    <div class="layout-header">
                        <button class="btn-primary hover-anim" id="btn-add-product"><i class="fa-solid fa-plus"></i> Tambah Produk</button>
                    </div>
                    <div class="table-container glassmorphism mt-3">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nama Produk</th>
                                    <th>Harga</th>
                                    <th>Stok</th>
                                </tr>
                            </thead>
                            <tbody id="products-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- Customers View -->
                <section id="customers" class="page-section" style="display: none;">
                    <div class="layout-header">
                        <button class="btn-primary hover-anim" id="btn-add-customer"><i class="fa-solid fa-plus"></i> Tambah Customer</button>
                    </div>
                    <div class="table-container glassmorphism mt-3">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>No. HP</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="customers-tbody"></tbody>
                        </table>
                    </div>
                </section>
                
            </div>
        </main>
    </div>

    <!-- Modal Form (Admin Data Entry) -->
    <div id="data-modal" class="modal">
        <div class="modal-content glassmorphism">
            <span class="close" data-modal="data-modal">&times;</span>
            <h3 id="modal-title">Form Title</h3>
            <form id="data-form" class="mt-3">
                <div id="form-fields"></div>
                <button type="submit" class="btn-primary w-100 mt-3 hover-anim">Simpan Data</button>
            </form>
        </div>
    </div>

    <!-- Modal Form (Customer Auth) -->
    <div id="customer-auth-modal" class="modal">
        <div class="modal-content glassmorphism" style="max-width: 350px;">
            <span class="close" data-modal="customer-auth-modal">&times;</span>
            
            <div id="customer-login-box">
                <h3>Login Customer</h3>
                <form id="customer-login-form" class="mt-3">
                    <div class="form-group mb-2"><label>Username</label><input type="text" id="cust-login-username" class="form-control" placeholder="Demo: budi_cust" required></div>
                    <div class="form-group mb-2"><label>Password</label><input type="password" id="cust-login-password" class="form-control" placeholder="Demo: 123456" required></div>
                    <button type="submit" class="btn-primary w-100 mt-2 hover-anim">Login</button>
                    <p class="text-center mt-3" style="font-size:0.9rem;">Belum punya akun? <a href="#" id="link-to-register">Daftar</a></p>
                </form>
            </div>

            <div id="customer-register-box" style="display:none;">
                <h3>Daftar Akun Baru</h3>
                <form id="customer-register-form" class="mt-3">
                    <div class="form-group mb-2"><label>Nama Lengkap</label><input type="text" id="cust-reg-name" class="form-control" required></div>
                    <div class="form-group mb-2"><label>Email</label><input type="email" id="cust-reg-email" class="form-control" required></div>
                    <div class="form-group mb-2"><label>No HP</label><input type="text" id="cust-reg-phone" class="form-control" required></div>
                    <div class="form-group mb-2"><label>Username</label><input type="text" id="cust-reg-username" class="form-control" required></div>
                    <div class="form-group mb-2"><label>Password</label><input type="password" id="cust-reg-password" class="form-control" required></div>
                    <button type="submit" class="btn-primary w-100 mt-2 hover-anim">Daftar</button>
                    <p class="text-center mt-3" style="font-size:0.9rem;">Sudah punya akun? <a href="#" id="link-to-login">Login</a></p>
                </form>
            </div>
            
        </div>
    </div>

    <!-- Modal Form (Public Shopping Cart) -->
    <div id="public-cart-modal" class="modal">
        <div class="modal-content glassmorphism" style="max-width: 500px; padding: 1.5rem;">
            <span class="close" data-modal="public-cart-modal">&times;</span>
            <h3>Keranjang Belanja</h3>
            <div id="public-cart-items" class="cart-items mt-3">
                <p class="empty-cart">Keranjang masih kosong</p>
            </div>
            <div class="cart-summary mt-3">
                <div class="form-group mb-2">
                    <label>Metode Pembayaran:</label>
                    <select id="public-payment-method" class="form-control">
                        <option value="transfer">Transfer Bank</option>
                        <option value="credit">Kartu Kredit</option>
                        <option value="cash">COD (Cash on Delivery)</option>
                    </select>
                </div>
                <div class="total-bar">
                    <span>Total Pembayaran:</span>
                    <strong id="public-cart-total">Rp 0</strong>
                </div>
                <button id="btn-public-checkout" class="btn-primary w-100 mt-2 hover-anim">Selesaikan Pesanan</button>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast" class="toast">Notifikasi!</div>

    ` }} />
      <Script src="/app.js?v=2" strategy="afterInteractive" />
    </>
  );
}