const API_URL = 'https://shaky-cobras-jog.loca.lt/api';

// Global State
let currentUser = null; // Admin/Sales
let currentCustomer = null; // Public Customer
let posCart = []; // Admin POS Cart
let publicCart = []; // Customer Public Cart
let allProducts = [];
let allCustomers = [];

// Format Rupiah
const formatRp = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

// Utility: Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// Initial Load for Landing Page
document.addEventListener('DOMContentLoaded', () => {
    loadPublicProducts();
    updateCustomerUI();
});

// View Switching
document.getElementById('btn-show-admin-login').addEventListener('click', () => {
    document.getElementById('landing-view').style.display = 'none';
    document.getElementById('admin-login-view').style.display = 'flex';
});

document.getElementById('btn-back-home').addEventListener('click', () => {
    document.getElementById('admin-login-view').style.display = 'none';
    document.getElementById('landing-view').style.display = 'block';
});

// Admin Navigation Logic
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const target = e.currentTarget.getAttribute('data-target');
        document.getElementById('page-title').textContent = e.currentTarget.textContent.trim();
        
        document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
        document.getElementById(target).style.display = 'block';
        
        loadDataFor(target);
    });
});

function loadDataFor(target) {
    if(target === 'dashboard') loadDashboard();
    if(target === 'products') loadProducts();
    if(target === 'customers') loadCustomers();
    if(target === 'transactions') loadPOS();
}

// =======================
// ADMIN AUTHENTICATION
// =======================
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    try {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Login...';
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        
        const data = await res.json();
        if(res.ok && data.success) {
            currentUser = data.user;
            document.getElementById('admin-login-view').style.display = 'none';
            document.getElementById('app-view').style.display = 'flex';
            document.getElementById('user-display-name').textContent = currentUser.username;
            document.getElementById('user-role').textContent = currentUser.role;
            
            loadDashboard();
        } else {
            document.getElementById('admin-login-error').textContent = data.message || 'Login gagal';
        }
    } catch(err) {
        document.getElementById('admin-login-error').textContent = 'Gagal memanggil backend API.';
    } finally {
        btn.textContent = 'Log In';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('landing-view').style.display = 'block';
    document.getElementById('admin-login-form').reset();
    document.getElementById('admin-login-error').textContent = '';
});

// =======================
// PUBLIC LANDING PAGE
// =======================
async function loadPublicProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        if(!res.ok) throw new Error('API Error');
        allProducts = await res.json();
        
        const grid = document.getElementById('public-product-list');
        grid.innerHTML = '';
        allProducts.forEach(p => {
            if(p.stock > 0) {
                grid.innerHTML += `
                    <div class="public-product-card">
                        <h3>${p.name}</h3>
                        <p class="desc">${p.description || 'Tidak ada deskripsi'}</p>
                        <span class="price">${formatRp(p.price)}</span>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <small style="color:var(--text-muted)">Stok: ${p.stock}</small>
                            <button class="btn-primary hover-anim" onclick="addPublicCart(${p.id})">+ Keranjang</button>
                        </div>
                    </div>
                `;
            }
        });
    } catch (e) { console.error('Public Products Error', e); }
}

function updateCustomerUI() {
    if(currentCustomer) {
        document.getElementById('guest-actions').style.display = 'none';
        document.getElementById('user-actions').style.display = 'flex';
        document.getElementById('customer-name-display').textContent = 'Hi, ' + currentCustomer.name;
    } else {
        document.getElementById('guest-actions').style.display = 'block';
        document.getElementById('user-actions').style.display = 'none';
    }
}

// Modals Handling
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-modal');
        document.getElementById(modalId).style.display = 'none';
    });
});

document.getElementById('btn-show-customer-login').addEventListener('click', () => {
    document.getElementById('customer-auth-modal').style.display = 'flex';
    document.getElementById('customer-login-box').style.display = 'block';
    document.getElementById('customer-register-box').style.display = 'none';
});

document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('customer-login-box').style.display = 'none';
    document.getElementById('customer-register-box').style.display = 'block';
});

document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('customer-register-box').style.display = 'none';
    document.getElementById('customer-login-box').style.display = 'block';
});

