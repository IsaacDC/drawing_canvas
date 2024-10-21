const express = require("express");
const db = require("../databases/dbSwitcher");
const router = express.Router();

const deleteDrawingsByUser = (sessionId) => {
  return new Promise((resolve, reject) => {
    db.deleteDrawingsByUser(sessionId, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const banUser = (sessionId) => {
  return new Promise((resolve, reject) => {
    db.banUser(sessionId, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const unbanUser = (sessionId) => {
  return new Promise((resolve, reject) => {
    db.unbanUser(sessionId, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
// Ban session route
router.post("/ban/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    await banUser(sessionId);
    await deleteDrawingsByUser(sessionId);

    const io = req.app.get("io");
    io.sockets.sockets.forEach((socket) => {
      if (socket.request.sessionID === sessionId) {
        socket.emit("banUser");
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error banning sessionID:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// unban user
router.delete("/unban/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    await unbanUser(sessionId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error unbanning sessionID:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete users drawing
router.delete("/delete/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    await deleteDrawingsByUser(sessionId);
    res.json({ success: true, message: "Drawings deleted successfully" });
  } catch (err) {
    console.error("Error deleting drawings by sessionId:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//
router.get("/getUsername", (req, res) => {
  res.json({ username: req.session.username });
});

module.exports = router;
