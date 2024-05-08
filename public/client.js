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

  // Handle mouse events using event delegation
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);

  function startDrawing(e) {
    isDrawing = true;
    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);
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

  // Handle incoming socket events
  socket.on("startDrawing", ({ x, y }) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing = true;
  });

  socket.on("draw", ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  socket.on("stopDrawing", () => {
    isDrawing = false;
    ctx.beginPath();
  });
  resizeCanvas();
});
