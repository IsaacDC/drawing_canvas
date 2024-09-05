const express = require("express");
const db = require("../databases/dbSwitcher");
const router = express.Router();

router.get("/getDrawingData", (req, res) => {
  db.getAllDrawingData((err, drawingData) => {
    res.json(drawingData);
  });
});

// Clear the canvas of all drawings
router.delete("/clearCanvas", (req, res) => {
  db.clearCanvas((result) => {
    res.json({ success: result });
  });
});

module.exports = router;
