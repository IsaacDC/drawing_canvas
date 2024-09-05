const express = require("express");
const db = require("../databases/dbSwitcher");
const router = express.Router();

// Delete session route
router.delete("/delete/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.deleteDrawingsByUser(sessionId, (result) => {
    res.json({ success: result });
  });
});

// Ban session route
router.post("/ban/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.banUser(sessionId, (err) => {
    if (err) {
      console.error("Error banning sessionId:", err);
      res.status(500).json({ success: false, message: "Server error" });
    } else {
      // Emit event to connected clients
      const io = req.app.get("io");
      io.sockets.sockets.forEach((socket) => {
        if (socket.request.sessionID === sessionId) {
          socket.emit("banUser");
        }
      });
      res.json({ success: true });
    }
  });
  db.deleteDrawingsByUser(sessionId, (err) => {
    if (err) {
      console.error("Error deleting drawings by sessionId:", err);
    }
  });
});

// unban user
router.delete("/unban/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.unbanUser(sessionId, (err) => {
    if (err) {
      console.error("Error unbanning sessionID:", err);
      res.status(500).json({ success: false, message: "Server error" });
    } else {
      res.json({ success: true });
    }
  });
});

// Delete users drawing
router.delete("/delete/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.deleteDrawingsByUser(sessionId, (result) => {
    res.json({ success: result });
  });
});

//
router.get("/getUsername", (req, res) => {
  res.json({ username: req.session.username });
});

module.exports = router;
