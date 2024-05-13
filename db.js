const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("drawings.db");

//create drawings table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    x REAL,
    y REAL,
    color TEXT
  )`);
});

//insert drawing data
const insertDrawingData = (data) => {
  const { type, x, y, color } = data;
  db.run("INSERT INTO drawings (type, x, y, color) VALUES (?, ?, ?, ?)", [
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
      console.error(err);
      return;
    }
    callback(rows);
  });
};

const deleteAllDrawings = () => {
  db.run("DELETE * FROM drawings", (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("all drawings delete");
  });
};

module.exports = {
  insertDrawingData,
  getAllDrawingData,
  deleteAllDrawings,
};
