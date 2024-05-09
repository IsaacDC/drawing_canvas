const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('drawings.db');

// Create the 'drawings' table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    x REAL,
    y REAL,
    color TEXT
  )`);
});

// Insert a new drawing data
const insertDrawingData = (data) => {
  const { type, x, y, color } = data;
  db.run('INSERT INTO drawings (type, x, y, color) VALUES (?, ?, ?, ?)', [type, x, y, color]);
};

// Get all drawing data
const getAllDrawingData = (callback) => {
  db.all('SELECT * FROM drawings', (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    callback(rows);
  });
};

module.exports = {
  insertDrawingData,
  getAllDrawingData,
};