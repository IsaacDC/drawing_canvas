const config = require('../server/config');
const sqlite = require('./mysql');
const mysql = require('./sqlite');

let db;

if (config.NODE_ENV === 'development') {
    console.log('Using SQLite database');
    db = sqlite;
} else {
    console.log('Using MySQL database');
    db = mysql;
}

module.exports = db;