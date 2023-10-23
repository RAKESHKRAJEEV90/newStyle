const crypto = require('crypto')

// Generate a random session secret
const adminSessionSecret = crypto.randomBytes(32).toString('hex')
const sessionSecret = crypto.randomBytes(32).toString('hex')

const mailPassword = 'nyofiayeuzhxnnqg'
const mailUsername = 'topingrk@gmail.com'
module.exports = {
    sessionSecret,
    adminSessionSecret,
    mailPassword,
    mailUsername,
}
