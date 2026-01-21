const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const Category = require('./models/category')
const Product = require('./models/product')

const categories = [
  { name: 'Graphics Cards', description: 'High-performance GPUs for gaming' },
  { name: 'Processors', description: 'Gaming CPUs and processors' },
  { name: 'Motherboards', description: 'Gaming motherboards and chipsets' },
  { name: 'Gaming Peripherals', description: 'Mice, keyboards, headsets, and controllers' },
  { name: 'Monitors', description: 'Gaming monitors and displays' }
]

const productNames = {
  'Graphics Cards': [
    'RTX 4090 24GB', 'RTX 4080 16GB', 'RTX 4070 Ti 12GB', 'RTX 4070 12GB', 'RTX 4060 Ti 8GB',
    'RX 7900 XTX 24GB', 'RX 7900 XT 20GB', 'RX 7800 XT 16GB', 'RX 7700 XT 12GB', 'RX 7600 XT 16GB',
    'Arc A770 16GB', 'RTX 4070 Super 12GB', 'RTX 4060 8GB', 'RX 7600 12GB', 'RTX 3060 Ti 8GB',
    'RTX 4090 Founders Edition', 'EVGA RTX 4080 FTW3', 'MSI RTX 4070 Gaming', 'ASUS RTX 4080 ROG Strix', 'Gigabyte RX 7900 XT AORUS'
  ],
  'Processors': [
    'Intel Core i9-13900KS', 'Intel Core i9-13900K', 'Intel Core i7-13700K', 'Intel Core i5-13600K', 'Intel Core i7-13700',
    'AMD Ryzen 9 7950X', 'AMD Ryzen 9 7950X3D', 'AMD Ryzen 7 7700X', 'AMD Ryzen 7 7700', 'AMD Ryzen 5 7600X',
    'Intel Core i9-12900K', 'AMD Ryzen 9 5950X', 'Intel Core i7-12700K', 'Intel Core i5-12600K', 'AMD Ryzen 7 5800X3D',
    'Intel Core Ultra 9 265K', 'AMD Ryzen 9 9950X', 'Intel Core i9-14900K', 'AMD Ryzen 7 9700X', 'Intel Core i7-13700KF'
  ],
  'Motherboards': [
    'ASUS ROG MAXIMUS Z790 HERO', 'MSI MPG Z790 EDGE WIFI', 'Gigabyte Z790 AORUS Master', 'ASRock Z790 Steel Legend', 'ASUS Pro WS Z790-SAGE',
    'ASUS ROG CROSSHAIR X870-E', 'MSI MPG B850 EDGE WIFI', 'Gigabyte B850E AORUS Master', 'ASRock X870E Steel Legend', 'ASUS ProArt X870-CREATOR',
    'ASUS ROG STRIX Z690-E', 'MSI MPG Z690 CARBON WIFI', 'Gigabyte Z690 AORUS Master', 'ASRock Z690 Steel Legend', 'ASUS TUF Z690 PRO',
    'ASUS ROG STRIX X570-E', 'MSI MPG X570S EDGE WIFI', 'Gigabyte X570 AORUS Master', 'ASRock X570 Taichi', 'ASUS Pro WS X570'
  ],
  'Gaming Peripherals': [
    'Corsair K95 Platinum Mechanical Keyboard', 'Logitech G Pro X Mechanical Keyboard', 'SteelSeries Apex Pro Keyboard', 'Razer BlackWidow V4 Keyboard', 'ASUS ROG Strix Scope II Keyboard',
    'Logitech G Pro X Superlight 2 Mouse', 'Corsair M65 Elite RGB Mouse', 'SteelSeries Rival 650 Mouse', 'Razer DeathAdder V3 Mouse', 'ASUS ROG Keris Wireless Mouse',
    'Corsair HS80 RGB Wireless Headset', 'SteelSeries Arctis Nova 7 Headset', 'Logitech G Pro X 2 Headset', 'Razer Kraken V4 Headset', 'ASUS ROG Delta S Headset',
    'Xbox Wireless Controller', 'PlayStation 5 DualSense Controller', 'Corsair Scimitar Pro RGB', 'Razer Naga Pro Mouse', 'SteelSeries GameDAC'
  ],
  'Monitors': [
    'ASUS ROG Swift PG27UQ 4K 144Hz', 'LG UltraGear 27GP850 QHD 180Hz', 'Corsair Xeneon 32UHD165 4K 165Hz', 'Gigabyte M34WQ OLED Ultrawide', 'MSI MAG 323URF 4K 160Hz',
    'Samsung G9 Odyssey 5120x1440 240Hz', 'LG UltraGear OLED 27GP950 QHD 240Hz', 'BenQ PD2705U 4K 60Hz Professional', 'ASUS ProArt PA327CV 4K IPS', 'Acer Predator X27 4K 144Hz',
    'Corsair Xeneon 27QHD165 QHD 165Hz', 'LG 27UP550 4K 60Hz', 'Asus VP28UQG 4K 60Hz FreeSync', 'MSI Optix MPG341CQ 34" Ultrawide', 'Gigabyte M32U 4K 144Hz',
    'Dell S3722DGM 37" Ultrawide', 'AOC AG493UCG 49" Ultrawide', 'LG 34UP550 34" Ultrawide 5K', 'ASUS PA247CV 24" Professional', 'BenQ EW2480 24" Eye Care'
  ]
}

