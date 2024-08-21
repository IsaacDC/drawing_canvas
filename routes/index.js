const express = require("express");

const adminRoutes = require("./adminRoutes");
const sessionRoutes = require("./sessionRoutes");
const dataRoutes = require("./dataRoutes");

const router = express.Router();

// Combine all routes
router.use(adminRoutes);
router.use(sessionRoutes);
router.use(dataRoutes);

module.exports = router;
