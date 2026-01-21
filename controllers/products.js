const express = require('express');
const productsRouter = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');

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
productsRouter.post('/', async (req, res, next) => {
  const { name, description, price, category, categoryId } = req.body;
  const categoryInput = category || categoryId;

  console.log('POST /products - received body:', { name, description, price, categoryInput });

  if (!name || !price || !categoryInput) {
    console.log('Validation failed - missing fields');
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  try {
    let categoryRecord;
    
    console.log('Looking up category:', categoryInput);
    
    // Check if input is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(categoryInput)) {
      console.log('Input is valid ObjectId, searching by ID');
      categoryRecord = await Category.findById(categoryInput);
    } else {
      // Try to find by category name
      console.log('Input is not ObjectId, searching by name');
      categoryRecord = await Category.findOne({ name: categoryInput });
    }

    console.log('Category lookup result:', categoryRecord);

    if (!categoryRecord) {
      console.log('Category not found:', categoryInput);
      return res.status(400).json({ error: `Category "${categoryInput}" does not exist` });
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category: categoryRecord._id,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('Saving product:', product);
    const savedProduct = await product.save();
    console.log('Product saved successfully:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error saving product:', error.message);
    res.status(400).json({ error: error.message });
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
productsRouter.put('/:id', async (request, response, next) => {
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
      updated_at: new Date()
    };

    const updatedProduct = await Product.findByIdAndUpdate(request.params.id, product, { new: true });
    response.json(updatedProduct);
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
