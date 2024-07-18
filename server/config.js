const URL = `http://localhost:`;
const NODE_ENV = 'development';

module.exports = {
  URL: URL,
  NODE_ENV: NODE_ENV,

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
    port: 3000,
    URL: URL,
  },
  cors: {
    origin: `${URL}3000`,
    credentials: true,
  },
};
