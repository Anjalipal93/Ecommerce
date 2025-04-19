const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    loyaltyStatus: {
        type: String,
        enum: ['new', 'regular', 'loyal', 'premium'],
        default: 'new'
    },
    freePlantEligible: {
        type: Boolean,
        default: true
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update loyalty status
userSchema.methods.updateLoyaltyStatus = function() {
    if (this.loyaltyPoints >= 1000) {
        this.loyaltyStatus = 'premium';
    } else if (this.loyaltyPoints >= 500) {
        this.loyaltyStatus = 'loyal';
    } else if (this.loyaltyPoints >= 100) {
        this.loyaltyStatus = 'regular';
    }
    return this.save();
};

module.exports = mongoose.model('User', userSchema); 