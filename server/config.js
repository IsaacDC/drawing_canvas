const URL = `http://localhost:`;

module.exports = {
  URL: URL,

  redisConfig: {
    host: "localhost",
    port: 6379,
  },
  database: {
    host: "localhost",
    user: "root",
    password: "password",
    database: "drawings_app",
  },
  server: {
    port: 3000,
    URL: URL,
  },
  cors: {
    origin: `${URL}3000`,
    credentials: true,
  },
};
