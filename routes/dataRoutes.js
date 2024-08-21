const express = require("express");
const db = require("../databases/dbChooser");
const router = express.Router();

router.get('/getDrawingData', (req, res) => {
  db.getAllDrawingData((drawingData) => {
    res.json(drawingData);
  });
});

router.delete("/clearCanvas", (req, res) => {
  db.clearCanvas((result) => {
    res.json({ success: result });
  });
});

module.exports = router;
