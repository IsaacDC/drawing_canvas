"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect("http://127.0.0.1:3000");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  //resize canvas
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

  //updates stroke color
  const colorPicker = document.getElementById("strokeColor");
  colorPicker.addEventListener("input", () => {
    color = colorPicker.value;
    socket.emit("changeStrokeColor", color);
  });

  //begins the drawing process (when mouse down)
  function startDrawing(e) {
    isDrawing = true;
    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);
    ctx.strokeStyle = color;
    socket.emit("startDrawing", { x: lastMouseX, y: lastMouseY });
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

  // incoming socket events
  socket.on("loadDrawingData", (drawingData) => {
    drawingData.forEach((data) => {
      if (data.type === "start") {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.strokeStyle = data.color;
      } else if (data.type === "draw") {
        ctx.lineTo(data.x, data.y);
        ctx.strokeStyle = data.color;
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

  socket.on("changeStrokeColor", ({ socketId, color }) => {
    clients[socketId] = color;
  });

  resizeCanvas();
});
