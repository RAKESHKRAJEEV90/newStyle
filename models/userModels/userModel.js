const validator = require('validator')
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            validate: {
                validator: (value) => validator.isEmail(value),
                message: 'Invalid email format',
            },
        },
        mobile: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
        },
        is_verified: {
            type: Number,
            default: 0,
        },
        is_admin: {
            type: Number,
            default: 0,
        },
        is_blocked: {
            type: Number,
            default: 0,
        },
        token: {
            type: String,
            default: '',
        },
        coupon_id: [
            {
                type: String,
                default: '',
            },
        ],
       
                wallet_balance: { type: Number, default: 0 },
    
    },
    {
        timestamps: true,
    }
)
const UserModel = mongoose.model('UserModel', userSchema)
module.exports = UserModel
