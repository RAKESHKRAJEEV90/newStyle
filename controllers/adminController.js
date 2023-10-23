const CategoryModel = require('../models/products/categoryModel')
const ProductModel = require('../models/products/productModel')
const User = require('../models/userModels/userModel')
const bcrypt = require('bcrypt')
const UserModel = require('../models/userModels/userModel')
const AddressModel = require('../models/userModels/addressModel')
const CartModel = require('../models/products/cartModel')
const OrderModel = require('../models/products/orderModels')
const CouponModel = require('../models/products/couponModel')
const axios = require('axios')
const exceljs = require('exceljs')
//html to pdf convert requirements

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const io = require('socket.io')() // Import the initialized socket.io instance

//admin login
const loadLogin = async (req, res) => {
    try {
        res.render('admin/login')
    } catch (error) {
        console.log(error.message)
    }
}
//verify login, login post method
const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(
                password,
                userData.password
            )

            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('admin/login', {
                        message: 'You are not an admin',
                    })
                } else {
                    req.session.admin_id = userData._id
                    res.redirect('admin/home')
                }
            } else {
                res.render('admin/login', { message: 'Password is incorrect' })
            }
        } else {
            res.render('admin/login', {
                message: 'Email and password is incorrect',
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}
//admin home, get home
const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.admin_id })
        if (userData.is_admin === 1) {
            const orderData = await OrderModel.find({})
            // Calculate the sum of all order_total values
            let totalOrderAmount = orderData.reduce((total, order) => {
                if (
                    order.order_total !== undefined &&
                    !isNaN(order.order_total)
                ) {
                    return total + order.order_total
                }
                return total
            }, 0)
            totalOrderAmount = totalOrderAmount / 1000

            // Function to calculate the total for a specific status
            function calculateTotalForStatus(status) {
                return orderData
                    .filter((order) => order.order_status === status) // Filter orders by status
                    .reduce((total, order) => {
                        if (
                            order.order_total !== undefined &&
                            !isNaN(order.order_total)
                        ) {
                            return total + order.order_total
                        }
                        return total
                    }, 0)
            }

            let processingTotal = calculateTotalForStatus('Processing')
            let shippedTotal = calculateTotalForStatus('Shipped')
            let deliveredTotal = calculateTotalForStatus('Delivered')
            let cancelledTotal = calculateTotalForStatus('Cancelled')
            processingTotal /= 1000
            shippedTotal /= 1000
            deliveredTotal /= 1000
            cancelledTotal /= 1000

            // Get the current date
            const currentDate = new Date()

            // Set the start of the day (midnight)
            currentDate.setHours(0, 0, 0, 0)

            // Set the end of the day (23:59:59)
            const endOfDay = new Date(currentDate)
            endOfDay.setHours(23, 59, 59, 999)
            var todaysTotal
            // Find orders placed between the start and end of the current day
            OrderModel.find({
                orderDate: {
                    $gte: currentDate,
                    $lte: endOfDay,
                },
            })
                .then((todaysOrders) => {
                    if (todaysOrders.length > 0) {
                        // Calculate the total order amount for today's orders
                        todaysTotal = todaysOrders.reduce((total, order) => {
                            if (
                                order.order_total !== undefined &&
                                !isNaN(order.order_total)
                            ) {
                                return total + parseFloat(order.order_total)
                            }
                            return total
                        }, 0)
                        console.log("Today's Total Order Amount:", todaysTotal)
                    } else {
                        todaysTotal = 0
                    }
                    todaysTotal /= 1000
                    res.render('admin/home', {
                        admin: userData,
                        order: orderData,
                        totalOrderAmount,
                        processingTotal,
                        shippedTotal,
                        deliveredTotal,
                        cancelledTotal,
                        todaysTotal,
                    })
                })
                .catch((error) => {
                    console.error("Error fetching today's orders:", error)
                })
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//load userList
const loadUserList = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })
        const userData = await User.find({ is_admin: 0 })
        res.render('admin/userList', { user: userData, admin: adminData })
    } catch (error) {
        console.log(error.message)
    }
}
//add-user pageload
const addUser = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })
        res.render('admin/add-user', { admin: adminData })
    } catch (error) {
        console.log(error.message)
    }
}
//edit user
const editUser = async (req, res) => {
    try {
        const id = req.query.id
        const adminData = await User.findById({ _id: req.session.admin_id })
        const userData = await User.findById({ _id: id })
        if (userData) {
            res.render('admin/edit-user', { user: userData, admin: adminData })
        } else {
            res.redirect('admin/user-list')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//delete user
const deleteUser = async (req, res) => {
    try {
        const user_id = req.query.id

        await UserModel.findByIdAndDelete({ _id: user_id })
        res.redirect('/admin/user-list')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Sever Error')
    }
}
//block user
const blockUser = async (req, res) => {
    try {
        const userId = req.params.userId
        let newStatus = req.body.status // 'Active' or 'Inactive'
        if (newStatus === 'Active') {
            newStatus = 0
        } else {
            newStatus = 1
        }

        // Update the user's is_blocked status in the database
        await UserModel.findByIdAndUpdate(
            { _id: userId },
            { $set: { is_blocked: newStatus } }
        )
        // Emit a status change event to notify online users
        if (newStatus === 1) {
            // When an admin blocks a user
            io.to(`user-${userId}`).emit(
                'user-blocked',
                'You have been blocked by the admin.'
            )
        }
        // Respond with a success message
        res.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ success: false, error: 'Internal Server Error' })
    }
}
//category section starts here

//load add category
const loadAddCategory = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })

        res.render('admin/add-category', { admin: adminData })
    } catch (error) {
        console.log(error.message)
    }
}
//add category post method
const addCategory = async (req, res) => {
    try {
        user_id = req.session.admin_id
        if (!user_id) {
            res.redirect('/admin')
        }else{
        const { ctname, desc } = req.body
        let image
        if (req.file) {
            image = req.file.filename
        } else {
            image = src = '01.png'
        }

        const checkCategory = await CategoryModel.findOne({ category:ctname })
        if (checkCategory) {
            res.status(400).json({
                status: 400,
                message: 'Category already exists.',
            })
        } else {
            const category = new CategoryModel({
                category: ctname,
                image: image,
                discription: desc,
                is_active: true,
            })
            await category.save()
    
            res.status(200).json({
                status: 200,
                message: 'Category Saved Successfully',
            })
        }
    }
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, message: 'Internal server error' })
    }
}
//list categories
const listCategory = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })
        const categoryData = await CategoryModel.find({})
        res.render('admin/list-category', {
            admin: adminData,
            category: categoryData,
        })
    } catch (error) {
        console.log(error.message)
    }
}

