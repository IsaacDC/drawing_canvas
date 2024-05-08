"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect("http://127.0.0.1:3000");
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  let isDrawing = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let color;
  const clients = {};

  // mouse events
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);

  const colorPicker = document.getElementById('strokeColor');
  colorPicker.addEventListener('input', () => {
      color = colorPicker.value;
      socket.emit('changeStrokeColor', color);
  });


  function startDrawing(e) {
    isDrawing = true;
    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);
    ctx.strokeStyle = color;
    socket.emit("startDrawing", { x: lastMouseX, y: lastMouseY });
  }

  function draw(e) {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    socket.emit("draw", { x: e.offsetX, y: e.offsetY });
    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    socket.emit("stopDrawing");
  }

  // incoming socket events
  socket.on('loadDrawingData', ( drawingData, clients) => {
    Object.assign(clients, clients);
    drawingData.forEach(drawingPoint => {
        if (drawingPoint.type === 'start') {
            ctx.beginPath();
            ctx.moveTo(drawingPoint.x, drawingPoint.y);
            ctx.strokeStyle = drawingPoint.color;
        } else if (drawingPoint.type === 'draw') {
            ctx.lineTo(drawingPoint.x, drawingPoint.y);
            ctx.strokeStyle = drawingPoint.color;
            ctx.stroke();
        } else if (drawingPoint.type === 'stop') {
            ctx.beginPath();
        }
    });
});

  socket.on("startDrawing", ({ x, y, color }) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    isDrawing = true;
  });

  socket.on("draw", ({ x, y, color }) => {
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.stroke();
  });

  socket.on("stopDrawing", () => {
    isDrawing = false;
    ctx.beginPath();
  });

  socket.on('changeStrokeColor', ({ socketId, color }) => {
    clients[socketId] = color;
});

  resizeCanvas();

});
