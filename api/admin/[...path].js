const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('../../backend/lib/mongodb');
const User = require('../../backend/models/User');
const Order = require('../../backend/models/Order');
const Product = require('../../backend/models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'shopwave_jwt_secret_2024';
const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(express.json());

function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(403).json({ error: 'Invalid or expired token' }); }
}
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// GET /api/admin/stats
app.get('/stats', authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const [orders, products] = await Promise.all([Order.find().lean(), Product.find().lean()]);
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
    const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
    const categoryCounts = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
    const lowStock = products.filter(p => p.stock < 20).map(p => ({ id: p._id, name: p.name, stock: p.stock, category: p.category }));
    const recentOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(o => ({
      id: 'ORD-' + o._id.toString().slice(-6).toUpperCase(),
      userId: o.userId, userName: o.userName,
      total: o.total, status: o.status, createdAt: o.createdAt,
      items: o.items,
    }));
    res.json({ totalRevenue, deliveredRevenue, totalOrders: orders.length, statusCounts, totalProducts: products.length, categoryCounts, lowStock, recentOrders });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/users
app.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const [users, orders] = await Promise.all([User.find().select('-password').lean(), Order.find().lean()]);
    const result = users.map(u => ({
      id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, createdAt: u.createdAt,
      orderCount: orders.filter(o => o.userId?.toString() === u._id.toString()).length,
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/users/:id
app.delete('/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin users' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = app;
