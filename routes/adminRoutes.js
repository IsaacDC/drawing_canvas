const express = require("express");
const db = require("../databases/dbSwitcher");

const router = express.Router();

// Admin route
router.get("/admin", (req, res) => {
  db.getAllDrawingData((err, drawingData) => {
    if (err) {
      console.error("Error fetching drawing data:", err);
      return res.status(500).send("Server error");
    }

    db.getBannedUsers((err, bannedUsers) => {
      if (err) {
        console.error("Error fetching banned users:", err);
        return res.status(500).send("Server error");
      }

      res.render("admin", { drawingData, bannedUsers });
    });
  });
});

module.exports = router;
