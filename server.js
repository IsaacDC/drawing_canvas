const express = require("express");
const session = require("express-session");
const socket = require("socket.io");
const { v4: uuidv4 } = require("uuid");
// const cookieParser = require("cooker-parser");

const { createServer } = require("node:http");
const { join } = require("node:path");

const app = express();
const server = createServer(app);
const io = socket(server, { connectionStateRecovery: {} });

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    genid: (req) => uuidv4(),
  })
);
app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.session.genid);
  req.session.visited = true;
  res.sendFile(join(__dirname, "index.html"));
});

const db = require("./db");

const clients = {};

io.on("connection", (socket) => {
  console.log("A user connected");
  clients[socket.id] = "#000000";

  db.getAllDrawingData((drawingData) => {
    socket.emit("loadDrawingData", drawingData, clients);
  });

  // start drawing event
  socket.on("startDrawing", ({ x, y }) => {
    const data = { type: "start", x, y, color: clients[socket.id] };
    db.insertDrawingData(data);
    socket.broadcast.emit("startDrawing", { x, y, color: clients[socket.id] });
  });

  // drawing event
  socket.on("draw", ({ x, y }) => {
    const data = { type: "draw", x, y, color: clients[socket.id] };
    db.insertDrawingData(data);
    socket.broadcast.emit("draw", { x, y, color: clients[socket.id] });
  });

  // stop drawing event
  socket.on("stopDrawing", () => {
    const data = { type: "stop" };
    db.insertDrawingData(data);
    socket.broadcast.emit("stopDrawing");
  });

  // change stroke color event
  socket.on("changeStrokeColor", (color) => {
    clients[socket.id] = color;
    socket.broadcast.emit("changeStrokeColor", { socketId: socket.id, color });
  });

  // disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete clients[socket.id];
  });
});

server.listen(3000, () => {
  console.log("server running at http://127.0.0.1:3000");
});
