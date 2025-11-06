import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

// Static method to get or create cart
cartSchema.statics.getOrCreateCart = async function(userId) {
    let cart = await this.findOne({ userId, isActive: true })
        .populate('items.productId', 'name type description capacity warrantyPeriod');
    
    if (!cart) {
        cart = new this({ userId, items: [] });
        await cart.save();
        cart = await this.findById(cart._id)
            .populate('items.productId', 'name type description capacity warrantyPeriod');
    }
    
    return cart;
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