//update category status
// const updateCategoryStatus = async(req,res)=>{
//     try {
// Retrieve categoryId and new status from the request body
//   const { category_id, status } = req.body;
//   console.log(category_id,status)
//    // Check if category_id is a valid ObjectId (assuming you are using MongoDB)
//    if (!isValidObjectId(category_id)) {
//     return res.status(400).json({ success: false, message: 'Invalid category ID' });
//   }
//   console.log('Update category status route called');

// Perform the database update based on categoryId and status
//    const result=await categoryModel.updateOne({_id:category_id},{$set:{is_active:status}});

//     } catch (error) {
//         console.log(error.message);
//     }

// }
//edit category get method
const loadEditCategory = async (req, res) => {
    try {
        const category_id = req.query.id
        const adminData = await User.findById({ _id: req.session.admin_id })

        const categoryData = await CategoryModel.findById({ _id: category_id })
        if (categoryData) {
            res.render('admin/edit-category', {
                category: categoryData,
                admin: adminData,
            })
        } else {
            res.redirect('admin/list-category')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//update category post method
const updateCategory = async (req, res) => {
    try {
        const { ctname, desc } = req.body
        const image = req.file.filename
        const category_id = req.query.id
        const adminData = await User.findById({ _id: req.session.admin_id })

        const categoryData = await CategoryModel.findOneAndUpdate(
            { _id: category_id },
            { $set: { image: image, category: ctname, discription: desc } }
        )

        if (!categoryData) {
            // Handle the case where categoryData is not found
            return res.status(404).send('Category not found')
        }

        res.redirect('/admin/list-category')
    } catch (error) {
        console.error('Error:', error.message)
        res.status(500).send('Internal Server Error')
    }
}
//delete category post method
const deleteCategory = async (req, res) => {
    try {
        const category_id = req.query.id

        await CategoryModel.findByIdAndDelete({ _id: category_id })
        res.redirect('/admin/list-category')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Sever Error')
    }
}

//load add products page
const loadAddProduct = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })
        const categoryData = await CategoryModel.find({})

        res.render('admin/add-product', {
            admin: adminData,
            category: categoryData,
        })
    } catch (error) {
        console.log(error.message)
    }
}
//add product
const addProduct = async (req, res) => {
    try {
        const { pcode, pname, cname, category_id, quantity, price } = req.body
        const images = req.files
        const imageFilenames = images.map((image) => image.filename)

        const adminData = await User.findById({ _id: req.session.admin_id })

        const categoryData = await CategoryModel.findById({
            _id: req.body.category_id,
        })

        const checkProduct = await ProductModel.findOne({ pcode: pcode })

        if (checkProduct) {
            res.render('admin/add-product', {
                message: 'Product already exist',
                admin: adminData,
                category: categoryData,
            })
        } else {
            const product = new ProductModel({
                productcode: pcode,
                productname: pname,
                price: price,
                category_id: category_id,
                category_name: categoryData.category,
                image: imageFilenames,
                quantity: quantity,

                is_active: true,
            })

            const productData = await product.save()
            res.render('admin/add-product', {
                message: 'product Saved Successfully',
                admin: adminData,
                category: categoryData,
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}
//list products
const listProduct = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })
        const productData = await ProductModel.find({})
        res.render('admin/list-product', {
            admin: adminData,
            product: productData,
        })
    } catch (error) {
        console.log(error.message)
    }
}
//view product details
const viewProduct = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })
        res.render('admin/product-details', { admin: adminData })
    } catch (error) {
        console.log(error.message)
    }
}
//edit product get method
const loadEditProduct = async (req, res) => {
    try {
        const product_id = req.query.id
        const adminData = await User.findById({ _id: req.session.admin_id })

        const productData = await ProductModel.findById({ _id: product_id })
        const categoryData = await CategoryModel.find({})

        if (productData) {
            res.render('admin/edit-product', {
                product: productData,
                admin: adminData,
                category: categoryData,
            })
        } else {
            res.redirect('admin/list-product')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//update product post method
const updateProduct = async (req, res) => {
    try {
        const categoryData = await CategoryModel.findById({
            _id: req.body.category_id,
        })

        const { pcode, pname, small, medium, large, price } = req.body
        const image = req.file.filename
        const product_id = req.query.id
        const adminData = await User.findById({ _id: req.session.admin_id })

        const category = categoryData.category

        const productData = await ProductModel.findOneAndUpdate(
            { _id: product_id },
            {
                $set: {
                    image: image,
                    category_name: category,
                    productcode: pcode,
                    productname: pname,
                    category_id: categoryData._id,
                    quantity: quantity,
                    price: price,
                },
            }
        )

        if (!productData) {
            // Handle the case where categoryData is not found
            return res.status(404).send('Category not found')
        }

        res.redirect('/admin/list-product')
    } catch (error) {
        console.error('Error:', error.message)
        res.status(500).send('Internal Server Error')
    }
}
//delete product post method
const deleteProduct = async (req, res) => {
    try {
        const product_id = req.query.id

        await ProductModel.findByIdAndDelete({ _id: product_id })
        res.redirect('/admin/list-product')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Sever Error')
    }
}
//load list Order page
const loadListOrders = async (req, res) => {
    try {
        user_id = req.session.admin_id
        if (!user_id) {
            res.render('/admin')
        } else {
            const adminData = await User.findById({ _id: req.session.admin_id })
            const orderData = await OrderModel.find({})

            res.render('admin/list-orders', {
                admin: adminData,
                orders: orderData,
            })
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
}

//reference table for creating new Coupon
const loadReference = async (req, res) => {
    try {
        const adminData = await User.findById({ _id: req.session.admin_id })

        res.render('admin/coupon', { admin: adminData })
    } catch (error) {
        console.log(error.message)
    }
}

//add coupon post method
const addCoupon = async (req, res) => {
    try {
        const user_id = req.session.admin_id
        if (!user_id) {
            res.redirect('/admin')
        } else {
            const { pname, pcode, cname, quantity, price, type } = req.body
            const adminData = await User.findById({ _id: req.session.admin_id })
            const checkCoupon = await CouponModel.findOne({
                coupon_code: pcode,
            })
            if (checkCoupon) {
                res.render('admin/coupon', {
                    admin: adminData,
                    message: 'Coupon already exist',
                })
            } else {
                const newCoupon = new CouponModel({
                    coupon_code: pcode,
                    calculation: pname,
                    calc_type: type,
                    coupon_desc: cname,
                    coupon_price: price,
                    coupon_quantity: quantity,
                    coupon_active: true,
                })
                const couponData = await newCoupon.save()
                res.render('admin/coupon', {
                    admin: adminData,
                    message: 'Coupon Saved Successfully',
                })
            }
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}
const couponStatus = async (req, res) => {
    try {
        const { coupon_id, currentStatus } = req.body
        if (currentStatus == 'active') {
            await CouponModel.findByIdAndUpdate(
                { _id: coupon_id },
                { $set: { coupon_active: false } }
            )
        } else {
            await CouponModel.findByIdAndUpdate(
                { _id: coupon_id },
                { $set: { coupon_active: true } }
            )
        }
        res.json({ message: 'status updated successfully' })
    } catch (error) {
        res(500).json({ error: 'internal Server Error' })
    }
}
//show list coupon
const listCoupon = async (req, res) => {
    try {
        const user_id = req.session.admin_id
        if (!user_id) {
            res.redirect('/admin')
        } else {
            const adminData = await User.findById({ _id: req.session.admin_id })

            const couponData = await CouponModel.find({})
            res.render('admin/coupon_list', {
                admin: adminData,
                coupon: couponData,
            })
        }
    } catch (error) {
        res.status(500), send(error.message)
    }
}
//logout
const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

const loadSalesReport = async (req, res) => {
    try {
        user_id = req.session.admin_id
        if (!user_id) {
            res.render('/admin')
        } else {
            const adminData = await User.findById({ _id: req.session.admin_id })
            const orderData = await OrderModel.find({})

            res.render('admin/sales-report', {
                admin: adminData,
                orders: orderData,
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Errror' })
    }
}
const loadXlsReport = async (req, res) => {
    try {
        const workbook = new exceljs.Workbook()
        const worksheet = workbook.addWorksheet('Sales Report')
        worksheet.columns = [
            { header: 'Slno.', key: 's_no' },
            { header: 'OrderNo', key: 'order_no' },
            { header: 'Name', key: 'username' },
            { header: 'Date', key: 'orderDate' },
            { header: 'Total', key: 'order_total' },
            { header: 'Status', key: 'order_status' },
        ]
        let counter = 1
        const orderData = await OrderModel.find({})
        orderData.forEach((order) => {
            order.s_no = counter
            worksheet.addRow(order)
            counter++
        })
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true }
        })
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader('Content-Disposition', `attachment;filename=orders.xlsx`)
        return workbook.xlsx.write(res).then(() => {
            res.status(200)
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
const loadPdfReport = async (req, res) => {
    try {
        var pdfFolderPath = path.join(__dirname, '..', 'public', 'reports')

        const orderData = await OrderModel.find({})

        const data = {
            orders: orderData,
        }
        const filePathName = path.resolve(
            __dirname,
            '../views/admin/report-pdf.ejs'
        )
        const htmlString = fs.readFileSync(filePathName).toString()

        // Ensure the directory exists
        if (!fs.existsSync(pdfFolderPath)) {
            fs.mkdirSync(pdfFolderPath, { recursive: true })
        }
        const browser = await puppeteer.launch({ headless: 'new' })

        const page = await browser.newPage()
        //set content for the page
        await page.setContent(ejs.render(htmlString, data))
        //generate pdf
        const pdfBuffer = await page.pdf({ format: 'A4' })
        //close the browser
        await browser.close()
        //save the pdf to a file or send it as response
        const pdfPath = path.join(pdfFolderPath, 'orders.pdf')
        fs.writeFileSync(pdfPath, pdfBuffer)
        res.download(pdfPath, 'orders.pdf', (err) => {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Internal Server Error' })
            }
        })

        // res.render('admin/report-pdf',{orders:orderData})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'INternal Server Error' })
    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    loadUserList,
    addUser,
    editUser,
    deleteUser,
    blockUser,
    loadAddCategory,
    addCategory,
    listCategory,
    //updateCategoryStatus,
    loadEditCategory,
    updateCategory,
    deleteCategory,
    loadAddProduct,
    addProduct,
    listProduct,
    viewProduct,
    loadEditProduct,
    updateProduct,
    deleteProduct,
    loadListOrders,
    // paymentMode,
    loadReference,
    addCoupon,
    listCoupon,
    couponStatus,
    logout,
    loadSalesReport,
    loadXlsReport,
    loadPdfReport,
}
