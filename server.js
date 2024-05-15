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
    res.sendFile(join(__dirname, "index.html"));
  });

const db = require("./db");
// we need to use the same secret for Socket.IO and Express
// var parseCookie = express.cookieParser(secret);
// var store = /* your MemoryStore, RedisStore, etc */;

// io.set('authorization', function(handshake, callback) {
//   if (handshake.headers.cookie) {
//     // pass a req, res, and next as if it were middleware
//     parseCookie(handshake, null, function(err) {
//       handshake.sessionID = handshake.signedCookies['connect.sid'];
//       // or if you don't have signed cookies
//       handshake.sessionID = handshake.cookies['connect.sid'];

//       store.get(handshake.sessionID, function (err, session) {
//         if (err || !session) {
//           // if we cannot grab a session, turn down the connection
//           callback('Session not found.', false);
//         } else {
//           // save the session data and accept the connection
//           handshake.session = session;
//           callback(null, true);
//         }
//       });
//     });
//   } else {
//     return callback('No session.', false);
//   }
//   callback(null, true);
// });
io.on("connection", (socket) => {
  const sessionID = socket.handshake.session.id;
  console.log(socket.handshake + " connected");

  db.checkSessionID(sessionID, (row) => {
    if (row) {
      console.log("Welcome Back");
      db.getUserStrokeColor(sessionID, (color) => {
        socket.emit("changeStrokeColor", { sessionID, color });
      });
    } else {
      db.insertUserData(sessionID, "#000000");
    }
  });
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
