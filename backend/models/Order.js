const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  items: [{
    productId: { type: String },
    name:      { type: String },
    price:     { type: Number },
    quantity:  { type: Number },
    image:     { type: String },
  }],
  total:           { type: Number, required: true },
  status:          { type: String, enum: ['processing','confirmed','shipped','delivered','cancelled'], default: 'processing' },
  shippingAddress: {
    street:  String,
    city:    String,
    state:   String,
    zip:     String,
    country: String,
  },
  paymentMethod: { type: String, default: 'card' },
}, { timestamps: true });

// Virtual id field formatted like ORD-001
OrderSchema.virtual('orderId').get(function () {
  return 'ORD-' + this._id.toString().slice(-6).toUpperCase();
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
