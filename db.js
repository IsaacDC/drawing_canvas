const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("drawings.db");

//create drawings table
db.serialize(() => {
  // Create the users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    sessionID TEXT PRIMARY KEY,
    strokeColor TEXT
  )`);

  // Create the drawings table
  db.run(`CREATE TABLE IF NOT EXISTS drawings (
    sessionID TEXT PRIMARY KEY,
    type TEXT,
    x REAL,
    y REAL,
    color TEXT,
    FOREIGN KEY (sessionID) REFERENCES users(sessionID)
  )`);
});

//
const checkSessionID = (sessionID, callback) => {
  db.get("SELECT * FROM users WHERE sessionID = ?", [sessionID], (err, row) => {
    if (err) {
      console.error("checkSessionID" + err);
      return;
    }
    callback(row);
  });
};

const insertUserData = (sessionID, strokeColor) => {
  db.run("INSERT OR REPLACE INTO users (sessionID, strokeColor) VALUES (?, ?)", [sessionID, strokeColor]);
};

const changeStrokeColor = (sessionID, strokeColor) => {
  db.run("UPDATE users SET strokeColor = ? WHERE sessionID = ?", [strokeColor, sessionID]);
};

const getUserStrokeColor = (sessionID, callback) => {
  db.get("SELECT strokeColor FROM users WHERE sessionID = ?", [sessionID], (err, row) => {
    if (err) {
      console.error("getUserStrokeColor" + err);
      return;
    }
    callback(row ? row.strokeColor : null);
  });
};

//insert drawing data
const insertDrawingData = (sessionID, data) => {
  const { type, x, y, color } = data;
  db.run("INSERT INTO drawings (sessionID, type, x, y, color) VALUES (?, ?, ?, ?)", [
    sessionID,
    type,
    x,
    y,
    color,
  ]);
};

//gets all drawing data
const getAllDrawingData = (callback) => {
  db.all("SELECT * FROM drawings", (err, rows) => {
    if (err) {
      console.error("getAllDrawingData" + err);
      return;
    }
    callback(rows);
  });
};


//deletes all drawings
const deleteAllDrawings = () => {
  db.run("DELETE * FROM drawings", (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("all drawings deleted");
  });
};

module.exports = {
  insertUserData,
  insertDrawingData,
  getAllDrawingData,
  deleteAllDrawings,
  checkSessionID,
  getUserStrokeColor,
  changeStrokeColor,
};

