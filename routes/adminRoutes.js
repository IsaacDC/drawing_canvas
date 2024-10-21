const express = require("express");
const db = require("../databases/dbSwitcher");

const router = express.Router();

const getAllDrawingData = () => {
  return new Promise((resolve, reject) => {
    db.getAllDrawingData((err, drawingData) => {
      if (err) reject(err);
      else resolve(drawingData);
    });
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.getAllUsers((err, users) => {
      if (err) reject(err);
      else resolve(users);
    });
  });
};

const getBannedUsers = () => {
  return new Promise((resolve, reject) => {
    db.getBannedUsers((err, bannedUsers) => {
      if (err) reject(err);
      else resolve(bannedUsers);
    });
  });
};

// Admin route
router.get("/admin", async (req, res) => {
  try {
    const [drawingData, userData, bannedUsers] = await Promise.all([
      getAllDrawingData(),
      getAllUsers(),
      getBannedUsers(),
    ]);
    res.render("admin", { drawingData, userData, bannedUsers });
  } catch (err) {
    console.error("Error in admin route:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;
