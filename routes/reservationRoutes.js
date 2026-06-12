// ── routes/reservationRoutes.js ──────────────────────
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  email:   String,
  date:    { type: String, required: true },
  time:    { type: String, required: true },
  guests:  { type: Number, required: true },
  message: String,
  status:  { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
}, { timestamps: true });

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

router.post('/', async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json({ success: true, data: reservation, message: 'Table reserved successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const r = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: r });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
