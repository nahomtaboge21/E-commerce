const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('../../backend/lib/mongodb');
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

function formatOrder(o) {
  return {
    id: 'ORD-' + o._id.toString().slice(-6).toUpperCase(),
    _id: o._id,
    userId: o.userId,
    userName: o.userName,
    items: o.items,
    total: o.total,
    status: o.status,
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt,
  };
}

// GET /api/orders
app.get(['/', '/api/orders'], authenticate, async (req, res) => {
  try {
    await connectDB();
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    res.json(orders.map(formatOrder));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/:id
app.get(['/:id', '/api/orders/:id'], authenticate, async (req, res) => {
  try {
    await connectDB();
    // Support both MongoDB _id and ORD-XXXX format
    let order;
    if (req.params.id.startsWith('ORD-')) {
      const suffix = req.params.id.replace('ORD-', '').toLowerCase();
      const all = await Order.find({}).lean();
      order = all.find(o => o._id.toString().slice(-6).toUpperCase() === suffix.toUpperCase());
    } else {
      order = await Order.findById(req.params.id).lean();
    }
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id.toString())
      return res.status(403).json({ error: 'Access denied' });
    res.json(formatOrder(order));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders
app.post(['/', '/api/orders'], authenticate, async (req, res) => {
  try {
    await connectDB();
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'Order must have items' });
    if (!shippingAddress) return res.status(400).json({ error: 'Shipping address required' });

    const enrichedItems = [];
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      product.stock -= item.quantity;
      await product.save();
      enrichedItems.push({ productId: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.images?.[0] || product.image });
      total += product.price * item.quantity;
    }

    const order = await Order.create({ userId: req.user.id, userName: req.user.name, items: enrichedItems, total: Math.round(total * 100) / 100, shippingAddress, paymentMethod: paymentMethod || 'card' });
    res.status(201).json(formatOrder(order.toObject()));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/orders/:id/status
app.put(['/:id/status', '/api/orders/:id/status'], authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    const valid = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(formatOrder(order));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = app;
