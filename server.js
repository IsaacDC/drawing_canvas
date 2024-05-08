const express = require("express");
const app = express();
var server = app.listen(3000);
const socket = require('socket.io');
const io = socket(server);

app.use(express.static('public'));

console.log("Socket is running");

let connections = [];

io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    socket.on('draw', (data) => {
        connections.forEach(con =>{
            if(con.id !== socket.id){
                con.emit('ondraw', {x : data.x, y: data.y})
            }
        });
    });

    socket.on('down', (data) =>{
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('ondown', {x : data.x, y : data.y})
            }
        })
    })

    socket.on("disconnect", (reason) =>{
        console.log(`${socket.id} has disconnected`);
        connections = connections.filter((con) => con.id !== socket.id);
    });
});