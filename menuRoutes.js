// ── routes/menuRoutes.js ─────────────────────────────
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['breakfast','mains','biryani','desserts','drinks'], required: true },
  emoji: { type: String, default: '🍽️' },
  badge: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: false },
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category, isAvailable: true } : { isAvailable: true };
    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create item (admin)
router.post('/', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update item (admin / live editor)
router.put('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE item (admin)
router.delete('/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SEED default Indian menu items
router.post('/seed/defaults', async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    const defaults = [
      { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato, served with sambar & chutneys', price: 89, category: 'breakfast', emoji: '🫓', badge: "Chef's Pick", isVeg: true },
      { name: 'Poha Deluxe', description: 'Flattened rice with mustard, curry leaves, peanuts & fresh coriander', price: 65, category: 'breakfast', emoji: '🍚', isVeg: true },
      { name: 'Chole Bhature', description: 'Fluffy deep-fried bread with spicy chickpea curry & pickled onions', price: 120, category: 'mains', emoji: '🫓', badge: 'Bestseller', isVeg: true },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils in buttery tomato gravy, best with naan', price: 160, category: 'mains', emoji: '🫕', isVeg: true },
      { name: 'Butter Chicken', description: 'Tandoor-roasted chicken in rich, creamy tomato-butter sauce', price: 220, category: 'mains', emoji: '🍛', badge: 'Fan Fav' },
      { name: 'Jharia Special Biryani', description: 'Fragrant basmati with slow-cooked mutton, fried onions & saffron', price: 280, category: 'biryani', emoji: '🍲', badge: 'Must Try' },
      { name: 'Veg Dum Biryani', description: 'Mixed vegetables & paneer in aromatic biryani with raita', price: 180, category: 'biryani', emoji: '🍲', isVeg: true },
      { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose cardamom sugar syrup', price: 70, category: 'desserts', emoji: '🍮', isVeg: true },
      { name: 'Rasmalai', description: 'Soft cottage cheese patties in chilled saffron-cardamom cream', price: 90, category: 'desserts', emoji: '🥛', badge: 'Fan Fav', isVeg: true },
      { name: 'Mango Lassi', description: 'Chilled blended yogurt with Alphonso mango & hint of cardamom', price: 80, category: 'drinks', emoji: '🥭', isVeg: true },
      { name: 'Masala Chai', description: 'Strong brewed tea with ginger, cardamom & whole spices', price: 35, category: 'drinks', emoji: '☕', isVeg: true },
      { name: 'Fresh Lime Soda', description: 'Sweet or salted, with fresh musambi & black salt', price: 50, category: 'drinks', emoji: '🍋', isVeg: true },
    ];
    await MenuItem.insertMany(defaults);
    res.json({ success: true, message: `${defaults.length} items seeded`, data: defaults });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
