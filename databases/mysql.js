const mysql = require("mysql2");
const config = require("../server/config");

const pool = mysql.createPool(config.database);

module.exports = {
  //insert drawing data
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

  //gets all drawing data
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
  deleteDrawingsByUser(sessionId) {
    pool.query(
      "DELETE FROM drawings WHERE sessionId = ?",
      [sessionId],
      (err) => {
        if (err) {
          console.error("Error deleting drawings by sessionId:", err);
        }
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

  // ban a User
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

  // Check if a sessionID is banned
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

  // Remove a banned sessionId
  unbanUser(sessionId, callback) {
    pool.query(
      "UPDATE users set is_banned = 0 WHERE sessionId = ?",
      [sessionId],
      (err, result) => {
        if (err) {
          console.error("Error unbanning user:", err);
          callback(err);
        } else if (result.affectedRows === 0) {
          // SessionId wasn't found
          callback(new Error("User not found"));
        } else {
          callback(null);
        }
      }
    );
  },
};
