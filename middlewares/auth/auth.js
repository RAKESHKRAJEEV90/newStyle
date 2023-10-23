const UserModel = require('../../models/userModels/userModel')
const Swal = require('sweetalert2')

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next()
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}
const checkUser = async (req, res, next) => {
    try {
        const user_id = req.session.user_id
        const userData = await UserModel.findById({ _id: user_id })

        if (userData && userData.is_blocked === 1) {
            res.status(402).json({
                status: 402,
                message: 'You are Blocked By Admin',
            })
        } else {
            next()
        }
    } catch (error) {
        console.error(error.message)
        // Handle the error gracefully, e.g., by sending an HTTP 500 response.
        res.status(500).send('Internal Server Error')
    }
}

module.exports = {
    isLogin,
    isLogout,
    checkUser,
}
