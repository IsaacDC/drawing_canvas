# Collaborative Drawing Canvas Application

This is a real-time drawing application built using Node.js, Express.js, and Socket.IO. The application allows users to collaborate on a shared canvas, with the ability to draw, change colors, and adjust stroke width.
## Features

- Real-time Drawing: Users can collaborate on a shared canvas, with their drawings being displayed in real-time to all connected clients.
- Drawing Tools: Users can choose the color and adjust the stroke width of their drawings.
- Drawings Saving and Loading: The application stores the drawing data in the database, allowing users to see the previous drawings when they reconnect.
- Drawing Limit: The application imposes a limit on the number of drawing events per minute, preventing spam or abuse.
- Admin panel to view all drawings, delete drawings, and ban/unban users

## Tech Stack

**Client:** HTML, CSS, JavaScript

**Server:** Node.js, Express.js, Socket.io

**Database** SQLite for local development and MySQL for production. The MySQL database is set up using Docker.

**Session Management** Redis
## Getting Started

### Prerequisites

- Node.js: Required for running the application
- Redis: Required for session management
- Docker and Docker Compose: Optional, only needed if you want to use MySQL in a container instead of SQLite


### Download Links:
- [Docker Desktop for windows](https://docs.docker.com/desktop/setup/install/windows-install/)

- [Docker Engine for Linux](https://docs.docker.com/desktop/setup/install/linux/)

- [Redis for windows](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-windows/)

- [Redis for Linux](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/)

### Installation

1. Clone the repo
```bash
git clone https://github.com/IsaacDC/drawing_canvas.git
```
2. Navigate to the project directory:
```bash
cd drawing_canvas
```
3. Install the necessary packages:
```bash
npm install
```

    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```bash
SERVER_HOST=
SERVER_PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
REDIS_HOST=
REDIS_PORT=
ADMIN_USERNAME=
ADMIN_PASSWORD=
NODE_ENV=
```


## Running locally

1. Setup environment variables

2. Navigate to root directory
```bash
cd drawing_canvas
```
3. Run this command:
```bash
node index.js
```


### Docker Setup (MYSQL):

- Ensure you have docker and docker-compose installed on your system.
- Navigate to the project directory and run the following command to start the MYSQL Docker container:

```bash
    docker compose up -d
```

This will create the necessary MySQL database container and set up the application.

To start the docker if it's not running, run the following command:

```bash
  docker start CONTAINER_NAME
```
## Usage

- Users can draw on the canvas using their mouse or touch device.
- The "Trash" button clears the user's drawings.
- The "Download" button allows the user to download their drawing as a PNG file.
- The admin panel allows you to view all drawings, delete drawings, and ban/unban users.
