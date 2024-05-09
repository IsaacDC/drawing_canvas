const express = require("express");
const app = express();
var server = app.listen(3000);
app.use(express.static('public'));
console.log("Socket is running");

const socket = require('socket.io');
const io = socket(server);
const db = require('./db');

const clients = {};

io.on('connection', (socket) => {
    console.log('A user connected');
    clients[socket.id] = '#000000';

    db.getAllDrawingData((drawingData) => {
        socket.emit('loadDrawingData', drawingData, clients);
      });

    // start drawing event
    socket.on('startDrawing', ({ x, y }) => {
        const data = { type: 'start', x, y, color: clients[socket.id] };
        db.insertDrawingData(data);
        socket.broadcast.emit('startDrawing', { x, y, color: clients[socket.id] });
      });

    // drawing event
    socket.on('draw', ({ x, y }) => {
        const data = { type: 'draw', x, y, color: clients[socket.id] };
        db.insertDrawingData(data);
        socket.broadcast.emit('draw', { x, y, color: clients[socket.id] });
      });

    // stop drawing event
    socket.on('stopDrawing', () => {
        const data = { type: 'stop' };
        db.insertDrawingData(data);
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