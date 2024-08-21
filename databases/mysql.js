const mysql = require("mysql2");
const config = require("../server/config");

const pool = mysql.createPool(config.database);

module.exports = {
  //insert drawing data
  insertDrawingData(sessionID, data) {
    const { x1, y1, x2, y2, color, width } = data;

    let sql, params;

    if (color) {
      sql =
        "INSERT INTO drawings (sessionID,type, x1, y1, x2, y2, color, width) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      params = [sessionID, "draw", x1, y1, x2, y2, color, width];
    } else {
      sql =
        "INSERT INTO drawings (sessionID,type, x1, y1, x2, y2, width) VALUES (?, ?, ?, ?, ?, ?, ?)";
      params = [sessionID, "draw", x1, y1, x2, y2, width];
    }

    pool.query(sql, params, (err) => {
      if (err) {
        console.error("Error inserting drawing data:", err);
      }
    });
  },

  //gets all drawing data
  getAllDrawingData(callback) {
    pool.query("SELECT * FROM drawings ORDER BY timestamp ASC", (err, rows) => {
      if (err) {
        console.error("Error getting all drawing data:" + err);
        return;
      }
      callback(rows);
    });
  },

  //deletes all drawings for a specific session ID
  deleteDrawingsBySessionID(sessionId) {
    pool.query(
      "DELETE FROM drawings WHERE sessionID = ?",
      [sessionId],
      (err) => {
        if (err) {
          console.error("Error deleting drawings by session ID:", err);
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

  // Add a new banned sessionID
  banSessionID(sessionID, callback) {
    pool.query(
      "INSERT INTO bannedSessions (sessionID) VALUES (?)",
      [sessionID],
      (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      }
    );
  },

  // Check if a sessionID is banned
  isSessionBanned(sessionID, callback) {
    pool.query(
      "SELECT * FROM bannedSessions WHERE sessionID = ?",
      [sessionID],
      (err, result) => {
        if (err) {
          callback(err);
        } else {
          callback(null, result.length > 0);
        }
      }
    );
  },

  getBannedSessions(callback) {
    pool.query("SELECT * FROM bannedSessions", (err, rows) => {
      if (err) {
        console.error("Error getting banned sessions:", err);
        return;
      }
      callback(rows);
    });
  },

  // Remove a banned sessionID
  unbanSessionId(sessionID, callback) {
    pool.query(
      "DELETE FROM bannedSessions WHERE sessionID = ?",
      [sessionID],
      (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      }
    );
  },
};
