const express = require("express");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { sessionMiddleware, wrap } = require("./server/sessionStore");
const { createServer } = require("node:http");
const { join } = require("node:path");

const app = express();
const server = createServer(app);

const db = require("./database/db");
const config = require("./server/config");

const io = new Server(server, config.cors);

app.use(cookieParser());
app.use(sessionMiddleware);

app.use(express.static("public"));
app.use(express.static("admin"));

app.set("view engine", "ejs");
app.set("views", join(__dirname, "./admin"));

app.get("/", (req, res) => {
  if (req.session) {
    db.isSessionIDBanned(req.session.id, (err, isBanned) => {
      if (err) {
        console.error("Error checking if sessionID is banned:", err);
        res.status(500).send("Server error");
      } else if (isBanned) {
        res.status(403).send("Access denied");
      } else {
        req.session.save();
        res.sendFile(join(__dirname, "./public/index.html"));
      }
    });
  } else {
    res.send("Invalid session");
  }
});

app.get("/admin", (req, res) => {
  db.getAllDrawingData((drawingData) => {
    res.render("admin", { drawingData, renderCanvas: true });
  });
});

app.get("/admin/sessions", (req, res) => {
  db.uniqueSessionIds((sessionIds) => {
    res.json(sessionIds);
  });
});

app.delete("/delete/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.deleteDrawingsBySessionID(sessionId, (result) => {
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

app.post("/ban/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.banSessionID(sessionId, (err) => {
    if (err) {
      console.error("Error banning sessionID:", err);
      res.status(500).json({ success: false, message: "Server error" });
    } else {
      res.json({ success: true });
    }
  });
});

app.delete("/clear", (req, res) => {
  db.clearCanvas((result) => {
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

  db.getAllDrawingData((drawingData) => {
    socket.emit("loadDrawingData", drawingData);
  });

  // start drawing event
  socket.on("startDrawing", ({ x, y, width }) => {
    const data = {
      type: "start",
      x,
      y,
      color: clients[sessionId],
      width,
    };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit("startDrawing", {
      x,
      y,
      color: clients[sessionId],
      width,
    });
  });

  // draw event
  socket.on("draw", ({ x, y, width, mode }) => {
    const data = {
      type: "draw",
      x,
      y,
      color: clients[sessionId],
      width,
      mode,
    };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit("draw", {
      x,
      y,
      color: clients[sessionId],
      width,
      mode
    });
  });

  // stop drawing event
  socket.on("stopDrawing", () => {
    const data = { type: "stop" };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit("stopDrawing");
  });

  socket.on("drawingData", (data) => {
    db.insertDrawingData(sessionId, data);
  });

  // change stroke color event
  socket.on("changeStrokeColor", (color) => {
    clients[sessionId] = color;
    socket.broadcast.emit("changeStrokeColor", { socketId: sessionId, color });
  });

  //change stroke width event
  socket.on("changeStrokeWidth", (width) => {
    socket.broadcast.emit("changeStrokeWidth", { socketId: sessionId, width });
  });

  // clear drawings event
  socket.on("clearDrawings", () => {
    db.deleteDrawingsBySessionID(sessionId, (err) => {
      if (!err) {
        db.getAllDrawingData((drawingData) => {
          socket.broadcast.emit("loadDrawingData", drawingData);
        });
      }
    });
  });

  socket.on("erase", ({ x, y, width }) => {
    db.eraseDrawings(sessionId, x, y, width)
  })

  // disconnect event
  socket.on("disconnect", () => {
    delete clients[sessionId];
  });
});

// Handle server shutdown
// const shutdown = () => {
//   db.closeConnection((err) => {
//     if (err) {
//       console.error("Error closing SQLite database:", err);
//     }
//     process.exit(0);
//   });
// };

// process.on("exit", shutdown);
// process.on("SIGINT", shutdown);

server.listen(config.server.port, () => {
  console.log(`Server running at http://127.0.0.1:${config.server.port}`);
});
