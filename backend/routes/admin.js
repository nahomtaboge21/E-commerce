const express = require('express');
const router = express.Router();
const { products, users, orders } = require('../data/db');
const { authenticate, adminOnly } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', authenticate, adminOnly, (req, res) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  const categoryCounts = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  const lowStock = products.filter(p => p.stock < 20);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  res.json({
    overview: {
      totalProducts: products.length,
      totalUsers: users.filter(u => u.role === 'user').length,
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      deliveredRevenue: Math.round(deliveredRevenue * 100) / 100
    },
    ordersByStatus: statusCounts,
    productsByCategory: categoryCounts,
    lowStockProducts: lowStock,
    recentOrders
  });
});

// GET /api/admin/users
router.get('/users', authenticate, adminOnly, (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, avatar: u.avatar, orderCount: orders.filter(o => o.userId === u.id).length })));
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticate, adminOnly, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (users[idx].role === 'admin') return res.status(400).json({ error: 'Cannot delete admin' });
  users.splice(idx, 1);
  res.json({ message: 'User deleted' });
});

module.exports = router;
