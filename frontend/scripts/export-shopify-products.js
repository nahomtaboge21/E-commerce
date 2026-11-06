const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../src/data/products.json');
const outputPath = path.resolve(__dirname, '../shopify-products.csv');
const products = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const columns = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price',
  'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
  'Image Src', 'Image Alt Text',
];

const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const rows = [columns.map(quote).join(',')];

for (const product of products) {
  const handle = `luniva-${product.id}`;
  const tags = [...new Set([...(product.tags || []), ...(product.featured ? ['featured'] : [])])].join(', ');
  const compareAt = Number(product.originalPrice) > Number(product.price) ? product.originalPrice : '';
  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];

  images.forEach((image, index) => {
    const values = index === 0
      ? [handle, product.name, product.description, 'Luniva', product.category, tags, 'false', 'Default Title', 'Default Title', '', '', 'deny', 'manual', product.price, compareAt, 'true', 'true', image, product.name]
      : [handle, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', image, product.name];
    rows.push(values.map(quote).join(','));
  });
}

fs.writeFileSync(outputPath, `${rows.join('\r\n')}\r\n`, 'utf8');
console.log(`Wrote ${products.length} draft products to ${outputPath}`);
