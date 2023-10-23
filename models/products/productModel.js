const { timeStamp } = require('console')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema(
    {
        productcode: String,
        productname: String,
        producttype: String,
        price: Number,
        category_id: String,
        category_name: String,
        image: [],
        cart_quantity: { type: Number, default: 0 },
        quantity: Number,
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)
const ProductModel = mongoose.model('ProductModel', productSchema)
module.exports = ProductModel
