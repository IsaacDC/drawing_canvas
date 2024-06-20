const mysql = require("mysql2");
const config = require("../server/config");

const pool = mysql.createPool(config.database);

module.exports = {

  //insert drawing data
  insertDrawingData(sessionID, data) {
    const { type, x, y, color, width } = data;
    pool.query(
      "INSERT INTO drawings (sessionID, type, x, y, color, width) VALUES (?, ?, ?, ?, ?, ?)",
      [sessionID, type, x, y, color, width],
      (err) => {
        if (err) {
          console.error("Error inserting drawing data:", err);
        }
      }
    );
  },

  //gets all drawing data
  getAllDrawingData(callback) {
    pool.query("SELECT * FROM drawings", (err, rows) => {
      if (err) {
        console.error("Error getting all drawing data:" + err);
        return;
      }
      callback(rows);
    });
  },

  getDrawingsBySessionID(sessionId, callback) {
    pool.query(
      "SELECT * FROM drawings WHERE sessionID = ?",
      [sessionId],
      (err, rows) => {
        if (err) {
          console.error("Error getting drawings by session ID:", err);
          callback(err, null);
        } else {
          callback(null, rows);
        }
      }
    );
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
      "INSERT INTO bannedSessionIDs (sessionID) VALUES (?)",
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
  isSessionIDBanned(sessionID, callback) {
    pool.query(
      "SELECT * FROM bannedSessionIDs WHERE sessionID = ?",
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

  // Remove a banned sessionID
  removeBannedSessionID(sessionID, callback) {
    pool.query(
      "DELETE FROM bannedSessionIDs WHERE sessionID = ?",
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

  uniqueSessionIds(callback) {
    pool.query("SELECT DISTINCT sessionID FROM drawings", (err, rows) => {
      if (err) {
        console.log("Error getting unique sessionIds: " + err);
        return;
      }
      callback(rows);
    });
  }
};