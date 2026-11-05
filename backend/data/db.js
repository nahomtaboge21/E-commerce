const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const adminPassword = bcrypt.hashSync('admin123', 10);
const userPassword = bcrypt.hashSync('user123', 10);

const rawProducts = require('./products.json');
const reviewData = {
  '1': { rating: 4.9, reviews: 1420 },
  '2': { rating: 4.8, reviews: 980 },
  '3': { rating: 4.8, reviews: 1150 },
  '4': { rating: 4.9, reviews: 2120 },
  '5': { rating: 4.8, reviews: 870 },
  '6': { rating: 4.7, reviews: 640 },
  '7': { rating: 4.9, reviews: 790 },
  '8': { rating: 4.8, reviews: 1330 },
  '9': { rating: 4.7, reviews: 510 },
  '10': { rating: 4.6, reviews: 430 },
  '11': { rating: 4.8, reviews: 380 }
};
const products = rawProducts.map((p) => ({
  ...p,
  rating: reviewData[p.id]?.rating || 4.8,
  reviews: reviewData[p.id]?.reviews || 420
}));
const categories = [...new Set(products.map((product) => product.category))];
const getProduct = (id) => products.find((product) => product.id === id);
const orderItem = (productId, quantity) => {
  const product = getProduct(productId);
  return { productId, name: product.name, price: product.price, quantity, image: product.image };
};

const users = [
  { id: 'u1', name: 'Admin Luniva', email: 'admin@luniva.com', password: adminPassword, role: 'admin', createdAt: '2024-01-01T00:00:00Z', avatar: 'AL' },
  { id: 'u2', name: '美咲 (Misaki)', email: 'misaki@example.com', password: userPassword, role: 'user', createdAt: '2024-03-15T10:00:00Z', avatar: '美' },
  { id: 'u3', name: '由香 (Yuka)', email: 'yuka@example.com', password: userPassword, role: 'user', createdAt: '2024-04-20T14:00:00Z', avatar: '由' }
];

const orders = [
  {
    id: 'KIO-2024-001',
    userId: 'u2',
    items: [orderItem('1', 2)],
    total: 4998,
    status: 'delivered',
    createdAt: '2024-05-10T09:00:00Z',
    shippingAddress: { street: '銀座1-2-3', city: '中央区', state: '東京都', zip: '104-0061' }
  },
  {
    id: 'KIO-2024-002',
    userId: 'u2',
    items: [
      orderItem('4', 1),
      orderItem('2', 1)
    ],
    total: 12600,
    status: 'shipped',
    createdAt: '2024-06-01T14:00:00Z',
    shippingAddress: { street: '梅田2-4-9', city: '大阪市北区', state: '大阪府', zip: '530-0001' }
  }
];

module.exports = { products, users, orders, categories, uuidv4 };
