const mongoose = require('mongoose')
const Schema = mongoose.Schema

const otpSchema = new Schema({
    user_id: String,
    email: String,
    otp: String,
    count: Number,
    createdAt: Date,
    expiresAt: Date,
})
const UserOtp = mongoose.model('UserOtp', otpSchema)
module.exports = UserOtp
