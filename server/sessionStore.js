const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis").default;
const { v4: uuidv4 } = require("uuid");

const config = require("./config");

const redisClient = new Redis({
  host: config.redisConfig.host,
  port: config.redisConfig.port,
});
redisClient.on("error", function (err) {
  console.log("Could not establish a connection to Redis" + err);
});
redisClient.on("connect", function() {
  console.log("Connected to Redis");
});

const sessionMiddleware = session({
  secret: "secret",
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === config.NODE_ENV,
    sameSite: true,
    maxAge:  30 * 24 * 60 * 60 * 1000, // 30 days
  },
  genid: (req) => uuidv4(),
});

const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };
