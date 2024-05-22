"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect("http://127.0.0.1:3000");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let isDrawing = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let color;
  const clients = {};

  // mouse events
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);

  //Clears drawings
  const eraseDrawings = document.getElementById("clear");
  eraseDrawings.addEventListener("click", () => {
    socket.emit("clearDrawings");
  });

  //updates stroke color
  const colorPicker = document.getElementById("stroke-color");
  colorPicker.addEventListener("input", () => {
    color = colorPicker.value;
    socket.emit("changeStrokeColor", color);
  });

  const colorFields = document.querySelectorAll('.color-field');
  colorFields.forEach((colorField) => {
    colorField.addEventListener('click', () => {
      color = colorField.style.backgroundColor;
      socket.emit("changeStrokeColor", color);
    });
  });

  //change stroke width
  const strokeWidth = document.getElementById('stroke-width');
  strokeWidth.addEventListener('input', () => {
    ctx.lineWidth = strokeWidth.value;
    socket.emit("changeStrokeWidth", strokeWidth.value);
  });

  //begins the drawing process (when mouse down)
  function startDrawing(e) {
    isDrawing = true;
    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = strokeWidth.value;
    socket.emit("startDrawing", { x: lastMouseX, y: lastMouseY, width: strokeWidth.value });;
  }

  //draws as mouse drags
  function draw(e) {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    socket.emit("draw", { x: e.offsetX, y: e.offsetY });
    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
  }

  //stops drawing when mouse up
  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    socket.emit("stopDrawing");
  }

  // Incoming socket events
  socket.on("loadDrawingData", (drawingData) => {
    drawingData.forEach((data) => {
      if (data.type === "start") {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.lineCap = data.linecap;
      } else if (data.type === "draw") {
        ctx.lineTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.lineCap = data.linecap;
        ctx.stroke();
      } else if (data.type === "stop") {
        ctx.beginPath();
      }
    });
  });

  //draws on the non-drawing client(s) screen(s)
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


  socket.on("changeStrokeColor", ({ sessionId, color }) => {
    clients[sessionId] = color;
  });

  socket.on('changeStrokeWidth', ({ socketId, width }) => {
    if (socketId !== socket.id) {
      ctx.lineWidth = width;
    }
  });


  //resize canvas
  const resizeCanvas = () => {
    canvas.width = window.innerWidth - 60;
    canvas.height = window.innerHeight - 150;
  };

  resizeCanvas();
});
