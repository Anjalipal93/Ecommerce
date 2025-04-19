const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    ecoRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        required: true,
        enum: ['clothing', 'accessories', 'home', 'personal-care', 'other']
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    materials: [{
        type: String,
        required: true
    }],
    sustainabilityFeatures: [{
        type: String
    }],
    packaging: {
        type: {
            type: String,
            enum: ['compostable', 'recyclable', 'reusable'],
            required: true
        },
        description: String
    },
    carbonFootprint: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema); 