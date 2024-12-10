const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/room/:id', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Hàm t?o mã 4 ch? s? ng?u nhiên
function generateRoomId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('createRoom', () => {
        const roomId = generateRoomId();
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        if (io.sockets.adapter.rooms.has(roomId)) {
            socket.join(roomId);
            socket.emit('roomJoined', roomId);
        } else {
            socket.emit('error', 'Room not found');
        }
    });

    socket.on('chat message', ({ roomId, msg }) => {
        io.to(roomId).emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});