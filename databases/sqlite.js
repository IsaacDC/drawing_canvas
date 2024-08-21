const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("drawings.db");

// Used to reset the schema
// db.run("DROP TABLE IF EXISTS drawings");

db.serialize(() => {
  // Create the drawings table
  db.run(
    `CREATE TABLE IF NOT EXISTS drawings (
    sessionID TEXT,
    type TEXT,
    x1 REAL,
    y1 REAL,
    x2 REAL,
    y2 REAL,
    color TEXT DEFAULT '#000000',
    width INTEGER DEFAULT 5,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
    (err) => {
      if (err) {
        console.error("Error creating drawings table:", err);
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS bannedSessions (
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
    db.run(sql, params, (err) => {
      if (err) {
        console.error("Error inserting drawing data:", err);
      }
    });
  },

  getAllDrawingData(callback) {
    db.all("SELECT * FROM drawings ORDER BY timestamp ASC", [], (err, rows) => {
      if (err) {
        console.error("Error getting all drawing data:", err);
        return;
      }
      callback(rows);
    });
  },

  // Delete all drawings for a specific session ID
  deleteDrawingsBySessionID(sessionId) {
    db.run("DELETE FROM drawings WHERE sessionID = ?", [sessionId], (err) => {
      if (err) {
        console.error("Error deleting drawings by session ID:", err);
      }
    });
  },

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

  // ban a User
  banSessionID(sessionID, callback) {
    db.run(
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

  isSessionBanned(sessionID, callback) {
    db.get(
      "SELECT * FROM bannedSessions WHERE sessionID = ?",
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

  getBannedSessions(callback) {
    db.all("SELECT * FROM bannedSessions", (err, rows) => {
      if (err) {
        console.error("Error getting banned sessions:", err);
        return;
      }
      callback(rows);
    });
  },

  // Remove a banned sessionID
  unbanSessionId(sessionID, callback) {
    db.run(
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
