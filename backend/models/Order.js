const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: Number,
        price: Number
    }],
    address: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'crypto', 'mpesa'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentDetails: {
        type: mongoose.Schema.Types.Mixed
    },
    total: Number,
    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);