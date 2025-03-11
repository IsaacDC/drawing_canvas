const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const { join } = require("node:path");
require("dotenv").config();

const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;

const bodyParser = require("body-parser");
const db = require("./src/databases/dbSwitcher");
const middleware = require("./src/middleware");
const { sessionMiddleware, wrap } = require("./src/config/sessionStore");
const WorkerPool = require("./src/services/workerPool");
// You can change the amount of workers
const workers = new WorkerPool(3, "./src/services/drawingWorker");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  origin: `http://${DOMAIN}:${PORT}`,
  credentials: true,
});

app.set("io", io);
app.set("view engine", "ejs");
app.set("views", join(__dirname, "./src/admin"));

app.use(sessionMiddleware);
app.use(middleware.usernameGenerator);
app.use(middleware.banCheckMiddleware);
app.use(express.static("public"));
app.use(express.static("admin"));
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require("./src/routes/index");
app.use(routes);

app.get("/", (req, res) => {
  if (req.session) {
    res.sendFile(join(__dirname, "./public/index.html"));
  } else {
    res.status(404).send("Unauthorized");
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
    db.deleteDrawingsByUser(sessionId, (err) => {
      if (err) {
        console.error("Error deleting drawings by sessionId:", err);
      }
    });
    setTimeout(() => io.emit("updateCanvas"), 100);
  });
});

server.listen(serverPort, () => {
  console.log(`Server running at ${serverHost}:${serverPort}`);
});
