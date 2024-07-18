const config = require('../server/config');
const mysql = require('./mysql');
const sqlite = require('./sqlite');

let db;

if (config.NODE_ENV === 'development') {
    console.log('Using SQLite database');
    db = sqlite;
} else {
    console.log('Using MySQL database');
    db = mysql;
}

module.exports = db;