const productDescriptions = {
  'Graphics Cards': [
    'Flagship GPU with advanced ray tracing', 'High-end gaming GPU for 4K', 'Excellent performance/value ratio', 'Mid-range 1440p gaming', '4K capable entry-level GPU',
    'Ultra-high performance RDNA 3', 'Premium RDNA 3 gaming GPU', 'Solid 1440p high-end GPU', 'Great 1440p midrange performer', 'Budget-friendly RDNA 3',
    'Intel Arc flagship gaming GPU', 'Updated RTX 4070 Ti with better performance', 'Excellent 1080p and 1440p gaming', 'Budget-friendly 1080p gaming', 'High-end previous generation',
    'Official NVIDIA design', 'Overclocked RTX 4080', 'Premium RTX 4070 variant', 'Top-tier ASUS ROG design', 'Premium RX 7900 XT variant'
  ],
  'Processors': [
    'Intel flagship with highest performance', 'Top-tier Intel gaming CPU', 'Excellent gaming and productivity', 'Great entry-level high-end', 'High-end non-K variant',
    'AMD flagship processor', 'AMD flagship with 3D V-Cache', 'High-end gaming and productivity', 'Mid-range non-X variant', 'Entry-level high-end',
    'Previous gen Intel flagship', 'AMD Ryzen previous gen flagship', 'Previous gen Intel high-end', 'Previous gen Intel mid-range', 'Previous gen with 3D V-Cache',
    'Latest Intel Core Ultra', 'Upcoming AMD Ryzen flagship', 'Latest Intel 14th generation', 'Latest AMD Ryzen 9000 series', 'Previous gen flagship'
  ],
  'Motherboards': [
    'Premium Z790 gaming motherboard', 'High-end Z790 with WiFi', 'Flagship Z790 for enthusiasts', 'Solid Z790 entry-level', 'Professional Z790 workstation',
    'Top-tier X870E gaming board', 'Premium X870 gaming board', 'Flagship X870E enthusiast board', 'High-end X870E with premium features', 'Professional X870E workstation',
    'High-end Z690 gaming motherboard', 'Premium Z690 with WiFi', 'Flagship Z690 for gaming', 'Solid Z690 mid-range', 'Gaming-focused Z690 board',
    'High-end X570 gaming board', 'Premium X570 with WiFi', 'Flagship X570 enthusiast board', 'Enthusiast X570 alternative', 'Professional X570 workstation'
  ],
  'Gaming Peripherals': [
    'Mechanical gaming keyboard with macro keys', 'Professional esports keyboard', 'Mechanical keyboard with OLED display', 'RGB mechanical gaming keyboard', 'Premium ROG gaming keyboard',
    'Ultra-lightweight wireless gaming mouse', 'High-performance RGB gaming mouse', 'Wireless gaming mouse for FPS', 'Premium ergonomic gaming mouse', 'Lightweight wireless gaming mouse',
    'Wireless gaming headset with spatial audio', 'Wireless headset with excellent sound', 'Professional gaming headset', 'RGB gaming headset with mic', 'Premium ROG gaming headset',
    'Wireless gaming controller for PC', 'PlayStation gaming controller', 'Ergonomic MOBA gaming mouse', 'Professional MOBA gaming mouse', 'Gaming audio amplifier'
  ],
  'Monitors': [
    '4K gaming monitor with 144Hz refresh rate', 'Fast QHD esports monitor', 'Premium 4K gaming display', 'Ultrawide OLED gaming monitor', '4K high refresh gaming display',
    'Extreme ultrawide curved gaming monitor', 'OLED gaming monitor with 240Hz', 'Professional 4K color-accurate display', 'Premium professional monitor', '4K gaming monitor',
    'QHD fast gaming monitor', '4K professional display', 'Affordable 4K gaming display', 'Ultrawide curved gaming monitor', '4K gaming with high refresh',
    'Extreme ultrawide gaming display', 'Massive ultrawide curved display', '5K ultrawide display', 'Professional color-accurate monitor', 'Budget-friendly eye-care monitor'
  ]
}

async function seedDatabase() {
  try {
    logger.info('Connecting to MongoDB...')
    mongoose.set('strictQuery', false)
    await mongoose.connect(config.MONGODB_URI)
    logger.info('Connected to MongoDB')

    // Clear existing data
    logger.info('Clearing existing data...')
    await Category.deleteMany({})
    await Product.deleteMany({})
    logger.info('Existing data cleared')

    // Create categories
    logger.info('Creating categories...')
    const createdCategories = await Category.insertMany(categories)
    logger.info(`${createdCategories.length} categories created`)

    // Create products
    logger.info('Creating products...')
    let productCount = 0

    for (const category of createdCategories) {
      const categoryName = category.name
      const names = productNames[categoryName]
      const descriptions = productDescriptions[categoryName]

      for (let i = 0; i < 20; i++) {
        const product = new Product({
          name: names[i],
          description: descriptions[i],
          price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
          category: category._id,
          created_at: new Date(),
          updated_at: new Date()
        })
        await product.save()
        productCount++
      }
      logger.info(`Created 20 products for category: ${categoryName}`)
    }

    logger.info(`\n✓ Database seeded successfully!`)
    logger.info(`✓ Created ${createdCategories.length} categories`)
    logger.info(`✓ Created ${productCount} products total`)

    await mongoose.connection.close()
    logger.info('MongoDB connection closed')
  } catch (error) {
    logger.error('Error seeding database:', error.message)
    await mongoose.connection.close()
    process.exit(1)
  }
}

seedDatabase()
