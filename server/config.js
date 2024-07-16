const URL = `http://localhost:`;
const NODE_ENV = 'development';

module.exports = {
  URL: URL,
  NODE_ENV: NODE_ENV,

  redisConfig: {
    host: "172.31.164.107",
    port: 6379,
  },
  database: {
    host: "localhost",
    user: "root",
    password: "",
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
