const API_URL = 'http://localhost:5000/api';
let cart = [];
let currentUser = null;

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cart-btn');
const loginBtn = document.getElementById('login-btn');
const authSection = document.getElementById('auth-section');

// Modals
const cartModal = document.getElementById('cartModal');
const authModal = document.getElementById('authModal');
const closeCart = document.getElementById('closeCart');
const closeAuth = document.getElementById('closeAuth');

// Cart Elements
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartCountElements = document.querySelectorAll('.cart-count');

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    // Modals
    cartBtn.addEventListener('click', () => {
        renderCart();
        cartModal.classList.add('show');
    });
    
    if(loginBtn) {
        loginBtn.addEventListener('click', () => authModal.classList.add('show'));
    }

    closeCart.addEventListener('click', () => cartModal.classList.remove('show'));
    closeAuth.addEventListener('click', () => authModal.classList.remove('show'));

    // Auth Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.target).classList.add('active');
        });
    });

    // Forms
    document.getElementById('loginMenu').addEventListener('submit', handleLogin);
    document.getElementById('registerMenu').addEventListener('submit', handleRegister);
    checkoutBtn.addEventListener('click', handleCheckout);
}

// --- API Calls & Logic ---

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        
        productGrid.innerHTML = '';
        products.forEach(p => {
            productGrid.innerHTML += `
                <div class="product-card">
                    <img src="${p.image}" alt="${p.name}" class="product-img">
                    <div class="product-info">
                        <div class="product-title">${p.name}</div>
                        <div class="product-desc">${p.description}</div>
                        <div class="product-footer">
                            <div class="product-price">$${p.price.toFixed(2)}</div>
                            <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">
                                <i class="fa-solid fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        productGrid.innerHTML = '<p class="error-msg">Failed to load products. Backend might be down.</p>';
    }
}

// --- Cart Logic ---
function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCartCount();
    showToast(`${name} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountElements.forEach(el => el.textContent = count);
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted)">Cart is empty</p>';
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="text-muted">Qty: ${item.qty}</span>
                </div>
                <div style="display:flex; align-items:center; gap:1rem;">
                    <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
                    <i class="fa-solid fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
                </div>
            </div>
        `;
    });
    cartTotalEl.textContent = total.toFixed(2);
}

async function handleCheckout() {
    if (cart.length === 0) return showToast('Cart is empty', true);
    if (!currentUser) {
        cartModal.classList.remove('show');
        authModal.classList.add('show');
        showToast('Please login to checkout', true);
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ total, items: cart.map(i => i.id) })
        });
        
        if (res.ok) {
            cart = [];
            updateCartCount();
            renderCart();
            cartModal.classList.remove('show');
            showToast('Order placed successfully!');
        } else {
            showToast('Checkout failed', true);
        }
    } catch (e) {
        showToast('Error during checkout', true);
    }
}

// --- Auth Logic ---

function checkAuth() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
        currentUser = username;
        updateAuthUI();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            currentUser = data.username;
            authModal.classList.remove('show');
            updateAuthUI();
            showToast('Welcome back, ' + currentUser);
        } else {
            document.getElementById('loginMessage').textContent = data.error;
        }
    } catch {
        document.getElementById('loginMessage').textContent = 'Connection error';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        const data = await res.json();
        if (res.ok) {
            document.getElementById('regMessage').style.color = 'var(--success)';
            document.getElementById('regMessage').textContent = 'Registration successful! Please login.';
            setTimeout(() => {
                document.querySelector('[data-target="loginMenu"]').click();
            }, 1500);
        } else {
            document.getElementById('regMessage').textContent = data.error;
        }
    } catch {
        document.getElementById('regMessage').textContent = 'Connection error';
    }
}

function updateAuthUI() {
    authSection.innerHTML = `
        <div style="display:flex; align-items:center; gap: 1rem;">
            <span style="color:var(--text-muted); font-size:0.9rem;">${currentUser}</span>
            <button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="logout()">Logout</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    currentUser = null;
    window.location.reload();
}

// --- UI Helpers ---
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${isError ? 'error' : ''}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
