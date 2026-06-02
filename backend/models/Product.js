const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  category:      { type: String, required: true },
  price:         { type: Number, required: true },
  originalPrice: { type: Number },
  stock:         { type: Number, default: 0 },
  rating:        { type: Number, default: 0 },
  reviews:       { type: Number, default: 0 },
  image:         { type: String, default: '' },
  images:        [{ type: String }],
  description:   { type: String, default: '' },
  featured:      { type: Boolean, default: false },
  tags:          [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
