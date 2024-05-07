const express = require("express");
const app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("Socket is running");

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log('Connected: ' + socket.id);

    socket.on('draw', drawing);

    function drawing(data) {
        socket.broadcast.emit('draw', data)
    }
}