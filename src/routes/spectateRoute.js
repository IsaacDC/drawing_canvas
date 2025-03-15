const express = require("express");
const { join } = require("path");

const router = express.Router();

router.get("/spectate", (req, res) => {
  res.sendFile(join(__dirname, ".././public/spectate.html"));
});

module.exports = router;