module.exports = {
  redisConfig: {
    host: "localhost",
    port: 6379,
  },
  database: {
    host: "localhost",
    user: "root",
    password: "Ironheat#03",
    database: "drawings_app",
  },
  server: {
    port: 3000,
  },
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
};
