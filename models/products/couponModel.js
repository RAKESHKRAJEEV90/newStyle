const mongoose = require('mongoose')
const Schema = mongoose.Schema
const couponSchema = new Schema(
    {
        coupon_code: String,
        calculation: Number,
        calc_type: String,
        coupon_desc: String,
        coupon_price: Number,
        coupon_quantity: Number,
        coupon_active: { type: Boolean, default: true },
    },
    { timestamps: true }
)
const CouponModel = mongoose.model('CouponModel', couponSchema)
module.exports = CouponModel
