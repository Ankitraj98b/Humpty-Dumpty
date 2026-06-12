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
    const filter = category && category !== 'all' 
      ? { category, isAvailable: true } 
      : { isAvailable: true };
    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create item
router.post('/', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SEED default Indian menu items
router.get('/seed/defaults', async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    const defaults = [
      { name:'Masala Dosa', description:'Crispy rice crepe with spiced potato, sambar & chutneys', price:89, category:'breakfast', emoji:'🫓', badge:"Chef's Pick", isVeg:true },
      { name:'Poha Deluxe', description:'Flattened rice with mustard, curry leaves, peanuts & coriander', price:65, category:'breakfast', emoji:'🍚', isVeg:true },
      { name:'Idli Sambar', description:'Steamed rice cakes with hot sambar & 3 chutneys', price:70, category:'breakfast', emoji:'🍥', isVeg:true },
      { name:'Chole Bhature', description:'Fluffy bhatura with spicy chole & pickled onions', price:120, category:'mains', emoji:'🫓', badge:'Bestseller', isVeg:true },
      { name:'Butter Chicken', description:'Tandoor chicken in rich creamy tomato-butter gravy', price:220, category:'mains', emoji:'🍛', badge:'Fan Fav' },
      { name:'Dal Makhani', description:'Slow-cooked kali dal in buttery gravy, best with naan', price:160, category:'mains', emoji:'🫕', isVeg:true },
      { name:'Paneer Butter Masala', description:'Soft paneer in rich mildly spiced tomato-cream gravy', price:190, category:'mains', emoji:'🍛', isVeg:true },
      { name:'Jharia Special Biryani', description:'Fragrant basmati with slow-cooked mutton, fried onions & saffron', price:280, category:'biryani', emoji:'🍲', badge:'Must Try' },
      { name:'Chicken Biryani', description:'Spiced chicken with basmati rice, served with raita', price:220, category:'biryani', emoji:'🍲', badge:'Bestseller' },
      { name:'Veg Dum Biryani', description:'Mixed vegetables & paneer in aromatic dum biryani', price:180, category:'biryani', emoji:'🍲', isVeg:true },
      { name:'Gulab Jamun', description:'Soft milk dumplings in rose-cardamom sugar syrup', price:70, category:'desserts', emoji:'🍮', isVeg:true },
      { name:'Rasmalai', description:'Soft rasgullas in chilled saffron-cardamom rabdi', price:90, category:'desserts', emoji:'🥛', badge:'Fan Fav', isVeg:true },
      { name:'Kheer', description:'Slow-cooked rice pudding with cardamom & dry fruits', price:75, category:'desserts', emoji:'🍮', isVeg:true },
      { name:'Mango Lassi', description:'Chilled lassi with Alphonso mango & cardamom', price:80, category:'drinks', emoji:'🥭', isVeg:true },
      { name:'Masala Chai', description:'Strong chai with ginger, cardamom & whole spices', price:35, category:'drinks', emoji:'☕', isVeg:true },
      { name:'Fresh Lime Soda', description:'Sweet ya salt, nimbu & kala namak ke saath', price:50, category:'drinks', emoji:'🍋', isVeg:true },
      { name:'Lassi Sweet or Salt', description:'Thick chilled yogurt drink sweet or salty', price:60, category:'drinks', emoji:'🥛', isVeg:true },
    ];
    await MenuItem.insertMany(defaults);
    res.json({ success: true, message: `${defaults.length} items seeded successfully!`, data: defaults });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
