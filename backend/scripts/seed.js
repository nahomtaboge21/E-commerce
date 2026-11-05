require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { products } = require('../data/db');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  console.log('Cleared existing data');

  // Seed products
  await Product.insertMany(products.map(({ id, ...p }) => p));
  console.log(`Seeded ${products.length} Kioluna products`);

  // Seed users
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass  = await bcrypt.hash('user123', 10);
  await User.insertMany([
    { name: 'Admin Kioluna', email: 'admin@kioluna.com', password: adminPass, role: 'admin', avatar: 'AK' },
    { name: '美咲 (Misaki)', email: 'misaki@example.com', password: userPass, role: 'user', avatar: '美' },
    { name: '由香 (Yuka)', email: 'yuka@example.com', password: userPass, role: 'user', avatar: '由' },
  ]);
  console.log('Seeded 3 users');
  console.log('\nDone! ✅');
  console.log('Admin:  admin@kioluna.com / admin123');
  console.log('User:   misaki@example.com / user123');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
