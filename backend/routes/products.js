const express = require('express');
const router = express.Router();
const { products, categories } = require('../data/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const normalizeProductImages = (payload) => {
  const images = Array.isArray(payload.images)
    ? payload.images.filter(Boolean)
    : [];
  if (payload.image && typeof payload.image === 'string') {
    images.push(payload.image.trim());
  }
  const unique = [...new Set(images)];
  return unique.length ? unique : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'];
};

// GET /api/products
router.get('/', (req, res) => {
  const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 12, featured } = req.query;
  let results = [...products];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)) || p.category.toLowerCase().includes(q));
  }
  if (category && category !== 'All') results = results.filter(p => p.category === category);
  if (minPrice) results = results.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) results = results.filter(p => p.price <= parseFloat(maxPrice));
  if (featured === 'true') results = results.filter(p => p.featured);

  switch (sortBy) {
    case 'price_asc': results.sort((a, b) => a.price - b.price); break;
    case 'price_desc': results.sort((a, b) => b.price - a.price); break;
    case 'rating': results.sort((a, b) => b.rating - a.rating); break;
    case 'reviews': results.sort((a, b) => b.reviews - a.reviews); break;
    case 'newest': results.sort((a, b) => parseInt(b.id) - parseInt(a.id)); break;
    default: results.sort((a, b) => b.featured - a.featured);
  }

  const total = results.length;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginated = results.slice(skip, skip + parseInt(limit));

  res.json({ products: paginated, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), categories });
});

// GET /api/products/featured
router.get('/featured', (req, res) => {
  res.json(products.filter(p => p.featured).slice(0, 6));
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  res.json({ ...product, related });
});

// POST /api/products — admin only
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name, category, price, originalPrice, stock, description, tags } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Name, category, price required' });
  const images = normalizeProductImages(req.body);
  const product = {
    id: String(products.length + 1),
    name,
    category,
    price: parseFloat(price),
    originalPrice: parseFloat(originalPrice || price),
    stock: parseInt(stock || 0),
    rating: 0,
    reviews: 0,
    image: images[0],
    images,
    description: description || '',
    featured: false,
    tags: tags || []
  };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — admin only
router.put('/:id', authenticate, adminOnly, (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const update = { ...req.body };
  if (req.body.images || req.body.image) {
    const images = normalizeProductImages(req.body);
    update.images = images;
    update.image = images[0];
  }
  products[idx] = { ...products[idx], ...update, id: req.params.id };
  res.json(products[idx]);
});

// DELETE /api/products/:id — admin only
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(idx, 1);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
