const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require('socket.io')(server)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
	console.log('Client connected: ' + socket.id)

	socket.on('mouse', (data) => socket.broadcast.emit('mouse', data))

	socket.on('disconnect', () => console.log('Client has disconnected'))
})

