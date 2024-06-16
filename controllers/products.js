const express = require('express');
const productsRouter = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// GET all products
productsRouter.get('/', async (request, response) => {
  try {
    const products = await Product.find({}).populate('category', { name: 1, description: 1 });
    response.json(products);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET a single product by ID
productsRouter.get('/:id', async (request, response, next) => {
  try {
    const product = await Product.findById(request.params.id).populate('category', { name: 1, description: 1 });
    if (product) {
      response.json(product);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

// POST a new product
productsRouter.post('/', upload.single('image'), async (req, res, next) => {
  const { name, description, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category does not exist' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image: req.file ? req.file.path : undefined,
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedProduct = await product.save();
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}` : undefined;
    res.status(201).json({ ...savedProduct._doc, imageUrl });
  } catch (error) {
    console.error('Error saving product:', error);
    next(error);
  }
});

// DELETE a product
productsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Product.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

// PUT (update) a product
productsRouter.put('/:id', upload.single('image'), async (request, response, next) => {
  const body = request.body;

  try {
    // Find the category by name
    const category = await Category.findOne({ name: body.category });
    if (!category) {
      return response.status(400).json({ error: 'Invalid category name' });
    }

    // Update the product object with the category ID
    const product = {
      name: body.name,
      description: body.description,
      price: body.price,
      category: category._id,
      image: request.file ? request.file.path : undefined,
      updated_at: new Date()
    };

    const updatedProduct = await Product.findByIdAndUpdate(request.params.id, product, { new: true });
    const imageUrl = request.file ? `${request.protocol}://${request.get('host')}/${request.file.path}` : undefined;
    response.json({ ...updatedProduct._doc, imageUrl });
  } catch (error) {
    next(error);
  }
});

// GET products by category
productsRouter.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log('Category:', category);
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = productsRouter;
