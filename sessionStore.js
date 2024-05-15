const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const { v4: uuidv4 } = require("uuid");

const sessionStore = new SQLiteStore({
    db: "./drawings.db",
    concurrentDB: true, // Enable concurrent sessions
});

const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    genid: (req) => uuidv4(),
    store: sessionStore,
});

const wrap = (expressMiddleware) => (socket, next) =>
    expressMiddleware(socket.request, {}, next);

module.exports = {sessionMiddleware, wrap, sessionStore};