// Customer Auth
document.getElementById('customer-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('cust-login-username').value;
    const password = document.getElementById('cust-login-password').value;
    
    try {
        const res = await fetch(`${API_URL}/customer-login`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if(data.success) {
            currentCustomer = data.customer;
            document.getElementById('customer-auth-modal').style.display = 'none';
            updateCustomerUI();
            showToast('Berhasil Login!');
        } else {
            showToast(data.message || 'Login gagal.');
        }
    } catch(err) { showToast('Gagal memanggil API.'); }
});

document.getElementById('customer-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('cust-reg-name').value,
        email: document.getElementById('cust-reg-email').value,
        phone: document.getElementById('cust-reg-phone').value,
        username: document.getElementById('cust-reg-username').value,
        password: document.getElementById('cust-reg-password').value
    };
    try {
        const res = await fetch(`${API_URL}/customer-register`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) {
            showToast('Registrasi sukses. Silakan login.');
            document.getElementById('customer-register-box').style.display = 'none';
            document.getElementById('customer-login-box').style.display = 'block';
        } else {
            showToast(data.message || 'Gagal register.');
        }
    } catch(err) { showToast('Gagal memanggil API.'); }
});

document.getElementById('btn-customer-logout').addEventListener('click', () => {
    currentCustomer = null;
    publicCart = [];
    renderPublicCart();
    updateCustomerUI();
    showToast('Berhasil Logout');
});

// Public Cart
window.addPublicCart = function(productId) {
    if(!currentCustomer) {
        showToast('Silakan login terlebih dahulu untuk belanja.');
        document.getElementById('customer-auth-modal').style.display = 'flex';
        document.getElementById('customer-login-box').style.display = 'block';
        document.getElementById('customer-register-box').style.display = 'none';
        return;
    }
    const product = allProducts.find(p => p.id === productId);
    const exist = publicCart.find(item => item.product_id === productId);
    if(exist) {
        if(exist.quantity < product.stock) {
            exist.quantity++;
            exist.subtotal = exist.quantity * exist.unit_price;
            showToast('Jumlah ditambahkan');
        } else {
            showToast('Stok tidak cukup!');
        }
    } else {
        publicCart.push({
            product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1,
            subtotal: Number(product.price)
        });
        showToast('Produk ditambahkan ke keranjang');
    }
    renderPublicCart();
}

window.updatePublicCartQty = function(id, delta) {
    const item = publicCart.find(i => i.product_id === id);
    if(!item) return;
    const prod = allProducts.find(p => p.id === id);
    
    item.quantity += delta;
    if(item.quantity <= 0) {
        publicCart = publicCart.filter(i => i.product_id !== id);
    } else if (item.quantity > prod.stock) {
        item.quantity--;
        showToast('Stok tidak cukup!');
    } else {
        item.subtotal = item.quantity * item.unit_price;
    }
    renderPublicCart();
}

function renderPublicCart() {
    document.getElementById('cart-count').textContent = publicCart.reduce((sum, item) => sum + item.quantity, 0);
    const list = document.getElementById('public-cart-items');
    list.innerHTML = '';
    let total = 0;
    
    if(publicCart.length === 0) {
        list.innerHTML = '<p class="empty-cart">Keranjang masih kosong</p>';
    } else {
        publicCart.forEach(item => {
            total += item.subtotal;
            list.innerHTML += `
                <div class="cart-item">
                    <div>
                        <div class="cart-title">${item.name}</div>
                        <small>${formatRp(item.unit_price)} x ${item.quantity}</small>
                    </div>
                    <div class="cart-controls">
                        <button class="cart-btn hover-anim" onclick="updatePublicCartQty(${item.product_id}, -1)">-</button>
                        <button class="cart-btn hover-anim" onclick="updatePublicCartQty(${item.product_id}, 1)">+</button>
                    </div>
                </div>
            `;
        });
    }
    document.getElementById('public-cart-total').textContent = formatRp(total);
    document.getElementById('public-cart-total').dataset.val = total;
}

document.getElementById('btn-public-cart').addEventListener('click', () => {
    document.getElementById('public-cart-modal').style.display = 'flex';
});

