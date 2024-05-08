const express = require("express");
const app = express();
var server = app.listen(3000);
app.use(express.static('public'));
console.log("Socket is running");

var socket = require('socket.io');
var io = socket(server);

var drawingData = [];
const clients = {};

io.on('connection', (socket) => {
    console.log('A user connected');
    clients[socket.id] = '#000000';

    socket.emit('loadDrawingData', drawingData, clients);

    // start drawing event
    socket.on('startDrawing', ({ x, y }) => {
        drawingData.push({ type: 'start', x, y, color: clients[socket.id] });
        socket.broadcast.emit('startDrawing', { x, y, color: clients[socket.id] });
    });

    // drawing event
    socket.on('draw', ({ x, y }) => {
        drawingData.push({ type: 'draw', x, y, color: clients[socket.id] });
        socket.broadcast.emit('draw', { x, y, color: clients[socket.id] });
    });

    // stop drawing event
    socket.on('stopDrawing', () => {
        drawingData.push({ type: 'stop' });
        socket.broadcast.emit('stopDrawing');
    });

    // change stroke color event
    socket.on('changeStrokeColor', (color) => {
        clients[socket.id] = color;
        socket.broadcast.emit('changeStrokeColor', { socketId: socket.id, color });
    });

    // disconnect event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete clients[socket.id];
    });
});