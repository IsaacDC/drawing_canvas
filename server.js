const express = require("express");
const socket = require("socket.io");
const cookieParser = require('cookie-parser');
const { sessionMiddleware, wrap, sessionStore } = require('./sessionStore');

const { createServer } = require("node:http");
const { join } = require("node:path");

const app = express();
const server = createServer(app);
const io = socket(server, { connectionStateRecovery: {} });

const db = require("./db");

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static("public"));

app.get("/canvas", (req, res) => {
  if (req.session) {
    // Session exists, check if it's stored in the database
    db.checkSessionID(req.session.id, function (exists) {
      if (exists) {
        console.log(req.session);
        console.log(req.session.id);
        req.session.visited = true;
      } else {
        // Session exists but not in the database, insert it
        db.insertDrawingData(req.session.id, function () {
          console.log("Welcome" + req.session.id);
        });
      }
    });
  }
  res.sendFile(join(__dirname, "public/index.html"));
});

io.use(wrap(sessionMiddleware));

io.on("connection", (socket) => {
  const sessionID = socket.request.session.id;

  db.getColorForSession(sessionID, (color) => {
    if (color) {
      // Store the color in a variable
      const sessionColor = color;
      console.log("Session color:", sessionColor);

      // Emit the color to the client
      socket.emit("setColor", sessionColor);
    }
  });
  console.log(sessionID + " connected");

  db.getAllDrawingData((drawingData) => {
    socket.emit("loadDrawingData", drawingData);
  });

  // start drawing event
  socket.on("startDrawing", ({ x, y }) => {
    const data = { type: "start", x, y, color: color };
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
  console.log("server running at http://127.0.0.1:3000/canvas");
});