document.getElementById('btn-public-checkout').addEventListener('click', async () => {
    if(publicCart.length === 0) return showToast('Keranjang kosong!');
    if(!currentCustomer) return showToast('Harap login!');
    
    const total_amount = Number(document.getElementById('public-cart-total').dataset.val);
    const payment_method = document.getElementById('public-payment-method').value;
    
    const payload = {
        user_id: null,
        customer_id: currentCustomer.id,
        total_amount,
        payment_method,
        items: publicCart
    };
    
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(res.ok && data.success) {
            showToast('Pesanan Sukses! ID: ' + data.transactionId);
            publicCart = [];
            renderPublicCart();
            document.getElementById('public-cart-modal').style.display = 'none';
            loadPublicProducts(); // reload products to update stock text
        } else { showToast('Gagal: ' + data.error); }
    } catch(err) { showToast('Koneksi server terputus.'); }
});


// =======================
// DASHBOARD & ADMIN VIEWS
// =======================
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/reports/summary`);
        if(!res.ok) throw new Error('API Error');
        const data = await res.json();
        document.getElementById('total-sales').textContent = formatRp(data.summary.total_sales || 0);
        document.getElementById('total-trx').textContent = data.summary.total_transactions || 0;
        const tbody = document.getElementById('top-products-tbody');
        tbody.innerHTML = '';
        if(data.topProducts.length === 0) { tbody.innerHTML = '<tr><td colspan="2">Belum ada data</td></tr>'; } 
        else { data.topProducts.forEach(p => tbody.innerHTML += `<tr><td>${p.name}</td><td>${p.total_sold} units</td></tr>`); }
    } catch (e) {}
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        allProducts = await res.json();
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = '';
        allProducts.forEach(p => {
            tbody.innerHTML += `<tr><td>#${p.id}</td><td>${p.name}</td><td>${formatRp(p.price)}</td><td>${p.stock}</td></tr>`;
        });
    } catch (e) {}
}

async function loadCustomers() {
    try {
        const res = await fetch(`${API_URL}/customers`);
        allCustomers = await res.json();
        const tbody = document.getElementById('customers-tbody');
        tbody.innerHTML = '';
        allCustomers.forEach(c => {
            let statusBadge = c.status === 'active' ? 'active' : (c.status === 'lead' ? 'lead' : '');
            tbody.innerHTML += `<tr><td>#${c.id}</td><td>${c.username || '-'}</td><td>${c.name}</td><td>${c.email || '-'}</td><td>${c.phone || '-'}</td><td><span class="badge ${statusBadge}">${c.status.toUpperCase()}</span></td></tr>`;
        });
    } catch (e) {}
}

// Admin POS
window.addToPosCart = function(productStr) {
    const product = JSON.parse(decodeURIComponent(productStr));
    const exist = posCart.find(item => item.product_id === product.id);
    if(exist) {
        if(exist.quantity < product.stock) { exist.quantity++; exist.subtotal = exist.quantity * exist.unit_price; } 
        else { showToast('Stok tidak cukup!'); }
    } else {
        posCart.push({ product_id: product.id, name: product.name, unit_price: Number(product.price), quantity: 1, subtotal: Number(product.price) });
    }
    renderPosCart();
};

window.updatePosCartQty = function(id, delta) {
    const item = posCart.find(i => i.product_id === id);
    if(!item) return;
    const prod = allProducts.find(p => p.id === id);
    item.quantity += delta;
    if(item.quantity <= 0) posCart = posCart.filter(i => i.product_id !== id);
    else if (item.quantity > prod.stock) { item.quantity--; showToast('Stok tidak cukup!'); } 
    else { item.subtotal = item.quantity * item.unit_price; }
    renderPosCart();
};

