const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require("unique-names-generator");
const db = require("../databases/dbSwitcher");

const usernameGenerator = (req, res, next) => {
  const { session } = req;

  if (!session.username) {
    // Generate a unique name
    const randomName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: "capital",
    });
    req.session.username = randomName;
  }
  // Adds user to the database
  db.addUser(req.sessionID, req.session.username, (err) => {
    if (err) {
      console.error("Failed to add user:", err);
      return res.status(500).send("Server error");
    }
    next();
  });
};
module.exports = { usernameGenerator };
