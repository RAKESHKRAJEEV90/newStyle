const express = require('express')
const admin_route = express()
const multer = require('multer')
const config = require('../config/config')
const session = require('express-session')
const nocache = require('nocache')

admin_route.use(
    session({
        name: 'adminSession',
        secret: config.adminSessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            path: '/admin', // Specify the path for admin sessions
            maxAge: 24 * 60 * 60 * 1000, // Session duration
        },
    })
)
const { isLogin, isLogout } = require('../middlewares/auth/adminAuth')
const path = require('path')
// Multer configuration for file uploads

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/admin/adminImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    },
})

const upload = multer({ storage: storage })

const adminController = require('../controllers/adminController')
const { findById } = require('../models/products/categoryModel')
const OrderModel = require('../models/products/orderModels')

//admin login page load
admin_route.get('/', isLogout, adminController.loadLogin)
admin_route.get('/admin', isLogout, nocache(), adminController.loadLogin)

admin_route.post('/', adminController.verifyLogin)
//admin home
admin_route.get('/home', isLogin, nocache(), adminController.loadHome)
admin_route.get('/user-list', isLogin, adminController.loadUserList)
admin_route.get('/add-user', isLogin, adminController.addUser)
admin_route.get('/edit-user', isLogin, adminController.editUser)
admin_route.get('/delete-user', adminController.deleteUser)

//Define the route to handle status toggling
admin_route.post('/toggle-status/:userId', adminController.blockUser)

//category section
admin_route.get('/add-category', isLogin, adminController.loadAddCategory)
admin_route.post('/add-category',upload.single('image'),adminController.addCategory);
admin_route.get('/list-category', isLogin, adminController.listCategory)
//category activeor inactivechanging
//admin_route.post('/update-category-status',isLogin,adminController.updateCategoryStatus);
admin_route.get('/edit-category', isLogin, adminController.loadEditCategory)
admin_route.post(
    '/edit-category',
    upload.single('image'),
    adminController.updateCategory
)
admin_route.get('/delete-category', adminController.deleteCategory)

//product section
admin_route.get('/add-product', isLogin, adminController.loadAddProduct)
admin_route.post(
    '/add-product',
    upload.array('images', 4),
    adminController.addProduct
)
admin_route.get('/list-product', isLogin, adminController.listProduct)
admin_route.get('/product-details', isLogin, adminController.viewProduct)
admin_route.get('/edit-product', isLogin, adminController.loadEditProduct)
admin_route.post(
    '/edit-product',
    upload.single('image'),
    adminController.updateProduct
)
admin_route.get('/delete-product', adminController.deleteProduct)
//place order
admin_route.get('/list-orders', adminController.loadListOrders)

admin_route.get('/logout', isLogin, nocache(), adminController.logout)
//coupon creating and maintaining
admin_route.get('/coupon', isLogin, adminController.loadReference)
admin_route.post('/coupon', adminController.addCoupon)
admin_route.post('/update-coupon-status', adminController.couponStatus)
admin_route.get('/list-coupon', isLogin, adminController.listCoupon)
admin_route.get('/sales-report', isLogin, adminController.loadSalesReport)
admin_route.get('/sales-report-xls', adminController.loadXlsReport)
admin_route.get('/sales-report-pdf', adminController.loadPdfReport)

admin_route.get('/orders/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId

        const orderDetails = await OrderModel.findById(orderId)
        if (!orderDetails) {
            return res.status(404).json({ error: 'Order not found' })
        }

        res.json(orderDetails)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})
admin_route.post('/update-order-status', async (req, res) => {
    try {
        const { orderId, status } = req.body // Parse the data from the request body

        // Perform the update operation here

        await OrderModel.findByIdAndUpdate(
            { _id: orderId },
            { $set: { order_status: status } }
        )
        // Send a response back to the client if needed
        res.json({ message: 'Order status updated successfully' })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

admin_route.get('*', function (req, res) {
    res.redirect('/admin')
})

module.exports = admin_route
