# Collaborative Drawing Canvas Application

This is a real-time drawing application built using Node.js, Express.js, and Socket.IO. The application allows users to collaborate on a shared canvas, with the ability to draw, change colors, and adjust stroke width.


## Features

- Real-time Drawing: Users can collaborate on a shared canvas, with their drawings being displayed in real-time to all connected clients.
- Drawing Tools: Users can choose the color and adjust the stroke width of their drawings.
- Drawings Saving and Loading: The application stores the drawing data in the database, allowing users to see the previous drawings when they reconnect.
- Drawing Limit: The application imposes a limit on the number of drawing events per minute, preventing spam or abuse.


## Run Locally

Clone the project

```bash
  git clone https://github.com/IsaacDC/drawing_canvas
```

Go to the project directory

```bash
  cd drawing_canvas
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node app.js
```


## Tech Stack

**Client:** HTML, CSS, JAvaScript, Canvas API

**Server:** Node.js, Express.js, Socket.io

**Database** SQLite for local development and MySQL for production. The MySQL database is set up using Docker.

**Session Management:** Redis

## Installation

Docker Setup (MYSQL):
- Ensure you have docker installed on your system.
-Navigate to the project drectory and run the following command to start the MYSQL Docker container:
    