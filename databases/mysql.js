const mysql = require("mysql2");
const config = require("../server/config");

const pool = mysql.createPool(config.database);

module.exports = {
  insertDrawingData(sessionId, data) {
    const { startX, startY, endX, endY, color, width } = data;

    let sql, params;

    if (color) {
      sql =
        "INSERT INTO drawings (sessionId, startX, startY, endX, endY, color, width) VALUES (?, ?, ?, ?, ?, ?, ?)";
      params = [sessionId, startX, startY, endX, endY, color, width];
    } else {
      sql =
        "INSERT INTO drawings (sessionId, startX, startY, endX, endY, width) VALUES (?, ?, ?, ?, ?, ?)";
      params = [sessionId, startX, startY, endX, endY, width];
    }
    pool.query(sql, params, (err) => {
      if (err) {
        console.error("Error inserting drawing data:", err);
      }
    });
  },

  getAllDrawingData(callback) {
    pool.query("SELECT * FROM drawings", (err, results) => {
      if (err) {
        console.error("Error getting all drawing data:" + err);
        return;
      }
      callback(null, results);
    });
  },

  // Delete all drawings for a specific session ID
  deleteDrawingsByUser(sessionId, callback) {
    pool.query(
      "DELETE FROM drawings WHERE sessionId = ?",
      [sessionId],
      (err, results) => {
        if (err) {
          console.error("Error deleting drawings by sessionId:", err);
          return callback(err, false);
        }
        callback(null, results.affectedRows > 0);
      }
    );
  },

  //deletes all drawings
  clearCanvas(callback) {
    pool.query("DELETE FROM drawings", (err) => {
      if (err) {
        console.log("Error clearing canvas: ", err);
        callback(false);
      } else {
        callback(true);
      }
    });
  },

  addUser(sessionId, username, callback) {
    pool.query(
      "SELECT 1 FROM users WHERE sessionId = ? LIMIT 1",
      [sessionId],
      (err, results) => {
        if (err) {
          console.log("Error checking if user already exists:", err);
          callback(err, null);
        } else if (results.length > 0) {
          callback(null, results[0]);
        } else {
          pool.query(
            "INSERT INTO users (sessionId, username) VALUES (?,?)",
            [sessionId, username],
            function (err) {
              if (err) {
                console.error("Error inserting user data:", err);
                callback(err, null);
              } else {
                callback(null, { sessionId, username });
              }
            }
          );
        }
      }
    );
  },

  getAllUsers(callback) {
    pool.query("SELECT * FROM users", [], (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },

  banUser(sessionId, callback) {
    pool.query(
      "UPDATE users set is_banned = 1 WHERE sessionId = ?",
      [sessionId],
      (err, result) => {
        if (err) {
          callback(err);
        } else {
          callback(null, result.affectedRows > 0);
        }
      }
    );
  },

  isUserBanned(sessionId, callback) {
    pool.query(
      "SELECT is_banned FROM users WHERE sessionId = ?",
      [sessionId],
      (err, results) => {
        if (err) {
          callback(err);
        } else if (results.length === 0) {
          // User not found
          callback(null, false);
        } else {
          // Check if the user is banned
          callback(null, results[0].is_banned === 1);
        }
      }
    );
  },

  getBannedUsers(callback) {
    pool.query(
      "SELECT * FROM users WHERE is_banned = 1",
      [],
      (err, results) => {
        if (err) {
          console.error("Error getting banned users:", err);
          callback(err, null);
          return;
        }
        callback(null, results);
      }
    );
  },

  unbanUser(sessionId, callback) {
    pool.query(
      "UPDATE users set is_banned = 0 WHERE sessionId = ?",
      [sessionId],
      (err, result) => {
        if (err) {
          console.error("Error unbanning user:", err);
          callback(err);
        } else if (result.affectedRows === 0) {
          callback(new Error("User not found"));
        } else {
          callback(null);
        }
      }
    );
  },
};
