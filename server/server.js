const express = require("express");
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const { sessionMiddleware, wrap } = require('../server/sessionStore');

const { createServer } = require("node:http");
const { join } = require("node:path");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});

const db = require("../database/db");

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static("public"));
app.use(express.static("admin"));
app.set("view engine", "ejs");
app.set('views', join(__dirname, '../admin'));

app.get("/canvas", (req, res) => {
  if (req.session) {
    req.session.save(() => {
      console.log(req.session.id + ' connected');
    });
  } else {
    res.send("Invalid session");
  }
  res.sendFile(join(__dirname, "../public/index.html"));
});

app.get('/admin', (req, res) => {
  db.getAllDrawingData((drawingData) => {
    res.render('admin', { drawingData });
  });
});

app.delete('/delete/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  db.deleteDrawingsBySessionID(sessionId, (result) => {
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

const clients = {};

io.use(wrap(sessionMiddleware));
io.on("connection", (socket) => {
  const sessionId = socket.request.session.id;

  clients[sessionId] = '#000000';

  db.getAllDrawingData((drawingData) => {
    socket.emit("loadDrawingData", drawingData);
  });

  // start drawing event
  socket.on('startDrawing', ({ x, y, width }) => {
    const data = { type: 'start', x, y, color: clients[sessionId], width };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit('startDrawing', { x, y, color: clients[sessionId], width });
  });

  // drawing event
  socket.on('draw', ({ x, y }) => {
    const data = { type: 'draw', x, y, color: clients[sessionId] };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit('draw', { x, y, color: clients[sessionId] });
  });

  // stop drawing event
  socket.on('stopDrawing', () => {
    const data = { type: 'stop' };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit('stopDrawing');
  });

  // change stroke color event
  socket.on('changeStrokeColor', (color) => {
    clients[sessionId] = color;
    socket.broadcast.emit('changeStrokeColor', { socketId: sessionId, color });
  });

  //change stroke width event
  socket.on('changeStrokeWidth', (width) => {
    socket.broadcast.emit('changeStrokeWidth', { socketId: sessionId, width });
  });

  // clear drawings event
  socket.on('clearDrawings', () => {
    db.clearDrawings(sessionId);
    socket.broadcast.emit('clearDrawings', sessionId);
  });

  // disconnect event
  socket.on('disconnect', () => {
    console.log(sessionId + ' disconnected');
    delete clients[sessionId];
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
