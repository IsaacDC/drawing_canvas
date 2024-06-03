const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Ironheat1",
  database: "drawings_app",
});

pool.query(
  `CREATE TABLE IF NOT EXISTS drawings (
    sessionID TEXT,
    type TEXT,
    x FLOAT,
    y FLOAT,
    color TEXT,
    width INT DEFAULT 5
  )`,
  (err, result) => {
    if (err) {
      console.error("Error creating drawings table:", err);
    }
  }
);

pool.query(
  `CREATE TABLE IF NOT EXISTS bannedSessionIDs (
    sessionID TEXT
  )`,
  (err, result) => {
    if (err) {
      console.error("Error creating bannedSessionIDs table:", err);
    }
  }
);

module.exports = {
  //deletes all drawings for a specific session ID
  deleteDrawingsBySessionID(sessionId, callback) {
    pool.query(
      "DELETE FROM drawings WHERE sessionID = ?",
      [sessionId],
      (err, result) => {
        if (err) {
          console.error("Error deleting drawings by session ID:", err);
          callback(false);
        } else {
          callback(true);
        }
      }
    );
  },

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
  },

  closeConnection() {
    pool.end((err) => {
      if (err) {
        console.error("Error closing database connection:", err);
        process.exit(1);
      }
      console.log("Database connection pool closed successfully.");
    });
  }
};