const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require("unique-names-generator");
const db = require("../databases/dbSwitcher");

const usernameGenerator = async (req, res, next) => {
  try {
    const { session } = req;

    if (!session.username) {
      // Generate a unique name
      const randomName = uniqueNamesGenerator({
        dictionaries: [colors, animals],
        style: "capital",
      });
      req.session.username = randomName;
    }

    await new Promise((resolve, reject) => {
      db.addUser(req.sessionID, req.session.username, (err) => {
        if (err) {
          console.error("Failed to add user:", err);
          reject("Server Error");
        } else {
          resolve();
        }
      });
    });

    next();
  } catch (err) {
    res.status(500).send(err);
  }
};
module.exports = { usernameGenerator };
