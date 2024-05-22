const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("drawings.db");


db.serialize(() => {

  // Create the drawings table
  db.run(`CREATE TABLE IF NOT EXISTS drawings (
    sessionID TEXT,
    type TEXT,
    x REAL,
    y REAL,
    color TEXT DEFAULT '#000000',
    width INTEGER DEFAULT 5,
    linecap text DEFAULT 'round'
  )`);
});

//deletes all drawings for a specific session ID
const deleteDrawingsBySessionID = (sessionId, callback) => {
  db.run("DELETE FROM drawings WHERE sessionID = ?", [sessionId], function(err) {
    if (err) {
      console.error("deleteDrawingsBySessionID: " + err);
      callback(false);
      return;
    }
    callback(true);
  });
};

//insert drawing data
const insertDrawingData = (sessionID, data) => {
  const { type, x, y, color, width } = data;
  db.run("INSERT INTO drawings (sessionID, type, x, y, color, width) VALUES (?, ?, ?, ?, ?, ?)", [
    sessionID,
    type,
    x,
    y,
    color,
    width,
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
const clearCanvas = () => {
  db.run("DELETE FROM drawings", (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("All drawings deleted");
  });
};

//closes connection to database
const close = (callback) => {
  db.close((err) => {
    if (err) {
      console.log(err);
      return;
    }
    callback();
  });
};

module.exports = {
  insertDrawingData,
  getAllDrawingData,
  clearCanvas,
  close,
  deleteDrawingsBySessionID
};

