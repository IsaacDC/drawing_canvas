const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require("unique-names-generator");
const db = require("../databases/dbSwitcher");

const usernameGenerator = async (req, res, next) => {
  const { session } = req;

  const generateUsername = () => {
    return uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: "capital",
    });
  };

  try {
    if (!session.username) {
      session.username = generateUsername();
    }

    await new Promise((resolve, reject) => {
      const tryAddUser = (generatedUsername) => {
        db.addUser(req.sessionID, generatedUsername, (err) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY" || err.code === "SQLITE_CONSTRAINT") {
              // Try again with a new username
              tryAddUser(generateUsername());
            } else {
              console.error("Failed to add user:", err);
              reject("Server Error");
            }
          } else {
            resolve();
          }
        });
      };

      tryAddUser(session.username);
    });

    next();
  } catch (err) {
    console.error("Error in username middleware:", err);
    res.status(500).send(err);
  }
};

module.exports = { usernameGenerator };
