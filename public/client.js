"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect("http://127.0.0.1:3000");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;

  let isDrawing = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let color;
  const clients = {};
  let mode = "pencil";

  document.getElementById("pencil").addEventListener("click", function () {
    mode = "pencil";
  });

  document.getElementById("eraser").addEventListener("click", function () {
    mode = "eraser";
  });

  // mouse events
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  //Clears drawings
  const clearDrawings = document.getElementById("clear-all");
  clearDrawings.addEventListener("click", () => {
    if (confirm('Are you sure you want to clear all drawings?')) {
      location.reload();
      socket.emit("clearDrawings");
    }
  });

  //updates stroke color
  const colorPicker = document.getElementById("stroke-color");
  colorPicker.addEventListener("input", () => {
    color = colorPicker.value;
    socket.emit("changeStrokeColor", color);
  });

  const colorFields = document.querySelectorAll(".color-field");
  colorFields.forEach((colorField) => {
    colorField.addEventListener("click", () => {
      color = colorField.getAttribute('data-color');
      socket.emit("changeStrokeColor", color);
    });
  });

  //change stroke width
  const strokeWidth = document.getElementById("stroke-width");
  strokeWidth.addEventListener("input", () => {
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
    socket.emit("startDrawing", {
      x: lastMouseX,
      y: lastMouseY,
      width: strokeWidth.value,
    });
  }

  function draw(e) {
    if (!isDrawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    socket.emit("draw", { x: e.offsetX, y: e.offsetY });

    // if (mode === "pen") {
    //   ctx.globalCompositeOperation = "source-over";
    //   ctx.lineTo(e.offsetX, e.offsetY);
    //   ctx.stroke();
    //   socket.emit("draw", { x: e.offsetX, y: e.offsetY, mode: "pen" });
    // } else if (mode === "eraser") {
    //   ctx.globalCompositeOperation = "destination-out";
    //   ctx.beginPath();
    //   ctx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2);
    //   ctx.fill();
    //   socket.emit("draw", { x: e.offsetX, y: e.offsetY, mode: "eraser" });
    // }

    [lastMouseX, lastMouseY] = [e.offsetX, e.offsetY];
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    socket.emit("stopDrawing");
  }

  // Incoming socket events
  socket.on("loadDrawingData", (drawingData) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawingData.forEach((data) => {
      if (data.type === "start") {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.lineCap = "round";
      } else if (data.type === "draw") {
        ctx.lineTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (data.type === "stop") {
        ctx.beginPath();
      } 
      // else if (data.type === "erase") {
      //   ctx.globalCompositeOperation = "destination-out";
      //   ctx.beginPath();
      //   ctx.arc(data.x, data.y, data.eraserRadius, 0, Math.PI * 2);
      //   ctx.fill();
      // }
    });
  });

  //draws on the non-drawing client(s) screen(s)
  socket.on("startDrawing", ({ x, y, color, width }) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    isDrawing = true;
  });

  socket.on("draw", ({ x, y, color, width }) => {
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
  });
  // socket.on("draw", ({ x, y, color, width, mode, eraserRadius }) => {
  //   if (mode === "pen") {
  //     ctx.lineTo(x, y);
  //     ctx.strokeStyle = color;
  //     ctx.lineWidth = width;
  //     ctx.lineCap = "round";
  //     ctx.stroke();
  //   } else if (mode === "eraser") {
  //     ctx.globalCompositeOperation = "destination-out";
  //     ctx.beginPath();
  //     ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
  //     ctx.fill();
  //   }
  // });

  socket.on("stopDrawing", () => {
    isDrawing = false;
    ctx.beginPath();
  });

  socket.on("changeStrokeColor", ({ sessionId, color }) => {
    clients[sessionId] = color;
  });

  socket.on("changeStrokeWidth", ({ socketId, width }) => {
    if (socketId !== socket.id) {
      ctx.lineWidth = width;
    }
  });
});
