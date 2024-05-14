const express = require("express");
const session = require("express-session");
const socket = require("socket.io");
const { v4: uuidv4 } = require("uuid");

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
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    genid: (req) => uuidv4(),
  })
);
app.use(express.static("public"));
app.get("/", (req, res) => {
  db.getSessionID(req.session.id, (row) => {
    if (row) {
      console.log("Session ID:", req.session.id);
    } else {
      db.insertUserData(req.session.id, "#000000");
      console.log("Welcome to this page for the first time!");
    }
    res.sendFile(join(__dirname, "index.html"));
  });
});

const db = require("./db");

io.on("connection", (socket) => {
  console.log(socket.id + " connected");

  db.insertUserData(socket.handshake.sessionID, '#000000');

  db.getAllDrawingData((drawingData) => {
    socket.emit("loadDrawingData", drawingData);
  });

  // start drawing event
  socket.on("startDrawing", ({ x, y }) => {
    db.getUserStrokeColor(socket.handshake.sessionID, (color) => {
      const data = { type: "start", x, y, color };
      db.insertDrawingData(socket.handshake.sessionID, data);
      socket.broadcast.emit("startDrawing", { x, y, color });
    });
  });

  // drawing event
  socket.on("draw", ({ x, y }) => {
    db.getUserStrokeColor(socket.handshake.sessionID, (color) => {
      const data = { type: "draw", x, y, color };
      db.insertDrawingData(socket.handshake.sessionID, data);
      socket.broadcast.emit("draw", { x, y, color });
    });
  });

  // stop drawing event
  socket.on("stopDrawing", () => {
    db.getUserStrokeColor(socket.handshake.sessionID, (color) => {
      const data = { type: "stop", color };
      db.insertDrawingData(socket.handshake.sessionID, data);
      socket.broadcast.emit("stopDrawing");
    });
  });

  // change stroke color event
  socket.on("changeStrokeColor", (color) => {
    db.changeStrokeColor(socket.handshake.sessionID, color);
    socket.broadcast.emit("changeStrokeColor", { socketId: socket.id, color });
  });
  // disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://127.0.0.1:3000");
});
