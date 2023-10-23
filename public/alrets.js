// alerts.js
const alerts = {
    displayAlert(status, message) {
        console.log('responseData:', { status, message })

        if (status === 200) {
            // If success, display a success alert and redirect
            this.success(message)
            window.location.href = '/home'
        } else if (status === 401) {
            // Handle unauthorized access
            if (message === 'Please verify your Email') {
                this.warning(message)
            } else if (message === 'Wrong Password') {
                this.error(message)
            } else if (message === 'Wrong Email and Password') {
                this.error(message)
            } else {
                // Handle any other 401 errors
                this.error('An error occurred')
            }
        } else if (status === 402) {
            // Handle custom status code 402
            this.error(message)
        } else {
            // Handle other status codes
            this.error('An error occurred')
        }
    },
    success(message) {
        swal('Success!', message, 'success')
    },
    error(message) {
        swal('Error!', message, 'error')
    },
    warning(message) {
        swal('Warning!', message, 'warning')
    },
    info(message) {
        swal('Info', message, 'info')
    },
    // Add more alert types and customizations as needed
}

module.exports = alerts
