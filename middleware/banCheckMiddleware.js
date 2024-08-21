// Ban Check Middleware
const db = require("../databases/dbChooser");

const banCheckMiddleware = (req, res, next) => {
  if (req.session) {
    db.isSessionBanned(req.sessionID, (err, isBanned) => {
      if (err) {
        console.error("Error checking if sessionID is banned:", err);
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
