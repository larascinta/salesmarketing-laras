const API_URL = 'http://localhost:3000/api';

// Global State
let currentUser = null;
let posCart = [];
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

// Navigation Logic
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // UI Tabs
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const target = e.currentTarget.getAttribute('data-target');
        document.getElementById('page-title').textContent = e.currentTarget.textContent.trim();
        
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
        document.getElementById(target).style.display = 'block';
        
        // Load data based on view
        loadDataFor(target);
    });
});

// Trigger loaders
function loadDataFor(target) {
    if(target === 'dashboard') loadDashboard();
    if(target === 'products') loadProducts();
    if(target === 'customers') loadCustomers();
    if(target === 'transactions') loadPOS();
}

// =======================
// AUTHENTICATION
// =======================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    
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
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('app-view').style.display = 'flex';
            document.getElementById('user-display-name').textContent = currentUser.username;
            document.getElementById('user-role').textContent = currentUser.role;
            
            // Initiate App Data
            loadDashboard();
        } else {
            document.getElementById('login-error').textContent = data.message || 'Login gagal';
        }
    } catch(err) {
        document.getElementById('login-error').textContent = 'Gagal memanggil backend API. Pastikan Anda telah menjalankan Node server di localhost:3000';
    } finally {
        btn.textContent = 'Log In';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('login-form').reset();
    document.getElementById('login-error').textContent = '';
});

// =======================
// DASHBOARD FEATURE
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
        if(data.topProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2">Belum ada data transaksi</td></tr>';
        } else {
            data.topProducts.forEach(p => {
                tbody.innerHTML += `<tr><td>${p.name}</td><td>${p.total_sold} units</td></tr>`;
            });
        }
    } catch (e) { console.error('Dashboard Error', e); }
}

// =======================
// PRODUCTS FEATURE
// =======================
async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        if(!res.ok) throw new Error('API Error');
        allProducts = await res.json();
        
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = '';
        allProducts.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>#${p.id}</td>
                    <td>${p.name}</td>
                    <td>${formatRp(p.price)}</td>
                    <td>${p.stock}</td>
                </tr>
            `;
        });
    } catch (e) { console.error('Products Error', e); }
}

// =======================
// CUSTOMERS FEATURE
// =======================
async function loadCustomers() {
    try {
        const res = await fetch(`${API_URL}/customers`);
        if(!res.ok) throw new Error('API Error');
        allCustomers = await res.json();
        
        const tbody = document.getElementById('customers-tbody');
        tbody.innerHTML = '';
        allCustomers.forEach(c => {
            let statusBadge = c.status === 'active' ? 'active' : (c.status === 'lead' ? 'lead' : '');
            tbody.innerHTML += `
                <tr>
                    <td>#${c.id}</td>
                    <td>${c.name}</td>
                    <td>${c.email || '-'}</td>
                    <td>${c.phone || '-'}</td>
                    <td><span class="badge ${statusBadge}">${c.status.toUpperCase()}</span></td>
                </tr>
            `;
        });
    } catch (e) { console.error('Customers Error', e); }
}

// =======================
// POS TRANSACTIONS FEATURE
// =======================
async function loadPOS() {
    await loadProducts();
    await loadCustomers();
    
    // Render Products Grid
    const grid = document.getElementById('pos-product-list');
    grid.innerHTML = '';
    allProducts.forEach(p => {
        if(p.stock > 0) {
            const div = document.createElement('div');
            div.className = 'product-item hover-anim';
            div.innerHTML = `<h4>${p.name}</h4><span>${formatRp(p.price)}</span><br><small>Stok: ${p.stock}</small>`;
            div.addEventListener('click', () => addToCart(p));
            grid.appendChild(div);
        }
    });

    // Populate Customers list
    const select = document.getElementById('pos-customer-select');
    select.innerHTML = '<option value="">-- Pilih Customer --</option>';
    allCustomers.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name} (${c.phone})</option>`;
    });

    renderCart();
}

function addToCart(product) {
    const exist = posCart.find(item => item.product_id === product.id);
    if(exist) {
        if(exist.quantity < product.stock) {
            exist.quantity++;
            exist.subtotal = exist.quantity * exist.unit_price;
        } else {
            showToast('Stok tidak cukup!');
        }
    } else {
        posCart.push({
            product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1,
            subtotal: Number(product.price)
        });
    }
    renderCart();
}

