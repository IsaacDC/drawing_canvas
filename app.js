const express = require("express");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { sessionMiddleware, wrap } = require("./server/sessionStore");
const { createServer } = require("node:http");
const { join } = require("node:path");

const app = express();
const server = createServer(app);

const db = require("./database/mysql");
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

app.delete("/clearCanvas", (req, res) => {
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
      color: clients[socket.id],
      width,
    };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit("startDrawing", {
      x,
      y,
      color: clients[socket.id],
      width,
    });
  });

  // draw event
  socket.on("draw", ({ x, y, width }) => {
    const data = {
      type: "draw",
      x,
      y,
      color: clients[socket.id],
      width,
    };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit("draw", {
      x,
      y,
      color: clients[socket.id],
      width,
    });
  });

  // stop drawing event
  socket.on("stopDrawing", () => {
    const data = { type: "stop" };
    db.insertDrawingData(sessionId, data);
    socket.broadcast.emit("stopDrawing");
  });

  // change stroke color event
  socket.on("changeStrokeColor", (color) => {
    clients[socket.id] = color;
    socket.broadcast.emit("changeStrokeColor", { socketId: socket.id, color });
  });

  //change stroke width event
  socket.on("changeStrokeWidth", (width) => {
    socket.broadcast.emit("changeStrokeWidth", { socketId: sessionId, width });
  });

  // clear drawings event
  socket.on("clearDrawings", () => {
    db.tempClearCanvas(sessionId);
    io.emit("clearCanvasForSession", sessionId);

    db.deleteDrawingsBySessionID(sessionId)
  });

  // disconnect event
  socket.on("disconnect", () => {
    delete clients[socket.id];
  });
});



server.listen(config.server.port, () => {
  console.log(`Server running at http://127.0.0.1:${config.server.port}`);
});
