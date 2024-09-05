# Collaborative Drawing Canvas Application

This is a real-time drawing application built using Node.js, Express.js, and Socket.IO. The application allows users to collaborate on a shared canvas, with the ability to draw, change colors, and adjust stroke width.

## Features

- Real-time Drawing: Users can collaborate on a shared canvas, with their drawings being displayed in real-time to all connected clients.
- Drawing Tools: Users can choose the color and adjust the stroke width of their drawings.
- Drawings Saving and Loading: The application stores the drawing data in the database, allowing users to see the previous drawings when they reconnect.
- Drawing Limit: The application imposes a limit on the number of drawing events per minute, preventing spam or abuse.
- Admin panel to view all drawings, delete drawings, and ban/unban users

## Tech Stack

**Client:** HTML, CSS, JAvaScript, Canvas API

**Server:** Node.js, Express.js, Socket.io

**Database** SQLite for local development and MySQL for production. The MySQL database is set up using Docker.

**Session Management** Redis

## Installation

Navigate to the project directory:
```bash
  cd drawing_canvas
```

Install the necessary packages:
```bash
    npm install
```
    
### Docker Setup (MYSQL):
- Ensure you have docker and docker-compose installed on your system.
- Navigate to the 'docker' directory and run the following command to start the MYSQL Docker container:
```bash
    docker-compose up -d
```
This will create the necessary MySQL database container and set up the application.

To start the docker if it's not running, run the following command:
```bash
  docker start CONTAINER_NAME
```


## Config Setup:

Navigate to the config file in the server directory:
```bash
    cd server/config.js
```
Here you're able to change the configuration settings to reflect the IPs of the services that are required:

1. **DOMAIN**: Replace with the actual domain or IP address of your server.

``` javascript
    const DOMAIN = `your-server-domain-or-ip:`;
```
2. **PORT**: Replace with the actual port of server.
```javascript
    const PORT = `your-port`
```
3. **NODE_ENV**: Change from `'development'` to `'production'`.
```javascript
    const NODE_ENV = 'production';
```
4. **Redis Config**: Update the Redis host to the server's Redis instance address if it's not running on the same server or if you're using a managed Redis service.
```javascript
    redisConfig: {
        host: "redis-server-domain-or-ip",
        port: 6379, // Keep the port the same if unchanged
    },
```
5. **Database Config**: Update the host, user, password, and database settings to match the production database credentials and host.
```javascript
    database: {
        host: "database-server-domain-or-ip",
        user: "some-username",
        password: "some-password",
        database: "some-database-name",
    },
```
6. **CORS**: Ensure the 'origin' value is set to the correct serve domain and port.
```javascript
cors: {
      origin: `http://${DOMAIN}:${PORT}`, // Replace with your production server's DOMAIN and port
  credentials: true,
},
```

## Testing

This project uses a flexible database configuration that allows easy switching between SQLite and MySQL:

- Development: SQLite is used by default when `NODE_ENV` is set to 'development'
- Production: MySQL is used when `NODE_ENV` is set to 'production'

To switch between databases, simply change the `NODE_ENV` variable in `server/config.js`.

I have it this way because SQLite requires no setup, making it ideal for local development and testing, but when its ready for deployment, MySQL offers better performance and scalability.

1. Connect to the MySQL database using a client of your choice (e.g., MySQL Workbench, DBeaver, or the MySQL command-line client).

- Host: `localhost`
- Port: `3306`
- Username: `root`
- Password: `some-password`

2. Verify that the `drawings_app` database and the `drawings` and `bannedSessions` tables have been created.

3. Use the application to interact with the database through the provided API endpoints.

## Usage

- Users can draw on the canvas using their mouse or touch device.
- The "Trash" button clears the user's drawings.
- The "Download" button allows the user to download their drawing as a PNG file.
- The admin panel allows you to view all drawings, delete drawings, and ban/unban users.