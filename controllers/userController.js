const bcrypt = require('bcrypt')
//alerts
const alerts = require('../public/alrets')
const errors = require('../public/error-handling')
//mongoDB user model
const UserModel = require('../models/userModels/userModel')
//mongoDB OTP model
const UserOtp = require('../models/userModels/otpModel')
//MongoDB product Model
const productModel = require('../models/products/productModel')
//MongoDB Category model
const categoryModel = require('../models/products/categoryModel')
//MongoDB Address Model
const AddressModel = require('../models/userModels/addressModel')
//MongoDB Cart Model
const CartModel = require('../models/products/cartModel')
//MongoDB OrderModel
const OrderModel = require('../models/products/orderModels')
//mongoose
const mongoose = require('mongoose')

const config = require('../config/config')
require('dotenv').config()
const randomstring = require('randomstring')
const nodemailer = require('nodemailer')
const Stripe = require('stripe')
const stripe = Stripe(process.env.API)
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_KEY_SECRET,
})

//Import the library into your project
var easyInvoice = require('easyinvoice')
var fs = require('fs')
const path = require('path')

var invoicesFolderPath = path.join(__dirname, '..', 'public', 'invoices')

// Ensure the invoices folder exists; create it if it doesn't.
if (!fs.existsSync(invoicesFolderPath)) {
    // Create the folder if it doesn't exist.
    fs.mkdirSync(invoicesFolderPath, { recursive: true })
}
// Define a function to generate a unique invoice number
function generateUniqueInvoiceNumber() {
    // Define the path to the file containing the last invoice number
    const filePath = path.join(
        __dirname,
        '..',
        'public/invoices',
        'last_invoice_number.txt'
    )

    try {
        // Read the content of the file (synchronously)
        const lastInvoiceNumber = fs.readFileSync(filePath, 'utf-8')

        // Convert the read content to an integer
        const lastInvoiceNumberInt = parseInt(lastInvoiceNumber)

        if (!isNaN(lastInvoiceNumberInt)) {
            // Increment the last invoice number and write it back to the file
            const newInvoiceNumber = lastInvoiceNumberInt + 1
            fs.writeFileSync(filePath, newInvoiceNumber.toString(), 'utf-8')

            return newInvoiceNumber
        } else {
            // Handle the case where the file doesn't contain a valid number
            console.error('Invalid last invoice number in the file.')
            return null // You can handle this error in your code
        }
    } catch (error) {
        // Handle file read/write errors
        console.error(
            'Error reading or writing the last invoice number:',
            error
        )
        return null // You can handle this error in your code
    }
}

// Get the current date without the time
const currentDate = new Date()
currentDate.setHours(0, 0, 0, 0) // Set the time to midnight (00:00:00)
// Calculate the due date as 15 days from the current date
var dueDate = new Date(currentDate)
dueDate.setDate(currentDate.getDate() + 15) // Add 15 days

// Format the dates as "DD-MM-YYYY"
var formattedCurrentDate = `${currentDate.getDate()}-${
    currentDate.getMonth() + 1
}-${currentDate.getFullYear()}`
var formattedDueDate = `${dueDate.getDate()}-${
    dueDate.getMonth() + 1
}-${dueDate.getFullYear()}`

//for password hashing

const securePassword = async (password) => {
    try {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}
//otp generation for login

const sendOtp = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.mailUsername,
                pass: config.mailPassword,
            },
        })
        const otp = `${Math.floor(10000 + Math.random() * 9000)}`
        console.log(otp)
        //mail option
        const mailOptions = {
            from: config.mailUsername,
            to: email,
            subject: 'OTP Verification for Your Email',
            html:
                `<p> Hi, ` +
                name +
                `,Enter <b>${otp}</b> in the app to verify your email address.please click here to <a href="http://127.0.0.1:3000/otp?id='+user_id+'">Verify</a> your mail.This code <b>expires in 1 hour</b>.</p>`,
        }
        //hash the otp
        const saltRounds = 10
        const hashedOtp = await bcrypt.hash(otp, saltRounds)
        const otpData = await UserOtp.findOne({ email: email })
        let newOtp

        if (otpData) {
            // If an OTP record already exists, update it
            const updatedOtp = {
                otp: hashedOtp,
                count: otpData.count + 1,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            }

            newOtp = await UserOtp.findOneAndUpdate(
                { user_id: user_id },
                updatedOtp,
                { new: true }
            )
        } else {
            // If no OTP record exists, create a new one
            newOtp = new UserOtp({
                user_id: user_id,
                email: email,
                otp: hashedOtp,
                count: 1,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            })

            await newOtp.save()
        }

        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log('email has been sent: ', info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

//for reset password mail
const resetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.mailUsername,
                pass: config.mailPassword,
            },
        })
        const mailOptions = {
            from: config.mailUsername,
            to: email,
            subject: 'For Reset Password ',
            html:
                '<p> Hi, ' +
                name +
                ', please click here to <a href="http://127.0.0.1:3000/forget-password?token=' +
                token +
                '">Reset</a> your password.</p>',
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log('email has been sent: ', info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

//Guest home page
const guestLoad = async (req, res) => {
    try {
        var search = '';
        if(req.query.search){
            search =req.query.search;
        }
        var page = 1;
        
        if(req.query.page){
            page =req.query.page;
        }
        
        const limit = 9;
        const productData = await productModel.find({
            $or:[
                {productname:{$regex:'.*'+search+'.*',$options:'i'}},
                // {price:{$regex:'.*'+search+'.*',$options:'i'}},

            ]
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec();

        const count = await productModel.find({
            $or:[
                {productname:{$regex:'.*'+search+'.*',$options:'i'}},
                // {price:{$regex:'.*'+search+'.*',$options:'i'}},

            ]
        }).countDocuments();
        const categoryData = await categoryModel.find({})

        return res.render('users/guest', {
            product: productData,
            category: categoryData,
            totalPages:Math.ceil(count/limit),
            currentPage:page,
            nextPage:page++,
        })
        
    } catch (error) {
        console.log(error)
    }
}

//registration page
const loadRegister = async (req, res) => {
    try {
        // res.render('users/registration/step1')
        res.render('users/registration')
    } catch (error) {
        console.log(error.message)
    }
}
//checking if the user exist or not
const loadCheckUser = async (req, res) => {
    try {
        const email = req.body.email
        console.log(email)
        const checkUser = await UserModel.findOne({ email: email })
        if (checkUser) {
            if (checkUser.is_verified === 0) {
                res.status(201).json({
                    status: 201,
                    message: 'User exists but needs verification',
                })
                sendOtp(checkUser.name, checkUser.email, checkUser._id)
            } else {
                res.status(200).json({ error: 'User exists and is verified' })
            }
        } else {
            res.status(202).json({ error: 'User does not exist' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

const { validationResult } = require('express-validator')
const CouponModel = require('../models/products/couponModel')

const loadOtp = async (req, res) => {
    try {
        // Validate input data using express-validator
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, mno, address1, address2, city, pin, password } =
            req.body
        console.log(password)
        const spassword = await securePassword(password)
        let image = '01.png' // Default image path
        console.log(spassword)
        // Check if an image was uploaded
        if (req.file) {
            image = req.file.filename // Use the uploaded image filename if it exists
        }

        const checkUser = await UserModel.findOne({ email: email })
        if (!checkUser) {
            const user = new UserModel({
                name: name,
                email: email,
                mobile: mno,
                password: spassword,
            })

            const userData = await user.save()
            if (userData) {
                const address = new AddressModel({
                    user_id: userData._id,
                    name: userData.name,
                    image: image,
                    address1: address1,
                    address2: address2,
                    city: city,
                    pin: pin,
                })
                await address.save()
                sendOtp(userData.name, userData.email, userData._id)
                res.status(201).json({ message: 'Registration successful' })
            } else {
                res.status(500).json({ error: 'Registration failed' })
            }
        } else {
            res.status(409).json({ message: 'User already exists' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//resend otp
const resendOtp = async (req, res) => {
    try {
        const email = req.body.email
        console.log('email:', email)
        const checkUser = await UserModel.findOne({ email: email })
        if (checkUser) {
            if (checkUser.is_verified == 0) {
                sendOtp(checkUser.name, checkUser.email, checkUser._id)
                res.json({ message: 'OTP resent successfully.' })
            } else {
                res.json({ message: 'user already verified' })
            }
        } else {
            res.json({ message: 'User not Exist' })
        }
    } catch (error) {
        res.json({ error })
    }
}

//verifying otp entered by the user with the database
const verifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body
        console.log('Request Body:', req.body)

        console.log('otpverify:', otp)
        console.log('email:', email)
        if (!email || !otp) {
            throw Error('Empty otp details are not allowed')
        } else {
            const userOtpRecords = await UserOtp.find({
                email: email,
            })

            if (userOtpRecords.length === 0) {
                throw new Error('Account record not exist or already verified')
            } else {
                const userOtpRecord = userOtpRecords[0] // Assuming you want to work with the first matching record
                const expiresAt = userOtpRecord.expiresAt
                const hashedOtp = userOtpRecord.otp

                if (expiresAt < Date.now()) {
                    // OTP record has expired
                    await UserOtp.deleteMany({ email: email })
                    res.status(400).json({ error: 'Code has expired' })
                    throw new Error('Code has expired')
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp)
                    if (!validOtp) {
                        res.status(400).json({ error: 'Invalid OTP' })
                        throw new Error('Invalid otp')
                    } else {
                        await UserModel.updateOne(
                            { email: email },
                            { $set: { is_verified: 1 } }
                        )
                        await UserOtp.deleteMany({ email: email })
                        res.status(200).json({
                            message: 'User Verification Success.',
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}
//registration process ends here
// const loadFinish = async (req, res) => {
//     try {
//         res.render('users/registration/step4')
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await UserModel.updateOne(
            { _id: req.query.id },
            { $set: { is_verified: 1 } }
        )
        res.render('users/email-verified')
    } catch (error) {
        console.log(error.message)
    }
}
//login user methods started, login get method
const loginLoad = async (req, res) => {
    try {
        res.render('users/login')
    } catch (error) {
        console.log(error.message)
    }
}
//login post method

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await UserModel.findOne({ email: email })

        if (userData) {
            const passwordMatch = await bcrypt.compare(
                password,
                userData.password
            )
            console.log('passwordMatch', passwordMatch)

            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.status(401).json({
                        status: 401,
                        message: 'Please verify your Email',
                    })
                } else {
                    req.session.user_id = userData._id
                    res.status(200).json({
                        status: 200,
                        message: 'Login successful',
                    })
                }
            } else {
                res.status(401).json({ status: 401, message: 'Wrong Password' })
            }
        } else {
            res.status(401).json({
                status: 401,
                message: 'Wrong Email and Password',
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}
//load user home
const loadHome = async (req, res) => {
    try {
        user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
           
            const userData = await UserModel.findById({
                _id: req.session.user_id,
            })
            const cartProducts = await fetchCartProducts(user_id)
            const cartCount = await CartModel.countDocuments({
                user_id: user_id,
            })
            const subtotal = await calculateSubtotal(cartProducts)

            if (!userData) {
                // Handle the case where the user is not found in the database
                return res
                    .status(404)
                    .json({ status: 404, message: 'User not found' })
            }

            if (userData.is_admin === 0) {
                if (userData.is_blocked === 0) {
                    var search = '';
                    if(req.query.search){
                        search =req.query.search;
                    }
                    var page = 1;
                    
                    if(req.query.page){
                        page =req.query.page;
                    }
                    
                    const limit = 9;
                    const productData = await productModel.find({
                        $or:[
                            {productname:{$regex:'.*'+search+'.*',$options:'i'}},
                            // {price:{$regex:'.*'+search+'.*',$options:'i'}},

                        ]
                    })
                    .limit(limit*1)
                    .skip((page-1)*limit)
                    .exec();

                    const count = await productModel.find({
                        $or:[
                            {productname:{$regex:'.*'+search+'.*',$options:'i'}},
                            // {price:{$regex:'.*'+search+'.*',$options:'i'}},

                        ]
                    }).countDocuments();
                    const categoryData = await categoryModel.find({})

                    return res.render('users/home', {
                        user: userData,
                        product: productData,
                        category: categoryData,
                        totalPages:Math.ceil(count/limit),
                        currentPage:page,
                        nextPage:page++,
                        cartProducts,
                        cartCount,
                        subtotal,
                    })
                } else {
                    req.session.destroy()
                    res.redirect('/')
                }
            } else {
                return res.redirect('/admin')
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send('Internal Server Error')
    }
}
//calcualte cart subtotal
function calculateSubtotal(cartProducts) {
    let subtotal = 0

    for (let i = 0; i < cartProducts.length; i++) {
        subtotal += cartProducts[i].price * cartProducts[i].cart_quantity
    }

    return subtotal
}

//user logout

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}
//forget password code start, get method
const forgetLoad = async (req, res) => {
    try {
        res.render('users/forget')
    } catch (error) {
        console.log(error.message)
    }
}
//forget password post method

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email
        const userData = await UserModel.findOne({ email: email })
        if (userData) {
            if (userData.is_verified === 0) {
                res.render('users/forget', {
                    message: 'Please verify your mail',
                })
            } else {
                const randomString = randomstring.generate()
                const updatedData = await UserModel.updateOne(
                    { email: email },
                    { $set: { token: randomString } }
                )
                resetPasswordMail(userData.name, userData.email, randomString)
                res.render('users/confirm-mail', {
                    email,
                })
            }
        } else {
            res.render('users/forget', { message: 'User Email is incorrect' })
        }
    } catch (error) {
        console.log(error.message)
    }
}
//resetlink of forget password, load
const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await UserModel.findOne({ token: token })
        if (tokenData) {
            res.render('users/forget-password', { user_id: tokenData._id })
        } else {
            res.render('404', { message: 'Token is invalid' })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//reset password post method, updating password in database

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password
        const user_id = req.body.user_id
        const secure_password = await securePassword(password)
        const updatedData = await UserModel.findByIdAndUpdate(
            { _id: user_id },
            { $set: { password: secure_password, token: '' } }
        )
        res.render('users/password-updated')
    } catch (error) {
        console.log(error.message)
    }
}
//forverification mail
const verificationLoad = async (req, res) => {
    try {
        res.render('users/verification')
    } catch (error) {
        console.log(error.message)
    }
}
const sentVerifyLink = async (req, res) => {
    try {
        const email = req.body.email
        const userData = await UserModel.findOne({ email: email })
        if (userData) {
            sendOtp(userData.name, userData.email, userData._id)
            res.render('users/verification', {
                message: 'Please chek your mail',
            })
        } else {
            res.render('users/verification', { message: 'This mail not exist' })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//user profile edit &update
const editLoad = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await UserModel.findById({ _id: id })
        if (userData) {
            res.render('users/edit', { user: userData })
        } else {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//user profile update
const updateProfile = async (req, res) => {
    try {
        const user_id = req.body.user_id

        const userData = await User.findByIdAndUpdate(
            { _id: user_id },
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mno,
                },
            }
        )
        if (userData) {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//load view product
const loadViewProduct = async (req, res) => {
    try {
        const user_id = req.session.user_id
        const product_id = req.query.id
        const productData = await productModel.findById({ _id: product_id })
        productsData = await productModel.find({})
        const cartProducts = await fetchCartProducts(user_id)
        const subtotal = await calculateSubtotal(cartProducts)

        const cartCount = await CartModel.countDocuments({
            user_id: user_id,
        })
        res.render('users/view-product', {
            product: productData,
            products: productsData,
            cartCount,cartProducts,subtotal
        })
        
    } catch (error) {
        res.status(500).send('internal server error')
    }
}
//user cart code starts here
//adding data to cart DB
const addCart = async (req, res) => {
    try {
        const product_id = req.query.id
        const user_id = req.session.user_id
        const userData = await UserModel.findById({ _id: user_id })
        const productData = await productModel.findById({ _id: product_id })
        //check the quantity
        if (productData.quantity == 0) {
            res.status(500).json({
                success: false,
                message: 'Out of Stock',
            })
        } else {
            // Check if the product is already in the user's cart
            const existingCartItem = await CartModel.findOne({
                product_id,
                user_id,
            })

            if (existingCartItem) {
                // If it's already in the cart, update the quantity (you may need to have a quantity field in your CartModel)
                if (existingCartItem.cart_quantity >= productData.quantity) {
                    res.status(500).json({
                        success: false,
                        message: 'Out of Stock',
                    })
                } else {
                    existingCartItem.cart_quantity++ // Assuming you have a quantity field
                    await existingCartItem.save()
                }
            } else {
                // If it's not in the cart, create a new cart entry
                const cart = new CartModel({
                    product_id: product_id,
                    user_id: user_id,
                    cart_quantity: 1, // You may need to initialize the quantity
                })
                await cart.save()
            }

            if (userData.is_admin === 0) {
                res.redirect('/home')
            } else {
                res.redirect('/admin/home')
            }
        }
    } catch (error) {
        console.error(error.message)
    }
}
//view cart
const viewCart = async (req, res) => {
    try {
        const user_id = req.session.user_id
        const cartProducts = await fetchCartProducts(user_id)
        const subtotal = await calculateSubtotal(cartProducts)
        const totalAmount = await calculateTotalAmount(subtotal)

        res.render('users/user-cart', { cartProducts, subtotal, totalAmount })
    } catch (error) {
        console.log(error.message)
    }
}

//function for calculating the total amount in the cart
function calculateTotalAmount(subtotal) {
    let shippingCost = 0
    const total = subtotal + shippingCost
    return total
}

//function for fetching products from cartModel
const fetchCartProducts = async (user_id) => {
    try {
        // Find all documents in CartModel where user_id matches the provided userId
        const cartItems = await CartModel.find({ user_id })

        // Extract all product_ids and quantities from the cartItems
        const productData = cartItems.map((item) => ({
            product_id: item.product_id,
            cart_quantity: item.cart_quantity, // Assuming you have a quantity field in CartModel
        }))
        // Use the extracted product_ids to fetch product details from ProductModel
        const productIds = productData.map((item) => item.product_id)
        const products = await productModel.find({ _id: { $in: productIds } })

        // Create a variable to store product details with cart quantities
        const cartProducts = products.map((product) => {
            const cartItem = productData.find(
                (item) => item.product_id.toString() === product._id.toString()
            )
            return {
                ...product.toObject(),
                cart_quantity: cartItem ? cartItem.cart_quantity : 0,
            }
        })

        return cartProducts
    } catch (error) {
        console.error('Error fetching cart products:', error)
        throw error
    }
}

//cart update
const cartUpdate = async (req, res) => {
    try {
        const { product_id, quantity } = req.query

        // Use the correct objectId variable in your update query
        await CartModel.findOneAndUpdate(
            { product_id: product_id },
            { $set: { cart_quantity: quantity } }
        )

        // Send a response indicating success or failure
        res.json({ success: true, message: 'Quantity updated successfully' })
    } catch (error) {
        console.error('Error updating cart quantity:', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        })
    }
}
//remove from cart
const removeFromCart = async (req, res) => {
    try {
        const product_id = req.query.id
        await CartModel.findOneAndDelete({ product_id: product_id })
        res.redirect('back')
    } catch (error) {
        console.log(error.message)
    }
}

//coupon codestarts here
const loadCouponCalc = async (req, res) => {
    try {
        let { couponCode } = req.body
        couponCode = couponCode.toUpperCase()

        const user_id = req.session.user_id

        const couponData = await CouponModel.findOne({
            coupon_code: couponCode,
        })
        const userData = await UserModel.findById(user_id)

        if (!couponData) {
            // Coupon not found
            return res.status(404).json({ error: 'Coupon not found' })
        }

        if (userData.coupon_id.includes(couponData._id)) {
            // Coupon already used by the user
            return res.status(400).json({ error: 'Coupon already used' })
        }

        const discount = couponData.calculation
        const calculation = couponData.calc_type
        res.status(200).json({ discount, calculation })
    } catch (error) {
        // Handle unexpected errors
        console.error('Error in loadCouponCalc:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//load checkout page
const loadCheckout = async (req, res) => {
    try {
        const user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
            let { couponCode } = req.query
            if (couponCode) {
                couponCode = couponCode.toUpperCase()
            }
            const cartProducts = await fetchCartProducts(user_id)
            let subtotal = await calculateSubtotal(cartProducts)
            let totalAmount = await calculateTotalAmount(subtotal)
            const addressData = await AddressModel.findOne({ user_id: user_id })
            const userData = await UserModel.findById({
                _id: req.session.user_id,
            })
            let couponData = await CouponModel.findOne({
                coupon_code: couponCode,
            })

            if (couponCode) {
                if (couponData.calc_type === 'SUBTRACTION') {
                    subtotal = subtotal - couponData.calculation
                    totalAmount = totalAmount - couponData.calculation
                } else if (couponData.calc_type === 'PERCENTAGE') {
                    subtotal =
                        subtotal - subtotal * (couponData.calculation / 100)
                    totalAmount =
                        totalAmount -
                        totalAmount * (couponData.calculation / 100)
                }
            }
            res.render('users/checkout', {
                cartProducts,
                subtotal,
                totalAmount,
                addressData,
                userData,
            })
        }
    } catch (error) {
        console.log('error:', error.message)
    }
}
//load razorpay payment get
const loadRazor = async (req, res) => {
    try {
        const user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
            res.render('users/payment')
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: 'Something went wrong!' })
    }
}
//load razorpay payment post
const addRazor = async (req, res) => {
    try {
        const user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
            const { totalAmount, option } = req.body

            const options = {
                amount: totalAmount * 100,
                currency: 'INR',
            }
            console.log(options)
            instance.orders.create(options, (err, order) => {
                if (!err) {
                    res.status(200).json({
                        success: true,
                        msg: 'Order Created',
                        amount: totalAmount * 100,
                        key_id: process.env.RAZOR_KEY_ID,
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        msg: 'Something went wrong!',
                    })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
}

//load stripe payment gateway
const loadStripe = async (req, res) => {
    try {
        const user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
            res.render('users/stripe1', {
                key: process.env.PUBLISHABLE_API,
            })
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}
//post method stripe
const createStripe = async (req, res) => {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 400,
        currency: 'inr',
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
            enabled: true,
        },
    })

    res.send({
        clientSecret: paymentIntent.client_secret,
    })
}

//add fund to wallet
const addFund = async (req, res) => {
    try {
        const user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
            const { amount, page } = req.query
            res.render('users/stripe', {
                key: process.env.PUBLISHABLE_API,
                amount,
                page,
            })
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}

//load wallet
const loadWallet = async (req, res) => {
    try {
        user_id = req.session.user_id

        if (!user_id) {
            res.redirect('/')
        } else {
            let newBalance, flag
            const { option, totalAmount } = req.query
            const userData = await UserModel.findById({ _id: user_id })

            if (userData.wallet >= totalAmount) {
                newBalance = userData.wallet - totalAmount
                flag = 0
            } else {
                newBalance = totalAmount - userData.wallet
                flag = 1
            }
            res.render('users/wallet', {
                userData,
                totalAmount,
                newBalance,
                flag,
                option,
            })
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}
// Call the loadOrderComplete function and pass the order object

const loadOrderComplete = async (req, res) => {
    try {
        const user_id = req.session.user_id
        if (!user_id) {
            res.redirect('/')
        } else {
            const { option, totalAmount } = req.query
            const addressData = await AddressModel.findOne({ user_id: user_id })
            const cartData = await CartModel.find({ user_id: user_id })
            const userData = await UserModel.findById({ _id: user_id })
            let order_no = await OrderModel.countDocuments({})
            order_no++
            var payment, wallet, payment_balance, pay_status
            if (option) {
                switch (option) {
                    case 'option6':
                        payment = 'Cash on Delivery'
                        payment_balance = totalAmount
                        wallet = userData.wallet
                        pay_status = 'Not Paid'
                        break
                    case 'option7':
                        payment = 'Prepaid using Wallet Balance'
                        wallet = req.query.wallet
                        payment_balance = 0
                        pay_status = 'Paid'
                        break
                    case 'option76':
                        payment = ' Wallet Balance + Cash on delivery'
                        wallet = 0
                        payment_balance = req.query.wallet
                        pay_status = 'Not paid'
                        break

                    case 'option78':
                        payment = 'Prepaid using Wallet Balance'
                        wallet = req.query.wallet
                        payment_balance = 0
                        pay_status = 'Paid'
                        break

                    case 'option8':
                        payment = 'Prepaid using Razorpay'
                        payment_balance = 0
                        pay_status = 'Paid'
                        break
                }
                console.log('payment:', payment)
                console.log('payment_balance:', payment_balance)
                console.log('pay_status:', pay_status)
            }

            // Function to convert cart items to order items
            async function convertCartToOrderItems(cartData) {
                const orderItemsPromises = cartData.map(async (cartItem) => {
                    const productData = await productModel.findById({
                        _id: cartItem.product_id,
                    })

                    return {
                        product_id: cartItem.product_id,
                        productname: productData.productname,
                        productprice: productData.price,
                        user_id: cartItem.user_id,
                        quantity: cartItem.cart_quantity,
                        // Other fields you want to include in the order item
                    }
                })

                return await Promise.all(orderItemsPromises)
            }

            // Function to create an order based on cart data
            async function createOrderFromCart(cartData, pdfFileName) {
                try {
                    console.log('Received pdfFilePath:', pdfFileName)
                    // Convert cart items to order items
                    const orderItemsPromises =
                        await convertCartToOrderItems(cartData)
                    // Create a new order with the order items
                    const order = new OrderModel({
                        order_no: order_no,
                        username: userData.email,
                        payment_mode: payment,
                        order_total: totalAmount,
                        payment_balance: payment_balance,
                        payment_status: pay_status,
                        items: orderItemsPromises,
                        invoice: pdfFileName,
                    })

                    // Save the order to the database
                    await order.save()

                    return order
                } catch (error) {
                    console.log('Error creating order:', error)
                     // Rethrow the error for higher-level error handling
                }
            }

            console.log('invoice')
            // Generate a unique invoice number (you can replace this with your own logic).
            const invoiceNumber = generateUniqueInvoiceNumber() // Implement this function as needed.
            var orderItemsPromises = await convertCartToOrderItems(cartData)

            // Define the filename for the PDF (e.g., using the invoice number).
            const pdfFileName = `invoice_${invoiceNumber}.pdf`
            const products = []

            // Loop through orderedItems and create product objects
            for (const orderedItem of orderItemsPromises) {
                const product = {
                    quantity: orderedItem.quantity,
                    description: orderedItem.productname, // Assuming you want to use the product name as the description
                    'tax-rate': 0, // You can set the tax rate as needed
                    price: orderedItem.productprice, // Use the product price from orderedItem
                }

                products.push(product)
            }

            var data = {
                // Customize enables you to provide your own templates
                // Please review the documentation for instructions and examples
                customize: {
                    //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
                },
                images: {
                    // The logo on top of your invoice
                    logo: 'https://public.easyinvoice.cloud/img/logo_en_original.png',
                    // The invoice background
                    background:
                        'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
                },
                // Your own data
                sender: {
                    company: 'Sample Corp',
                    address: 'Sample Street 123',
                    zip: '1234 AB',
                    city: 'Sampletown',
                    country: 'Samplecountry',
                    //"custom1": "custom value 1",
                    //"custom2": "custom value 2",
                    //"custom3": "custom value 3"
                },
                // Your recipient
                client: {
                    company: userData.name,
                    address: addressData.address1 ,
                    zip: addressData.pin,
                    city: addressData.city ,
                    country: 'India',
                    // "custom1": "custom value 1",
                    // "custom2": "custom value 2",
                    // "custom3": "custom value 3"
                },
                information: {
                    // Invoice number
                    number: invoiceNumber,
                    // Invoice data
                    date: formattedCurrentDate,
                    // Invoice due date
                    'due-date': formattedDueDate,
                },
                // The products you would like to see on your invoice
                // Total values are being calculated automatically
                products: products,
                // The message you would like to display on the bottom of your invoice
                'bottom-notice': 'Kindly pay your invoice within 15 days.',
                // Settings to customize your invoice
                settings: {
                    currency: 'USD', // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
                    // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
                    // "margin-top": 25, // Defaults to '25'
                    // "margin-right": 25, // Defaults to '25'
                    // "margin-left": 25, // Defaults to '25'
                    // "margin-bottom": 25, // Defaults to '25'
                    // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
                    // "height": "1000px", // allowed units: mm, cm, in, px
                    // "width": "500px", // allowed units: mm, cm, in, px
                    // "orientation": "landscape", // portrait or landscape, defaults to portrait
                },
            }

          easyInvoice.createInvoice(data, async function (result) {
                try {
                    console.log("rsult",result)
                    if (result.pdf) {
                        const pdfFilePath = path.join(invoicesFolderPath, pdfFileName);
                        await fs.writeFileSync(pdfFilePath, result.pdf, 'base64');
                        console.log('PDF file saved successfully.');
                    } else {
                        console.error('PDF generation failed.');
                    }
                } catch (error) {
                    console.error('Error writing PDF file:', error);
                }
            });
            
            
            

            // Call the function to create an order from cart data
             await createOrderFromCart(
                cartData,
                pdfFileName
            )

            // Update product quantities
           // await updateProductQuantities(createdOrder)

            // async function updateProductQuantities(createdOrder) {
            //     try {
            //         for (const item of createdOrder.items) {
            //             const product_id = item.product_id
            //             const purchasedQuantity = item.quantity
            //             const productData =
            //                 await productModel.findById(product_id)
            //             if (productData) {
            //                 productData.quantity -= purchasedQuantity
            //                 await productData.save()
            //             }
            //         }
            //         console.log('Product quantities updated successfully.')
            //     } catch (error) {
            //         console.error(
            //             'Error updating product quantities:',
            //             error.message
            //         )
            //     }
            // }

            // Update the user's wallet balance
            await UserModel.findByIdAndUpdate(
                { _id: user_id },
                { $set: { wallet_balance: wallet } }
            )

            // Clear the user's cart
            await CartModel.deleteMany({ user_id: user_id })

            // Render the order complete page
            res.render('users/order-complete')
        }
    } catch (error) {
        console.error('Error:', error)
        // Handle the error gracefully, e.g., show an error page or redirect to an error page
        res.status(500).send('Internal Server Error')
    }
}
//load dashboard
const loadDashboard = async (req, res) => {
    try {
        const user_id = req.session.user_id
        
        const cartCount = await CartModel.countDocuments({ user_id: user_id })
        const cartProducts = await fetchCartProducts(user_id)
        const subtotal = await calculateSubtotal(cartProducts)
        const userData = await UserModel.findById({ _id: req.session.user_id })
        const addressData = await AddressModel.find({ user_id: user_id })
       const couponData =await CouponModel.find({});
       var page = 1;
                    
       if(req.query.page){
           page =req.query.page;
       }
       
       const limit = 9;
       const orderData = await OrderModel.find({ username: userData.email ,
         
       })
       .limit(limit*1)
       .skip((page-1)*limit)
       .exec();

       const count = await OrderModel.find({username: userData.email ,
        
       }).countDocuments();
        res.render('users/dashboard', {
            user: userData,
            orders: orderData,
            addressData,
            cartCount,
            cartProducts,
            subtotal,
            totalPages:Math.ceil(count/limit),
                        currentPage:page,
                        nextPage:page++,
            coupons:couponData
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    guestLoad,
    loadRegister,
    loadCheckUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    loadDashboard,
    userLogout,
    forgetLoad,
    forgetVerify,
    resetPasswordMail,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerifyLink,
    editLoad,
    updateProfile,
    loadOtp,
    resendOtp,
    verifyOtp,
    loadViewProduct,
    addCart,
    viewCart,
    cartUpdate,
    loadCouponCalc,
    removeFromCart,
    loadCheckout,
    loadStripe,
    addFund,
    loadWallet,
    loadOrderComplete,
    createStripe,
    loadRazor,
    addRazor,
}
