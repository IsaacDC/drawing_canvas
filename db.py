import sqlite3

# Create a connection to the SQLite database
conn = sqlite3.connect("drawings.db", check_same_thread=False)

# Create the 'drawings' table if it doesn't exist
with conn:
    conn.execute(
        """CREATE TABLE IF NOT EXISTS drawings
             (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, x REAL, y REAL, color TEXT)"""
    )


# Function to insert a new drawing data
def insert_drawing_data(data):
    type, x, y, color = data
    conn.execute(
        "INSERT INTO drawings (type, x, y, color) VALUES (?, ?, ?, ?)",
        (type, x, y, color),
    )
    conn.commit()


# Function to get all drawing data
def get_all_drawing_data():
    with conn:
        c = conn.cursor()
        c.execute("SELECT * FROM drawings")
        return c.fetchall()


# Function to delete all data from the 'drawings' table
def delete_all_data():
    conn.execute("DELETE FROM drawings")
    conn.commit()
