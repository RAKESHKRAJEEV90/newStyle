const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
        },
        name: { type: String },
        image: {},
        address1: {
            type: String,
            default: '',
        },
        address2: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        pin: {
            type: Number,
            default: '',
        },
    },
    {
        timestamps: true,
    }
)
const AddressModel = mongoose.model('AddressModel', addressSchema)
module.exports = AddressModel
