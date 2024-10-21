const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("drawings.db");

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    sessionId TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE
  )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err);
      }
    }
  );
  // Create the drawings table
  db.run(
    `CREATE TABLE IF NOT EXISTS drawings (
    sessionId TEXT NOT NULL,
    startX REAL,
    startY REAL,
    endX REAL,
    endY REAL,
    color TEXT DEFAULT '#000000',
    width INTEGER DEFAULT 5,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sessionId) REFERENCES users(sessionId)
  )`,
    (err) => {
      if (err) {
        console.error("Error creating drawings table:", err);
      }
    }
  );

  db.run(
    `CREATE INDEX IF NOT EXISTS idx_drawings_session ON drawings (sessionId)`,
    (err) => {
      if (err) {
        console.error("Error creating index on session_id:", err);
      }
    }
  );

  db.run("PRAGMA journal_mode=WAL;", (err) => {
    if (err) {
      console.error("Error setting WAL journal mode:", err);
    }
  });
});
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
    db.run(sql, params, (err) => {
      if (err) {
        console.error("Error inserting drawing data:", err);
      }
    });
  },

  getAllDrawingData(callback) {
    db.all("SELECT * FROM drawings", [], (err, results) => {
      if (err) {
        console.error("Error getting all drawing data:", err);
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  },

  // Delete all drawings for a specific session ID
  deleteDrawingsByUser(sessionId, callback) {
    db.run("DELETE FROM drawings WHERE sessionId = ?", [sessionId], (err) => {
      if (err) {
        console.error("Error deleting drawings by sessionId:", err);
        return callback(err, false);
      }
      callback(null, this.changes > 0);
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

  addUser(sessionId, username, callback) {
    db.get(
      "SELECT 1 FROM users WHERE sessionId = ? LIMIT 1",
      [sessionId],
      (err, result) => {
        if (err) {
          console.log("Error checking if user already exists:", err);
          callback(err, null);
        } else if (result) {
          callback(null, result);
        } else {
          db.run(
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
    db.all("SELECT * FROM users", [], (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },

  banUser(sessionId, callback) {
    db.run(
      "UPDATE users set is_banned = 1 WHERE sessionId = ?",
      [sessionId],
      (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      }
    );
  },

  unbanUser(sessionId, callback) {
    db.run(
      "UPDATE users set is_banned = 0 WHERE sessionId = ?",
      [sessionId],
      function (err) {
        if (err) {
          console.error("Error unbanning user:", err);
          callback(err);
        } else if (this.changes === 0) {
          // No user was updated, which means the sessionId wasn't found
          callback(new Error("User not found"));
        } else {
          callback(null);
        }
      }
    );
  },
  isUserBanned(sessionId, callback) {
    db.get(
      "SELECT is_banned FROM users WHERE sessionId = ?",
      [sessionId],
      (err, result) => {
        if (err) {
          // User not found
          console.error("Error checking if user is banned:", err);
          callback(err, false);
        } else {
          // User is banned
          callback(null, result ? result.is_banned === 1 : false);
        }
      }
    );
  },

  getBannedUsers(callback) {
    db.all("SELECT * FROM users WHERE is_banned = 1", [], (err, results) => {
      if (err) {
        console.error("Error getting banned users:", err);
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  },
};
