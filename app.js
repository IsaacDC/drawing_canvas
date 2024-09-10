const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const { join } = require("node:path");

const db = require("./databases/dbSwitcher");
const config = require("./server/config");

const { sessionMiddleware, wrap } = require("./server/sessionStore");
const { banCheckMiddleware } = require("./middleware/banCheckMiddleware");
const { usernameGenerator } = require("./middleware/usernameMiddleware");

const WorkerPool = require("./worker_threads/workerPool");
// You can change the amount of workers
const workers = new WorkerPool(3, "./drawingWorker");

const app = express();
const server = createServer(app);

const io = new Server(server, config.cors);
app.set("io", io);

app.use(sessionMiddleware);
app.use(usernameGenerator);
app.use(banCheckMiddleware);

app.set("view engine", "ejs");
app.set("views", join(__dirname, "./admin"));

app.use(express.static("public"));
app.use(express.static("admin"));

const routes = require("./routes");
app.use(routes);

app.get("/spectate", (req, res) => {
  if (req.session) {
    res.sendFile(join(__dirname, "./public/spectate/spectate.html"));
  }
});

app.get("/", (req, res) => {
  if (req.session) {
    res.sendFile(join(__dirname, "./public/index.html"));
  }
});

io.use(wrap(sessionMiddleware));
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.id) {
    next();
  } else {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  let drawCount = 0;
  let drawCountResetTimeout;

  const sessionId = socket.request.sessionID;

  // start drawing event
  socket.on("draw", (data) => {
    const now = Date.now();
    drawCount++;

    // limits to 300 draw events per minute
    if (drawCount > 3000) {
      socket.emit("drawingLimitReached");
      return;
    }

    lastDrawTime = now;

    // resets draw count every minute
    clearTimeout(drawCountResetTimeout);
    drawCountResetTimeout = setTimeout(() => {
      drawCount = 0;
    }, 60 * 1000);

    workers.runTask(
      { type: "insertDrawingData", sessionId: sessionId, data: data },
      (data) => {
        socket.broadcast.emit("draw", data.data);
      }
    );
  });

  // clear drawings event
  socket.on("trashDrawings", () => {
    db.deleteDrawingsByUser(sessionId)
    setTimeout(() => io.emit("updateCanvas"), 100);
  });
});

server.listen(config.server.port, config.server.domain, () => {
  console.log(
    `Server running at ${config.server.domain}:${config.server.port}`
  );
});
