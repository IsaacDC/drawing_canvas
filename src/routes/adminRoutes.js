const express = require("express");
const db = require("../databases/dbSwitcher");

const { adminAuthMiddleware } = require("../middleware/adminAuthMiddleware");

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
router.get("/admin", adminAuthMiddleware, async (req, res) => {
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

router.get("/login", async (req, res) => {
  try {
    const errorMessage = req.query.error || null;
    res.render("login", { errorMessage });
  } catch (err) {
    console.error("Error in login route:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    username === `${process.env.ADMIN_USERNAME}` &&
    password === `${process.env.ADMIN_PASSWORD}`
  ) {
    req.session.admin = true;
    return res.redirect("/admin");
  } else {
    return res.redirect("/login?error=Invalid username or password");
  }
});
module.exports = router;
