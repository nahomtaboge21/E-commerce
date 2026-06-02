require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow your domain in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve React frontend static build
// Works when uploaded as:  /backend/server.js  and  /frontend/build/
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// All non-API routes → React app (client-side routing)
app.get('*', (req, res) => {
  const index = path.join(buildPath, 'index.html');
  res.sendFile(index);
});

// 404 handler for API
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ShopWave running at http://localhost:${PORT}`);
  console.log(`📦 ${require('./data/db').products.length} products loaded`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
