const { timeStamp } = require('console')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema(
    {
        product_id: { type: String },
        user_id: { type: String },
        cart_quantity: Number,
    },
    {
        timestamps: true,
    }
)
const CartModel = mongoose.model('CartModel', cartSchema)
module.exports = CartModel
