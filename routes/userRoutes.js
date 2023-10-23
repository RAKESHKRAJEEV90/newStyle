const express = require('express')
const user_route = express()
const session = require('express-session')
const config = require('../config/config')
const multer = require('multer')
const nocache = require('nocache')

//for user auth
const { isLogin, isLogout, checkUser } = require('../middlewares/auth/auth')
//session
user_route.use(
    session({
        name: 'userSession',
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            path: '/', // Specify the path for user sessions
            maxAge: 24 * 60 * 60 * 1000, // Session duration
        },
    })
)
const bodyParser = require('body-parser')
user_route.use(bodyParser.urlencoded({ extended: true }))
const path = require('path')
// Multer configuration for file uploads

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/user/userImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    },
})

const upload = multer({ storage: storage })

const userController = require('../controllers/userController')
//routes
//registration
user_route.get('/register', isLogout, userController.loadRegister)
user_route.post('/check-user', userController.loadCheckUser)
user_route.post('/otp', upload.single('image'), userController.loadOtp)
user_route.post('/send-otp', userController.resendOtp)
user_route.post('/verify-otp', userController.verifyOtp)

user_route.get('/verify', userController.verifyMail)

//guest home
user_route.get('/', isLogout, nocache(), userController.guestLoad)
//user login
user_route.get('/login', isLogout, nocache(), userController.loginLoad)
user_route.post('/login', userController.verifyLogin)

//home
user_route.get('/home', isLogin, nocache(), userController.loadHome)
user_route.get('/dashboard', isLogin, userController.loadDashboard)
user_route.get('/logout', isLogin, nocache(), userController.userLogout)

user_route.get('/forget', isLogout, userController.forgetLoad)
user_route.post('/forget', userController.forgetVerify)

user_route.get('/forget-password', isLogout, userController.forgetPasswordLoad)
user_route.post('/forget-password', userController.resetPassword)

user_route.get('/verification', userController.verificationLoad)
user_route.post('/verification', userController.sentVerifyLink)

user_route.get('/edit', isLogin, userController.editLoad)
user_route.post('/edit', userController.updateProfile)

user_route.get('/view-product', userController.loadViewProduct)
//cart coding starts here
user_route.get('/add-cart', isLogin, userController.addCart)
//viewing cart
user_route.get('/addtocart', isLogin, userController.viewCart)
// Server-side route to update cart quantity
user_route.post('/update-cart-quantity', userController.cartUpdate)
user_route.get('/remove', userController.removeFromCart)

//coupon
user_route.post('/post-coupon', userController.loadCouponCalc)
//add fund to wallet
user_route.get('/stripepay', userController.addFund)
//checkout page route
user_route.get('/checkout', userController.loadCheckout)
user_route.get('/stripe', userController.loadStripe)
user_route.get('/payment', userController.loadRazor)
user_route.post('/razor', userController.addRazor)
user_route.post('/create-payment-intent', userController.createStripe)
// Define a route for processing payments
user_route.get('/order-complete', userController.loadOrderComplete)
user_route.get('/wallet', isLogin, userController.loadWallet)

module.exports = user_route
