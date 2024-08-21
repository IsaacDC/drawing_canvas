const express = require("express");
const db = require("../databases/dbChooser");
const router = express.Router();

// Delete session route
router.delete("/delete/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.deleteDrawingsBySessionID(sessionId, (result) => {
    res.json({ success: result });
  });
});

// Ban session route
router.post("/ban/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.banSessionID(sessionId, (err) => {
    if (err) {
      console.error("Error banning sessionID:", err);
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
});

router.delete("/delete/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.deleteDrawingsBySessionID(sessionId, (result) => {
    res.json({ success: result });
  });
});

router.delete("/unban/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  db.unbanSessionId(sessionId, (err) => {
    if (err) {
      console.error("Error unbanning sessionID:", err);
      res.status(500).json({ success: false, message: "Server error" });
    } else {
      res.json({ success: true });
    }
  });
});

router.get("/getBannedSessions", (req, res) => {
  db.getBannedSessions((rows) => {
    res.json({
      success: true,
      bannedSessions: rows.map((row) => row.sessionID),
    });
  });
});

module.exports = router;
