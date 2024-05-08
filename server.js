const express = require("express");
const app = express();
var server = app.listen(3000);
app.use(express.static('public'));
console.log("Socket is running");

var socket = require('socket.io');
var io = socket(server);

var drawingData = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('loadDrawingData', drawingData);

  // start drawing event
  socket.on('startDrawing', ({ x, y }) => {
    drawingData.push({ type: 'start', x, y });
    socket.broadcast.emit('startDrawing', { x, y });
  });

  // drawing event
  socket.on('draw', ({ x, y }) => {
    drawingData.push({ type: 'draw', x, y });
    socket.broadcast.emit('draw', { x, y });
  });

  // stop drawing event
  socket.on('stopDrawing', () => {
    drawingData.push({ type: 'stop' });
    socket.broadcast.emit('stopDrawing');
  });

  // disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});