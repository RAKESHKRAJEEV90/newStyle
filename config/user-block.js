// Admin client-side code (admin.js)

const socket = io()

socket.on('connect', () => {
    console.log('Connected to WebSocket server')
})

socket.on('user-blocked', (message) => {
    alert(message)
    // You can also update the UI to handle the blocked state as needed.
})

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server')
})

console.log('blocked')
