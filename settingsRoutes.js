// ── routes/settingsRoutes.js ─────────────────────────
// These power the Live Editor — saves restaurant customizations to MongoDB
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key:   { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);

// GET all settings (returns as flat object { key: value })
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.find();
    const flat = {};
    settings.forEach(s => flat[s.key] = s.value);
    res.json({ success: true, data: flat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
    res.json({ success: true, data: setting.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST/PUT upsert a setting (Live Editor saves here)
router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await SiteSettings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH bulk update (Live Editor "Save All" button)
router.patch('/bulk/update', async (req, res) => {
  try {
    const updates = req.body; // { key1: value1, key2: value2, ... }
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      }
    }));
    await SiteSettings.bulkWrite(ops);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
