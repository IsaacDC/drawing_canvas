CREATE DATABASE IF NOT EXISTS drawings_app;
USE drawings_app;

CREATE TABLE IF NOT EXISTS drawings (
    sessionID VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    x1  FLOAT,
    y1 FLOAT,
    x2 FLOAT,
    y2 FLOAT,
    color VARCHAR(50) DEFAULT '#000000',
    width FLOAT DEFAULT 5,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS bannedSessions(
    sessionID VARCHAR(255) PRIMARY KEY NOT NULL
    );
