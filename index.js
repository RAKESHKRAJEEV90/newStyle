const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const app = express()

app.use(cors())

const path = require('path')
require('dotenv').config()
mongoose
    .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.error('Error Connecting to MongoDB :', error)
    })

//load static assets
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//view engine

app.set('view engine', 'ejs')
app.set('views', './views/')

//for user route
const userRoute = require('./routes/userRoutes')
app.use('/', userRoute)
//for admin route
const adminRoute = require('./routes/adminRoutes')
app.use('/admin', adminRoute)
//for api routes
const apiRoute = require('./routes/apiRoutes')
app.use('/api', apiRoute)

app.get('*', function (req, res) {
    res.redirect('/')
})

const port = process.env.PORT || 3001

app.listen(port, function () {
    console.log('Server is running port http://localhost:'+ port)
})
