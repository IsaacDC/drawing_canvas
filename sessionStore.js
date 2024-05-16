const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis").default;
const { v4: uuidv4 } = require("uuid");

const redisClient = new Redis();

const sessionMiddleware = session({
    secret: 'secret',
    store: new RedisStore({client: redisClient}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    genid: (req) => uuidv4(),
});

const wrap = (expressMiddleware) => (socket, next) =>
    expressMiddleware(socket.request, {}, next);

module.exports = {sessionMiddleware, wrap};
