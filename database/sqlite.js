const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("drawings.db");

db.serialize(() => {
  // Create the drawings table
  db.run(
    `CREATE TABLE IF NOT EXISTS drawings (
    sessionID TEXT,
    type TEXT,
    x REAL,
    y REAL,
    color TEXT DEFAULT '#000000',
    width INTEGER DEFAULT 5
  )`,
    (err) => {
      if (err) {
        console.error("Error creating drawings table:", err);
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS bannedSessionIDs (
    sessionID TEXT
  )`,
    (err) => {
      if (err) {
        console.error("Error creating bannedSessionIDs table:", err);
      }
    }
  );
});

module.exports = {
  // Insert drawing data
  insertDrawingData(sessionID, data) {
    const { type, x, y, color, width } = data;
    db.run(
      "INSERT INTO drawings (sessionID, type, x, y, color, width) VALUES (?, ?, ?, ?, ?, ?)",
      [sessionID, type, x, y, color, width],
      (err) => {
        if (err) {
          console.error("Error inserting drawing data:", err);
        }
      }
    );
  },

  // Get all drawing data
  getAllDrawingData(callback) {
    db.all("SELECT * FROM drawings", (err, rows) => {
      if (err) {
        console.error("Error getting all drawing data:", err);
        return;
      }
      callback(rows);
    });
  },

  // Delete all drawings for a specific session ID
  deleteDrawingsBySessionID(sessionId) {
    db.run(
      "DELETE FROM drawings WHERE sessionID = ?",
      [sessionId],
      (err) => {
        if (err) {
          console.error("Error deleting drawings by session ID:", err);
        }
      }
    );
  },

  tempClearCanvas(sessionID) {
    db.run(
      "UPDATE drawings SET color = 'rgba(255, 255, 255, 0)' WHERE sessionID = ?",
      [sessionID],
      (err) => {
        if (err) {
          console.error("Error updating drawing data:", err);
        }
      }
    );
  },

  // Delete all drawings
  clearCanvas(callback) {
    db.run("DELETE FROM drawings", (err) => {
      if (err) {
        console.error("Error clearing canvas:", err);
        callback(false);
      } else {
        callback(true);
      }
    });
  },

  // Add a new banned sessionID
  banSessionID(sessionID, callback) {
    db.run(
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
    db.get(
      "SELECT * FROM bannedSessionIDs WHERE sessionID = ?",
      [sessionID],
      (err, row) => {
        if (err) {
          callback(err);
        } else {
          callback(null, !!row);
        }
      }
    );
  },

  // Remove a banned sessionID
  removeBannedSessionID(sessionID, callback) {
    db.run(
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

  // Get unique session IDs
  uniqueSessionIds(callback) {
    db.all("SELECT DISTINCT sessionID FROM drawings", (err, rows) => {
      if (err) {
        console.error("Error getting unique session IDs:", err);
        return;
      }
      callback(rows);
    });
  },

  // Close the database connection
  closeConnection() {
    db.close((err) => {
      if (err) {
        console.error("Error closing database connection:", err);
      } else {
        console.log("Database connection closed successfully.");
      }
    });
  },
};