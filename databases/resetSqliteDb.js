const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("drawings.db");

// Used to reset the schema
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS drawings", (err) => {
    if (err) {
      console.error("Error dropping table:", err.message);
    } else {
      console.log("Table 'drawings' dropped successfully.");
    }

    // Close the database connection after operation
    db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  });
});
