const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, ecoRating } = req.query;
        let query = {};

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (ecoRating) query.ecoRating = Number(ecoRating);

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new product (admin only)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            ecoRating: req.body.ecoRating,
            category: req.body.category,
            image: req.file ? req.file.path : req.body.image,
            stock: req.body.stock,
            materials: JSON.parse(req.body.materials),
            sustainabilityFeatures: JSON.parse(req.body.sustainabilityFeatures),
            packaging: {
                type: req.body.packagingType,
                description: req.body.packagingDescription
            },
            carbonFootprint: req.body.carbonFootprint
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product (admin only)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.ecoRating = req.body.ecoRating || product.ecoRating;
        product.category = req.body.category || product.category;
        product.stock = req.body.stock || product.stock;
        product.materials = req.body.materials ? JSON.parse(req.body.materials) : product.materials;
        product.sustainabilityFeatures = req.body.sustainabilityFeatures ? 
            JSON.parse(req.body.sustainabilityFeatures) : product.sustainabilityFeatures;
        product.packaging.type = req.body.packagingType || product.packaging.type;
        product.packaging.description = req.body.packagingDescription || product.packaging.description;
        product.carbonFootprint = req.body.carbonFootprint || product.carbonFootprint;

        if (req.file) {
            product.image = req.file.path;
        }

        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get eco-friendly products (rating >= 4)
router.get('/eco-friendly/top', async (req, res) => {
    try {
        const products = await Product.find({ ecoRating: { $gte: 4 } })
            .sort({ ecoRating: -1 });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search products
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        }).select('name price image ecoRating');

        res.json(products);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error performing search' });
    }
});

module.exports = router; 