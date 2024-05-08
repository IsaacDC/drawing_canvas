const express = require("express");
const app = express();
var server = app.listen(3000);
app.use(express.static('public'));

console.log("Socket is running");

var socket = require('socket.io');
var io = socket(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle start drawing event
  socket.on('startDrawing', ({ x, y }) => {
    socket.broadcast.emit('startDrawing', { x, y });
  });

  // Handle drawing event
  socket.on('draw', ({ x, y }) => {
    socket.broadcast.emit('draw', { x, y });
  });

  // Handle stop drawing event
  socket.on('stopDrawing', () => {
    socket.broadcast.emit('stopDrawing');
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});