const DOMAIN = `127.0.0.1`;
const PORT = 3000;
const NODE_ENV = "development";

module.exports = {
  domain: DOMAIN,
  NODE_ENV: NODE_ENV,
  PORT: PORT,

  redisConfig: {
    host: "127.0.0.1",
    port: 6379,
  },
  database: {
    host: "localhost",
    user: "root",
    password: "password",
    database: "drawings_app",
  },
  server: {
    port: PORT,
    domain: DOMAIN,
  },
  cors: {
    origin: `http://${DOMAIN}:${PORT}`,
    credentials: true,
  },
};
