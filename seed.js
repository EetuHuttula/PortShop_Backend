const mongoose = require('mongoose');
const config = require('./utils/config');
const Product = require('./models/product');
const Category = require('./models/category');

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

/* =========================
   COMPONENT OPTIONS
========================= */

const components = {
  cpu: [
    'Intel i5-12400',
    'Intel i7-13700K',
    'Intel i9-13900K',
    'Ryzen 5 5600X',
    'Ryzen 7 7700X'
  ],
  gpu: [
    'RTX 3060',
    'RTX 3070',
    'RTX 4080',
    'RTX 4090'
  ],
  ram: [
    '16GB DDR4',
    '32GB DDR4',
    '32GB DDR5'
  ],
  storage: [
    '512GB NVMe',
    '1TB NVMe',
    '2TB NVMe'
  ],
  motherboard: [
    'B550 ATX',
    'Z690 ATX',
    'Z790 ATX'
  ],
  psu: [
    '650W Bronze',
    '750W Gold',
    '850W Gold'
  ],
  cooling: [
    'Air Cooling',
    '240mm AIO',
    '360mm AIO'
  ],
  case: [
    'Mid Tower',
    'RGB Tempered Glass'
  ]
};

/* =========================
   SEED FUNCTION
========================= */

async function seedDatabase() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    await Product.deleteMany({});
    await Category.deleteMany({});

    /* ─── CREATE CATEGORIES ─── */
    const categoryNames = [
      'Laptops',
      'Gaming PC',
      'Office PC',
      'CPU',
      'GPU',
      'RAM',
      'Storage',
      'Motherboard',
      'PSU',
      'Cooling',
      'Case'
    ];

    const categories = {};
    for (const name of categoryNames) {
      const cat = await new Category({ name }).save();
      categories[name] = cat;
    }

    /* ─── CREATE PRODUCTS (200 per category) ─── */
    const allProducts = [];
    const productsPerCategory = 200;

    for (const [categoryName, categoryObj] of Object.entries(categories)) {
      for (let i = 1; i <= productsPerCategory; i++) {
        let product = {
          name: `${categoryName} Product ${i}`,
          description: `High-quality ${categoryName.toLowerCase()} product`,
          price: randomPrice(9.99, 1499.99),
          category: categoryObj._id,
          created_at: new Date(),
          updated_at: new Date()
        };

        // Add component details for component categories
        if (['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Cooling', 'Case'].includes(categoryName)) {
          const componentKey = categoryName.toLowerCase();
          if (components[componentKey]) {
            product.component = randomFrom(components[componentKey]);
          }
        }

        allProducts.push(product);
      }
    }

    await Product.insertMany(allProducts);

    console.log(`✓ Seeded ${allProducts.length} products (200 per category)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
