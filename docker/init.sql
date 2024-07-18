CREATE DATABASE IF NOT EXISTS drawings_app;
USE drawings_app;

CREATE TABLE IF NOT EXISTS drawings (
    sessionID VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    x FLOAT,
    y FLOAT,
    color VARCHAR(50) DEFAULT '#000000',
    width FLOAT DEFAULT 5
    );

CREATE TABLE IF NOT EXISTS bannedSessionIDs(
    sessionID VARCHAR(255) PRIMARY KEY NOT NULL
    );
