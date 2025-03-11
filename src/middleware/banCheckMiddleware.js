// Ban Check Middleware
const db = require("../databases/dbSwitcher");

const banCheckMiddleware = async (req, res, next) => {
  try {
    if (!req.session) return res.send("Invalid session");

    const isBanned = await new Promise((resolve, reject) => {
      db.isUserBanned(req.session.id, (err, banned) => {
        if (err) {
          reject(err);
        } else {
          resolve(banned);
        }
      });
    });

    if (isBanned) return res.status(403).send("Access Denied.");

    return next();
  } catch (err) {
    console.error("Error in banCheckMiddleware:", err);
    res.status(500).send("Server error");
  }
};
module.exports = { banCheckMiddleware };
