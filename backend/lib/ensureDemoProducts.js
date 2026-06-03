const Product = require('../models/Product');
const { products: demoProducts } = require('../data/db');

let seedPromise = null;

async function ensureDemoProducts() {
  const count = await Product.estimatedDocumentCount();
  if (count > 0) return false;

  if (!seedPromise) {
    seedPromise = Product.insertMany(
      demoProducts.map(({ id, ...product }) => product),
      { ordered: true }
    ).finally(() => {
      seedPromise = null;
    });
  }

  await seedPromise;
  return true;
}

module.exports = ensureDemoProducts;
