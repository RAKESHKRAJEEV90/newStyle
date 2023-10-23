const { timeStamp } = require('console')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema(
    {
        category: { type: String },
        image: { type: String, default: '' },

        discription: String,
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)
const CategoryModel = mongoose.model('CategoryModel', categorySchema)
module.exports = CategoryModel
