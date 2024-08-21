# Collaborative Drawing Canvas Application

This is a real-time drawing application built using Node.js, Express.js, and Socket.IO. The application allows users to collaborate on a shared canvas, with the ability to draw, change colors, and adjust stroke width.


## Features

- Real-time Drawing: Users can collaborate on a shared canvas, with their drawings being displayed in real-time to all connected clients.
- Drawing Tools: Users can choose the color and adjust the stroke width of their drawings.
- Drawings Saving and Loading: The application stores the drawing data in the database, allowing users to see the previous drawings when they reconnect.
- Drawing Limit: The application imposes a limit on the number of drawing events per minute, preventing spam or abuse.


## Installation

Clone the repository:
```bash
git clone https://github.com/IsaacDC/drawing_canvas
```
Install dependencies:
```bash
cd drawing-app
npm install
```

Start the server:
```bash
npm app.js
```

Access the application at http://localhost:3000 (or the configured port).
    
## Usage/Examples

```javascript
import Component from 'my-project'

function App() {
  return <Component />
}
```

