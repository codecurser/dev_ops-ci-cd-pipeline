const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json());

// Initialize SQLite Database (In-Memory for simplicity and portability)
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDB();
    }
});

function initDB() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // Products Table
        db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            price REAL,
            image TEXT
        )`);

        // Orders Table
        db.run(`CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total REAL,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed Products
        const products = [
            { name: "Quantum Headphones", description: "Immerse yourself with active noise cancellation and spatial audio.", price: 299.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
            { name: "Nebula Smartwatch", description: "Track your health, receive notifications, and look stylish.", price: 199.50, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
            { name: "Aero Drone 4K", description: "Capture breathtaking aerial footage with ease.", price: 450.00, image: "https://images.unsplash.com/photo-1507580461465-2455955be3ec?w=500&q=80" },
            { name: "Neural Keyboard", description: "Mechanical keyboard with dynamic RGB and tactile switches.", price: 129.99, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80" }
        ];

        const stmt = db.prepare("INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)");
        for (const p of products) {
            stmt.run(p.name, p.description, p.price, p.image);
        }
        stmt.finalize();
    });
}

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Routes ---

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth - Register
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
    });
});

// Auth - Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    });
});

// Products
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Order
app.post('/api/orders', authenticateToken, (req, res) => {
    const { total, items } = req.body; // items is array of product ids
    
    db.run(`INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)`, [req.user.id, total, 'Processing'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Order placed successfully', orderId: this.lastID });
    });
});

// Get User Orders
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Backend API running on port ${port}`);
});