function updateCartQty(id, delta) {
    const item = posCart.find(i => i.product_id === id);
    if(!item) return;
    
    const prod = allProducts.find(p => p.id === id);
    
    item.quantity += delta;
    if(item.quantity <= 0) {
        posCart = posCart.filter(i => i.product_id !== id);
    } else if (item.quantity > prod.stock) {
        item.quantity--; // rollback
        showToast('Stok tidak cukup!');
    } else {
        item.subtotal = item.quantity * item.unit_price;
    }
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-items');
    list.innerHTML = '';
    let total = 0;
    
    if(posCart.length === 0) {
        list.innerHTML = '<p class="empty-cart">Keranjang masih kosong</p>';
    } else {
        posCart.forEach(item => {
            total += item.subtotal;
            list.innerHTML += `
                <div class="cart-item">
                    <div>
                        <div class="cart-title">${item.name}</div>
                        <small>${formatRp(item.unit_price)} x ${item.quantity}</small>
                    </div>
                    <div class="cart-controls">
                        <button class="cart-btn hover-anim" onclick="updateCartQty(${item.product_id}, -1)">-</button>
                        <button class="cart-btn hover-anim" onclick="updateCartQty(${item.product_id}, 1)">+</button>
                    </div>
                </div>
            `;
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
    
    const payload = {
        user_id: currentUser.id,
        customer_id: custId,
        total_amount,
        payment_method,
        items: posCart
    };
    
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(res.ok && data.success) {
            showToast('Transaksi Sukses! ID: ' + data.transactionId);
            posCart = [];
            document.getElementById('pos-customer-select').value = '';
            loadPOS(); // Reload products to update stock
        } else {
            showToast('Gagal: ' + data.error);
        }
    } catch(err) {
        showToast('Koneksi server terputus.');
    }
});

// =======================
// MODAL FOR DATA ENTRY
// =======================
const modal = document.getElementById('data-modal');
document.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');

// Tambah Produk
document.getElementById('btn-add-product').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Tambah Produk';
    document.getElementById('form-fields').innerHTML = `
        <div class="form-group mb-2"><label>Nama Produk</label><input type="text" id="add-p-name" class="form-control" required></div>
        <div class="form-group mb-2"><label>Harga (Rp)</label><input type="number" id="add-p-price" class="form-control" required></div>
        <div class="form-group mb-2"><label>Stok</label><input type="number" id="add-p-stock" class="form-control" required></div>
    `;
    modal.dataset.mode = 'add-product';
    modal.style.display = 'flex';
});

// Tambah Customer
document.getElementById('btn-add-customer').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Tambah Customer';
    document.getElementById('form-fields').innerHTML = `
        <div class="form-group mb-2"><label>Nama Lengkap</label><input type="text" id="add-c-name" class="form-control" required></div>
        <div class="form-group mb-2"><label>No Hp</label><input type="text" id="add-c-phone" class="form-control"></div>
        <div class="form-group mb-2"><label>Email</label><input type="email" id="add-c-email" class="form-control"></div>
    `;
    modal.dataset.mode = 'add-customer';
    modal.style.display = 'flex';
});

// Submit Form Data Entry
document.getElementById('data-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = modal.dataset.mode;
    const btn = e.target.querySelector('button');
    btn.textContent = 'Menyimpan...';
    
    try {
        if(mode === 'add-product') {
            const payload = {
                name: document.getElementById('add-p-name').value,
                price: document.getElementById('add-p-price').value,
                stock: document.getElementById('add-p-stock').value,
                description: ''
            };
            await fetch(`${API_URL}/products`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
            });
            showToast('Produk baru berhasil ditambah!');
            loadProducts();
        } else if (mode === 'add-customer') {
            const payload = {
                name: document.getElementById('add-c-name').value,
                phone: document.getElementById('add-c-phone').value,
                email: document.getElementById('add-c-email').value,
                address: '', status: 'lead'
            };
            await fetch(`${API_URL}/customers`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
            });
            showToast('Customer baru berhasil ditambah!');
            loadCustomers();
        }
    } catch(err) {
        showToast('Gagal menyimpan data.');
    } finally {
        modal.style.display = 'none';
    }
});
