CREATE DATABASE IF NOT EXISTS drawings_app;
USE drawings_app;
CREATE TABLE IF NOT EXISTS users (
    sessionId VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS drawings (
    sessionId VARCHAR (255) NOT NULL,
    startX FLOAT,
    startY FLOAT,
    endX FLOAT,
    endY FLOAT,
    color VARCHAR(50) DEFAULT '#000000',
    width FLOAT DEFAULT 5,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sessionId) REFERENCES users(sessionId)
);
CREATE INDEX IF NOT EXISTS idx_drawings_session ON drawings (sessionId);