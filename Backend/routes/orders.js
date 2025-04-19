const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = await User.findById(decoded.userId);
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calculate total amount and verify product availability
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
        }

        // Check if user is eligible for free plant
        const freePlantIncluded = req.user.freePlantEligible;

        // Create order
        const order = new Order({
            user: req.user._id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            shippingAddress,
            paymentMethod,
            freePlantIncluded,
            packagingType: 'compostable', // Default to compostable packaging
            carbonOffset: 0 // Will be calculated by the model
        });

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Update user's free plant eligibility
        if (freePlantIncluded) {
            await User.findByIdAndUpdate(
                req.user._id,
                { freePlantEligible: false }
            );
        }

        // Add loyalty points (1 point per dollar spent)
        const loyaltyPoints = Math.floor(totalAmount);
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { loyaltyPoints } }
        );

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name image price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name image price');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to cancel this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only allow cancellation of pending orders
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot cancel order in current status' });
        }

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        order.status = 'cancelled';
        await order.save();

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 