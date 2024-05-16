const express = require("express");
const {Server} = require('socket.io');
const cookieParser = require('cookie-parser');

const { sessionMiddleware, wrap } = require('./sessionStore');

const { createServer } = require("node:http");
const { join } = require("node:path");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors:{
    origin: 'http://localhost:3000',
    credentials: true,
  }
});

const db = require("./db");

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const clients = {};

io.use(wrap(sessionMiddleware));
io.on("connection", (socket) => {
  const sessionID = socket.request.session.id;

  if (sessionID) {
    // check if it's in the database
    db.checkSessionID(sessionID, function (exists) {
      if (exists) {
        console.log(req.session);
        console.log(sessionID);
        req.session.visited = true;
      } else {
        //insert it
        db.insertDrawingData(sessionID, function () {
          console.log("Welcome" + sessionID);
        });
      }
    });
  }

  db.getAllDrawingData((drawingData) => {
    socket.emit("loadDrawingData", drawingData);
  });

  // start drawing event
  socket.on("startDrawing", ({ x, y }) => {
    const data = { type: "start", x, y, color: clients[sessionID]};
    db.insertDrawingData(data);
    socket.broadcast.emit("startDrawing", { x, y, color: clients[sessionID] });
  });

  // drawing event
  socket.on("draw", ({ x, y }) => {
    const data = { type: "draw", x, y, color: clients[sessionID] };
    db.insertDrawingData(data);
    socket.broadcast.emit("draw", { x, y, color: clients[sessionID] });
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
    socket.broadcast.emit("changeStrokeColor", { sessionID: sessionID, color: clients[sessionID] });;
  });
  
  // disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down...');
  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite database:', err);
    } else {
      console.log('SQLite database connection closed successfully.');
    }
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down...');
  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite database:', err);
    } else {
      console.log('SQLite database connection closed successfully.');
    }
    process.exit(0);
  });
});

server.listen(3000, () => {
  console.log("server running at http://127.0.0.1:3000");
});
