const express = require("express");
const db = require("../databases/dbChooser");

const router = express.Router();

// Admin route
router.get("/admin", (req, res) => {
    db.getAllDrawingData((drawingData) => {
      db.getBannedSessions((bannedSessions) => {
        res.render("admin", { drawingData, bannedSessions });
      });
    });
  });

module.exports = router;
