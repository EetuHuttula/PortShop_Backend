const express = require('express');
const ordersRouter = express.Router();
const Order = require('../models/order');
const middleware = require('../utils/middleware');

// GET all orders for the authenticated user
ordersRouter.get('/', middleware.userExtractor, async (request, response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ error: 'user not authenticated' });
    }

    const orders = await Order.find({ userId: request.user.id })
      .populate('items.productId', { name: 1, price: 1 })
      .sort({ createdAt: -1 });

    response.json(orders);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET a single order by ID
ordersRouter.get('/:id', middleware.userExtractor, async (request, response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ error: 'user not authenticated' });
    }

    const order = await Order.findById(request.params.id)
      .populate('items.productId', { name: 1, price: 1 });

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the authenticated user
    if (order.userId.toString() !== request.user.id) {
      return response.status(403).json({ error: 'Unauthorized access' });
    }

    response.json(order);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create a new order
ordersRouter.post('/', middleware.userExtractor, async (request, response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ error: 'user not authenticated' });
    }

    const { items, total } = request.body;

    if (!items || items.length === 0) {
      return response.status(400).json({ error: 'Order must contain items' });
    }

    if (!total || total <= 0) {
      return response.status(400).json({ error: 'Total must be greater than 0' });
    }

    const newOrder = new Order({
      userId: request.user.id,
      items,
      total,
      status: 'Processing'
    });

    const savedOrder = await newOrder.save();
    await savedOrder.populate('items.productId', { name: 1, price: 1 });

    response.status(201).json(savedOrder);
  } catch (error) {
    response.status(400).json({ error: 'Failed to create order', details: error.message });
  }
});

// PUT update order status (admin only)
ordersRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  try {
    if (!request.user || !request.user.isAdmin) {
      return response.status(403).json({ error: 'Only admins can update orders' });
    }

    const { status } = request.body;

    if (!status) {
      return response.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      request.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('items.productId', { name: 1, price: 1 });

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    response.json(order);
  } catch (error) {
    response.status(400).json({ error: 'Failed to update order' });
  }
});

// PUT cancel order (user can cancel their own orders)
ordersRouter.put('/:id/cancel', middleware.userExtractor, async (request, response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ error: 'user not authenticated' });
    }

    const order = await Order.findById(request.params.id);

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the authenticated user
    if (order.userId.toString() !== request.user.id) {
      return response.status(403).json({ error: 'Unauthorized access' });
    }

    // Check if order can be cancelled
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return response.status(400).json({ error: `Cannot cancel an order with status: ${order.status}` });
    }

    order.status = 'Cancelled';
    order.updatedAt = new Date();
    await order.save();

    response.json(order);
  } catch (error) {
    response.status(400).json({ error: 'Failed to cancel order' });
  }
});

// DELETE an order (admin only)
ordersRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  try {
    if (!request.user || !request.user.isAdmin) {
      return response.status(403).json({ error: 'Only admins can delete orders' });
    }

    const order = await Order.findByIdAndDelete(request.params.id);

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    response.status(204).end();
  } catch (error) {
    response.status(400).json({ error: 'Failed to delete order' });
  }
});

module.exports = ordersRouter;
