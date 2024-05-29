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

//deletes all drawings for a specific session ID
const deleteDrawingsBySessionID = (sessionId, callback) => {
  db.run(
    "DELETE FROM drawings WHERE sessionID = ?",
    [sessionId],
    function (err) {
      if (err) {
        console.error("Error deleting drawings by session ID:", err);
        callback(false);
      }
      callback(true);
    }
  );
};

//insert drawing data
const insertDrawingData = (sessionID, data) => {
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
};

//gets all drawing data
const getAllDrawingData = (callback) => {
  db.all("SELECT * FROM drawings", (err, rows) => {
    if (err) {
      console.error("Error getting all drawing data:" + err);
      return;
    }
    callback(rows);
  });
};

//deletes all drawings
const clearCanvas = (callback) => {
  db.run("DELETE FROM drawings", (err) => {
    if (err) {
      console.log("Error clearing canvas: ", err);
      callback(false);
    }
    callback(true);
  });
};

// Add a new banned sessionID
function banSessionID(sessionID, callback) {
  db.run(
    "INSERT INTO bannedSessionsIDs (sessionID) VALUES (?)",
    [sessionID],
    (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
};

// Check if a sessionID is banned
function isSessionIDBanned(sessionID, callback) {
  db.get(
    "SELECT * FROM bannedSessionIDs WHERE sessionID = ?",
    [sessionID],
    (err, row) => {
      if (err) {
        callback(err);
      } else {
        callback(null, !!row);
      }
    });
};

// Remove a banned sessionID
function removeBannedSessionID(sessionID, callback) {
  db.run(
    "DELETE FROM bannedSessionIDs WHERE sessionID = ?",
    [sessionID],
    (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
}

//closes connection to database
const close = (callback) => {
  db.close((err) => {
    if (err) {
      console.log("Error closing database: ", err);
      callback(err);
    }
    console.log("Database connection closed successfully.");
    callback(null);
  });
};

function uniqueSessionIds (callback) {
  db.all('SELECT DISTINCT sessionID FROM drawings', (err, rows) => {
    if (err) {
      console.log("Error getting unique sessionIds: " + err)
      return;
    }
    callback(rows);
  });
}

module.exports = {
  insertDrawingData,
  getAllDrawingData,
  clearCanvas,
  close,
  deleteDrawingsBySessionID,
  banSessionID,
  isSessionIDBanned,
  removeBannedSessionID,
  uniqueSessionIds,
};
