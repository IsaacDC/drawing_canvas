const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("drawings.db");


db.serialize(() => {

  // Create the drawings table
  db.run(`CREATE TABLE IF NOT EXISTS drawings (
    id INT auto_increment,
    sessionID TEXT,
    type TEXT,
    x REAL,
    y REAL,
    color TEXT DEFAULT '#000000'
  )`);
});


const eraseDrawings = (sessionID) => {
  db.run("DELETE FROM drawings WHERE sessionID =?", [sessionID]);
}

const checkSessionID = (sessionID, callback) => {
  db.get("SELECT COUNT(*) AS count FROM drawings WHERE sessionID = ?", [sessionID], (err, row) => {
    if (err) {
      console.error("checkDrawingData error:", err);
      callback(false);
      return;
    }
    const exists = row.count > 0;
    callback(exists);
  });
};

//insert drawing data
const insertDrawingData = (sessionID, data) => {
  const { type, x, y, color } = data;
  db.run("INSERT INTO drawings (sessionID, type, x, y, color) VALUES (?, ?, ?, ?, ?)", [
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
  checkSessionID,
  insertDrawingData,
  getAllDrawingData,
  deleteAllDrawings,
  close,
  eraseDrawings,
};

