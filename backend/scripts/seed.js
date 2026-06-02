require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const products = [
  { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299.99, originalPrice: 399.99, stock: 45, rating: 4.8, reviews: 2341, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'], description: 'Premium wireless headphones with 40-hour battery life, active noise cancellation, and studio-quality sound.', featured: true, tags: ['wireless', 'audio', 'premium'] },
  { name: 'Slim Fit Merino Wool Sweater', category: 'Fashion', price: 89.99, originalPrice: 120.00, stock: 78, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop'], description: 'Ultra-soft 100% merino wool sweater in a modern slim fit.', featured: true, tags: ['clothing', 'wool', 'winter'] },
  { name: 'Smart Home Security Camera', category: 'Electronics', price: 149.99, originalPrice: 199.99, stock: 32, rating: 4.5, reviews: 1204, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'], description: '1080p HD indoor/outdoor camera with night vision and motion detection.', featured: false, tags: ['smart home', 'security', 'camera'] },
  { name: 'Ergonomic Desk Chair', category: 'Home & Garden', price: 449.00, originalPrice: 549.00, stock: 12, rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop'], description: 'Full lumbar support, adjustable armrests, breathable mesh back.', featured: true, tags: ['furniture', 'office', 'ergonomic'] },
  { name: 'Trail Running Shoes', category: 'Sports', price: 129.99, originalPrice: 160.00, stock: 63, rating: 4.7, reviews: 3102, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'], description: 'Lightweight trail runners with aggressive grip outsole and waterproof upper.', featured: false, tags: ['running', 'outdoor', 'shoes'] },
  { name: 'Professional Chef Knife Set', category: 'Home & Garden', price: 189.00, originalPrice: 240.00, stock: 27, rating: 4.8, reviews: 774, image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&h=800&fit=crop'], description: 'German high-carbon stainless steel 8-piece knife set.', featured: true, tags: ['kitchen', 'cooking', 'knives'] },
  { name: '4K Ultra HD Smart TV 55"', category: 'Electronics', price: 699.99, originalPrice: 899.99, stock: 19, rating: 4.6, reviews: 1876, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e609?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4e609?w=800&h=800&fit=crop'], description: 'Dolby Vision HDR, built-in Alexa, 120Hz refresh rate.', featured: true, tags: ['tv', 'smart', '4k'] },
  { name: 'Vitamin C Serum + Retinol Bundle', category: 'Beauty', price: 54.99, originalPrice: 78.00, stock: 94, rating: 4.4, reviews: 2210, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop'], description: 'Brightening vitamin C serum paired with gentle 0.3% retinol.', featured: false, tags: ['skincare', 'beauty', 'vitamins'] },
  { name: 'LEGO Architecture New York City', category: 'Toys', price: 119.99, originalPrice: 119.99, stock: 41, rating: 4.9, reviews: 448, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'], description: '598-piece detailed NYC skyline set.', featured: false, tags: ['lego', 'building', 'collector'] },
  { name: 'Portable Espresso Maker', category: 'Home & Garden', price: 74.99, originalPrice: 99.00, stock: 55, rating: 4.5, reviews: 921, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop'], description: 'Manual hand-pump espresso maker. No batteries needed.', featured: false, tags: ['coffee', 'portable', 'kitchen'] },
  { name: 'Yoga Mat Pro — 6mm', category: 'Sports', price: 68.00, originalPrice: 85.00, stock: 88, rating: 4.7, reviews: 1533, image: 'https://images.unsplash.com/photo-1601925228127-57f6f5c26b1b?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1601925228127-57f6f5c26b1b?w=800&h=800&fit=crop'], description: 'Eco-friendly TPE yoga mat with alignment lines and non-slip surface.', featured: false, tags: ['yoga', 'fitness', 'mat'] },
  { name: 'Mechanical Keyboard — TKL', category: 'Electronics', price: 159.00, originalPrice: 199.00, stock: 38, rating: 4.8, reviews: 687, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop'], description: 'Tenkeyless layout with Cherry MX switches and RGB backlighting.', featured: false, tags: ['keyboard', 'gaming', 'typing'] },
  { name: 'The Psychology of Money', category: 'Books', price: 16.99, originalPrice: 22.00, stock: 200, rating: 4.9, reviews: 8921, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop'], description: "Morgan Housel's bestselling book on the strange ways people think about money.", featured: false, tags: ['finance', 'psychology', 'bestseller'] },
  { name: 'Ceramic Pour-Over Coffee Set', category: 'Home & Garden', price: 48.00, originalPrice: 65.00, stock: 60, rating: 4.6, reviews: 342, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop'], description: 'Handcrafted ceramic dripper, server, and two mugs.', featured: false, tags: ['coffee', 'ceramic', 'kitchen'] },
  { name: 'Smart Fitness Watch', category: 'Electronics', price: 249.00, originalPrice: 299.00, stock: 52, rating: 4.7, reviews: 4102, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'], description: 'Heart rate, SpO2, GPS, sleep tracking, 7-day battery.', featured: true, tags: ['fitness', 'wearable', 'smartwatch'] },
  { name: "Men's Leather Dress Shoes", category: 'Fashion', price: 195.00, originalPrice: 250.00, stock: 34, rating: 4.5, reviews: 506, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop'], description: 'Full-grain leather Oxford shoes with Goodyear welt construction.', featured: false, tags: ['shoes', 'leather', 'formal'] },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  console.log('Cleared existing data');

  // Seed products
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  // Seed users
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass  = await bcrypt.hash('user123', 10);
  await User.insertMany([
    { name: 'Admin User',  email: 'admin@shopwave.com', password: adminPass, role: 'admin', avatar: 'AU' },
    { name: 'Jane Smith',  email: 'jane@example.com',   password: userPass,  role: 'user',  avatar: 'JS' },
    { name: 'Bob Johnson', email: 'bob@example.com',    password: userPass,  role: 'user',  avatar: 'BJ' },
  ]);
  console.log('Seeded 3 users');
  console.log('\nDone! ✅');
  console.log('Admin:  admin@shopwave.com / admin123');
  console.log('User:   jane@example.com / user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
