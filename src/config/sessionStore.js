const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis").default;
const { v4: uuidv4 } = require("uuid");

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on("error", function (err) {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", function () {
  console.log("Successfully connected to Redis");
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key-here",
  store: new RedisStore({
    client: redisClient,
    prefix: "session:",
    ttl: 30 * 24 * 60 * 60,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "trueF",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
  },
  genid: (req) => uuidv4(),
});

const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };
