// backend/seed.js
// Run with: node backend/seed.js
// Seeds default menu items + site settings into MongoDB

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/humptydumpty';

// ── Schemas ──────────────────────────────────────────
const menuItemSchema = new mongoose.Schema({
  name: String, description: String, price: Number,
  category: String, emoji: String, badge: String,
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: false },
}, { timestamps: true });

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const MenuItem    = mongoose.model('MenuItem', menuItemSchema);
const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

// ── Data ─────────────────────────────────────────────
const menuItems = [
  { name:'Masala Dosa',            description:'Crispy rice crepe with spiced potato, sambar & chutneys',           price:89,  category:'breakfast', emoji:'🫓', badge:"Chef's Pick", isVeg:true  },
  { name:'Poha Deluxe',            description:'Flattened rice with mustard, curry leaves, peanuts & coriander',    price:65,  category:'breakfast', emoji:'🍚', isVeg:true  },
  { name:'Idli Sambar (4 pcs)',     description:'Steamed rice cakes with hot sambar & 3 chutneys',                  price:70,  category:'breakfast', emoji:'🍥', isVeg:true  },
  { name:'Chole Bhature',          description:'Fluffy bhatura with spicy chole & pickled onions',                  price:120, category:'mains',     emoji:'🫓', badge:'Bestseller', isVeg:true },
  { name:'Butter Chicken',         description:'Tandoor chicken in rich creamy tomato-butter gravy',                price:220, category:'mains',     emoji:'🍛', badge:'Fan Fav'  },
  { name:'Dal Makhani',            description:'Slow-cooked kali dal in buttery gravy, best with naan',             price:160, category:'mains',     emoji:'🫕', isVeg:true  },
  { name:'Paneer Butter Masala',   description:'Soft paneer cubes in rich, mildly spiced tomato-cream gravy',      price:190, category:'mains',     emoji:'🍛', isVeg:true  },
  { name:'Jharia Special Biryani', description:'Fragrant basmati with slow-cooked mutton, fried onions & saffron', price:280, category:'biryani',   emoji:'🍲', badge:'Must Try' },
  { name:'Chicken Biryani',        description:'Spiced chicken with basmati rice, served with raita & mirchi',     price:220, category:'biryani',   emoji:'🍲', badge:'Bestseller' },
  { name:'Veg Dum Biryani',        description:'Mixed vegetables & paneer in aromatic dum biryani',                price:180, category:'biryani',   emoji:'🍲', isVeg:true  },
  { name:'Gulab Jamun (2 pcs)',    description:'Soft milk dumplings in rose-cardamom sugar syrup',                 price:70,  category:'desserts',  emoji:'🍮', isVeg:true  },
  { name:'Rasmalai',               description:'Soft rasgullas in chilled saffron-cardamom rabdi',                 price:90,  category:'desserts',  emoji:'🥛', badge:'Fan Fav', isVeg:true },
  { name:'Kheer',                  description:'Slow-cooked rice pudding with cardamom, saffron & dry fruits',     price:75,  category:'desserts',  emoji:'🍮', isVeg:true  },
  { name:'Mango Lassi',            description:'Chilled lassi with Alphonso mango & cardamom',                     price:80,  category:'drinks',    emoji:'🥭', isVeg:true  },
  { name:'Masala Chai',            description:'Strong chai with ginger, cardamom & whole spices',                 price:35,  category:'drinks',    emoji:'☕', isVeg:true  },
  { name:'Fresh Lime Soda',        description:'Sweet ya salt, nimbu & kala namak ke saath',                       price:50,  category:'drinks',    emoji:'🍋', isVeg:true  },
  { name:'Lassi (Sweet/Salt)',      description:'Thick chilled yogurt drink, your choice of sweet or salty',       price:60,  category:'drinks',    emoji:'🥛', isVeg:true  },
];

const siteSettings = [
  { key:'siteName',    value:'Humpty Dumpty' },
  { key:'tagline',     value:'Jharia Ka Sabse Pyara Dhaba' },
  { key:'heroTitle',   value:'Ghar Jaisi\nRasoi, Yahan\nMilti Hai.' },
  { key:'heroSubtitle',value:'Jharia, Dhanbad ke dil mein basa humara restaurant — fresh masaledaar khaana, warm service, aur yaadgaar swad.' },
  { key:'primaryColor',value:'#E8521A' },
  { key:'accentColor', value:'#F5A623' },
  { key:'darkColor',   value:'#1A0A00' },
  { key:'phone',       value:'+91 98765 43210' },
  { key:'address',     value:'4 No. Koiry Bandh, Jharia, Dhanbad, Jharkhand - 828111' },
  { key:'email',       value:'info@humptydumpty.in' },
  { key:'openHours',   value:'Subah 7 baje se Raat 11 baje tak' },
  { key:'gstNo',       value:'20AAAAA0000A1Z5' },
  { key:'upiId',       value:'humptydumpty@upi' },
];

// ── Seed ─────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // Seed menu
    await MenuItem.deleteMany({});
    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`🍛 Seeded ${inserted.length} menu items`);

    // Seed settings (upsert)
    for (const s of siteSettings) {
      await SiteSettings.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true });
    }
    console.log(`⚙️  Seeded ${siteSettings.length} site settings`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('👉 Now run: npm run dev');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
