const express = require('express');
const router = express.Router();
const { orders, products, uuidv4 } = require('../data/db');
const { authenticate, adminOnly } = require('../middleware/auth');

// GET /api/orders — user's own orders (admin gets all)
router.get('/', authenticate, (req, res) => {
  const userOrders = req.user.role === 'admin' ? orders : orders.filter(o => o.userId === req.user.id);
  res.json(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// GET /api/orders/:id
router.get('/:id', authenticate, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role !== 'admin' && order.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  res.json(order);
});

// POST /api/orders — create order
router.post('/', authenticate, (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Order must have items' });
  if (!shippingAddress) return res.status(400).json({ error: 'Shipping address required' });

  // validate & enrich items
  const enrichedItems = [];
  let total = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
    if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
    product.stock -= item.quantity;
    const image = Array.isArray(product.images) ? product.images[0] : product.image;
    enrichedItems.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, image });
    total += product.price * item.quantity;
  }

  const order = {
    id: 'ORD-' + String(orders.length + 1).padStart(3, '0'),
    userId: req.user.id,
    userName: req.user.name,
    items: enrichedItems,
    total: Math.round(total * 100) / 100,
    status: 'processing',
    shippingAddress,
    paymentMethod: paymentMethod || 'card',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json(order);
});

// PUT /api/orders/:id/status — admin only
router.put('/:id/status', authenticate, adminOnly, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  res.json(order);
});

module.exports = router;