async function loadPOS() {
    await loadProducts();
    await loadCustomers();
    const grid = document.getElementById('pos-product-list');
    grid.innerHTML = '';
    allProducts.forEach(p => {
        if(p.stock > 0) {
            const div = document.createElement('div');
            div.className = 'product-item hover-anim';
            div.innerHTML = `<h4>${p.name}</h4><span>${formatRp(p.price)}</span><br><small>Stok: ${p.stock}</small>`;
            div.onclick = () => window.addToPosCart(encodeURIComponent(JSON.stringify(p)));
            grid.appendChild(div);
        }
    });

    const select = document.getElementById('pos-customer-select');
    select.innerHTML = '<option value="">-- Pilih Customer --</option>';
    allCustomers.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name} (${c.phone || '-'})</option>`;
    });
    renderPosCart();
}

function renderPosCart() {
    const list = document.getElementById('cart-items');
    list.innerHTML = '';
    let total = 0;
    if(posCart.length === 0) { list.innerHTML = '<p class="empty-cart">Keranjang masih kosong</p>'; } 
    else {
        posCart.forEach(item => {
            total += item.subtotal;
            list.innerHTML += `<div class="cart-item"><div><div class="cart-title">${item.name}</div><small>${formatRp(item.unit_price)} x ${item.quantity}</small></div><div class="cart-controls"><button class="cart-btn hover-anim" onclick="updatePosCartQty(${item.product_id}, -1)">-</button><button class="cart-btn hover-anim" onclick="updatePosCartQty(${item.product_id}, 1)">+</button></div></div>`;
        });
    }
    document.getElementById('pos-total').textContent = formatRp(total);
    document.getElementById('pos-total').dataset.val = total;
}

document.getElementById('btn-checkout').addEventListener('click', async () => {
    if(posCart.length === 0) return showToast('Keranjang transaksi kosong!');
    const custId = document.getElementById('pos-customer-select').value;
    if(!custId) return showToast('Pilih customer dulu!');
    const total_amount = Number(document.getElementById('pos-total').dataset.val);
    const payment_method = document.getElementById('pos-payment').value;
    
    const payload = { user_id: currentUser.id, customer_id: custId, total_amount, payment_method, items: posCart };
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(res.ok && data.success) {
            showToast('Transaksi Sukses! ID: ' + data.transactionId);
            posCart = []; document.getElementById('pos-customer-select').value = ''; loadPOS(); 
        } else { showToast('Gagal: ' + data.error); }
    } catch(err) { showToast('Koneksi server terputus.'); }
});

// Modals Admin Entry
const adminModal = document.getElementById('data-modal');

document.getElementById('btn-add-product').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Tambah Produk';
    document.getElementById('form-fields').innerHTML = `<div class="form-group mb-2"><label>Nama Produk</label><input type="text" id="add-p-name" class="form-control" required></div><div class="form-group mb-2"><label>Harga (Rp)</label><input type="number" id="add-p-price" class="form-control" required></div><div class="form-group mb-2"><label>Stok</label><input type="number" id="add-p-stock" class="form-control" required></div>`;
    adminModal.dataset.mode = 'add-product'; adminModal.style.display = 'flex';
});

document.getElementById('btn-add-customer').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Tambah Customer';
    document.getElementById('form-fields').innerHTML = `<div class="form-group mb-2"><label>Nama Lengkap</label><input type="text" id="add-c-name" class="form-control" required></div><div class="form-group mb-2"><label>No Hp</label><input type="text" id="add-c-phone" class="form-control"></div><div class="form-group mb-2"><label>Email</label><input type="email" id="add-c-email" class="form-control"></div>`;
    adminModal.dataset.mode = 'add-customer'; adminModal.style.display = 'flex';
});

document.getElementById('data-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = adminModal.dataset.mode;
    try {
        if(mode === 'add-product') {
            await fetch(`${API_URL}/products`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({name: document.getElementById('add-p-name').value, price: document.getElementById('add-p-price').value, stock: document.getElementById('add-p-stock').value, description: ''})
            });
            showToast('Produk baru berhasil ditambah!'); loadProducts();
        } else if (mode === 'add-customer') {
            await fetch(`${API_URL}/customers`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({name: document.getElementById('add-c-name').value, phone: document.getElementById('add-c-phone').value, email: document.getElementById('add-c-email').value, address: '', status: 'lead', username: null, password: null})
            });
            showToast('Customer baru berhasil ditambah!'); loadCustomers();
        }
    } catch(err) { showToast('Gagal menyimpan data.'); } finally { adminModal.style.display = 'none'; }
});
