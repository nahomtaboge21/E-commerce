const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('../../backend/lib/mongodb');
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

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive'];

// GET /api/products/featured
app.get('/api/products/featured', async (req, res) => {
  try {
    await connectDB();
    const products = await Product.find({ featured: true }).limit(10).lean();
    res.json(products.map(p => ({ ...p, id: p._id })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    await connectDB();
    const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 12, featured } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
    if (category && category !== 'All') query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (featured === 'true') query.featured = true;

    const sortMap = {
      price_asc: { price: 1 }, price_desc: { price: -1 },
      rating: { rating: -1 }, reviews: { reviews: -1 },
      newest: { createdAt: -1 }, default: { featured: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.default;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sort).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit)).lean();
    res.json({
      products: products.map(p => ({ ...p, id: p._id })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      categories: CATEGORIES,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4).lean();
    res.json({ ...product, id: product._id, related: related.map(p => ({ ...p, id: p._id })) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/products
app.post('/api/products', authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const { name, category, price, originalPrice, stock, description, tags, image, images } = req.body;
    if (!name || !category || !price) return res.status(400).json({ error: 'Name, category, price required' });
    const imgs = images || (image ? [image] : []);
    const product = await Product.create({ name, category, price: parseFloat(price), originalPrice: parseFloat(originalPrice || price), stock: parseInt(stock || 0), description, tags, image: imgs[0] || '', images: imgs });
    res.status(201).json({ ...product.toObject(), id: product._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/products/:id
app.put('/api/products/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...product.toObject(), id: product._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = app;
