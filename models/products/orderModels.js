const mongoose = require('mongoose')

// Define the schema for the OrderModel
const orderSchema = new mongoose.Schema({
    order_no: {
        // Add an order_id field for the order ID
        type: Number,
        unique: true, // Ensure uniqueness
    },
    invoice: String,
    order_total: Number,
    username: String,
    payment_mode: { type: String, default: '' },
    payment_balance: { type: String, default: 0 },
    payment_status: { type: String, default: '' },
    items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
            productname: { type: String },
            productprice: { type: String },
            quantity: { type: Number, required: true },
        },
    ],

    orderDate: {
        type: Date,
        default: Date.now, // Set the default value to the current date and time
    },

    order_status: {
        type: String,
        default: 'Processing',
    },
})

// Create the OrderModel
const OrderModel = mongoose.model('Order', orderSchema)

module.exports = OrderModel
