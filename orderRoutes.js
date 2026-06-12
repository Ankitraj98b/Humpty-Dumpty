// ── routes/orderRoutes.js ────────────────────────────
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customer: { name: String, phone: String, email: String, address: String },
  items: [{ menuItem: mongoose.Schema.Types.ObjectId, name: String, price: Number, qty: Number }],
  totalAmount: Number,
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed','preparing','out_for_delivery','delivered','cancelled'], default: 'placed' },
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderId) this.orderId = 'HD-' + Math.floor(100000 + Math.random() * 900000);
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// POST place order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, data: order, message: `Order ${order.orderId} placed successfully!` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET all orders (admin dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update order status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
