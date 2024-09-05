// Ban Check Middleware
const db = require("../databases/dbSwitcher");

const banCheckMiddleware = (req, res, next) => {
  if (req.session) {
    db.isUserBanned(req.session.id, (err, isBanned) => {
      if (err) {
        console.error("Error checking if sessionId is banned:", err);
        res.status(500).send("Server error");
      } else if (isBanned) {
        res.status(403).send("Access denied");
      } else {
        next();
      }
    });
  } else {
    res.send("Invalid session");
  }
};

module.exports = { banCheckMiddleware };
