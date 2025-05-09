const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis").default;
const { v4: uuidv4 } = require("uuid");

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
redisClient.on("error", function (err) {
  console.log("Could not establish a connection to Redis" + err);
});
redisClient.on("connect", function () {
  console.log("Connected to Redis");
});

const sessionMiddleware = session({
  secret: process.env.REDIS_SECRET,
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : true,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  genid: (req) => uuidv4(),
});

const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };
