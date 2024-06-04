"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const socket = io.connect("http://127.0.0.1:3000");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;

  let isDrawing = false;
  let isErasing = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let clients = {};
  var color;

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // mouse events
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", debounce(draw, 10));
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // touch events
  canvas.addEventListener("touchstart", startDrawing);
  canvas.addEventListener("touchmove", debounce(draw, 10));
  canvas.addEventListener("touchend", stopDrawing);
  canvas.addEventListener("touchcancel", stopDrawing);

  //Clears drawings
  const clearDrawings = document.getElementById("clear-all");
  clearDrawings.addEventListener("click", () => {
    if (confirm('Are you sure you want to clear all drawings?')) {
      location.reload();
      socket.emit("clearDrawings");
    }
  });

  const eraseToggle = document.getElementById("eraser");
  eraseToggle.addEventListener("click", () => {
    isErasing = !isErasing;
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

  //begins the drawing process
  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    // Mouse events
    if (e.type.startsWith("mouse")) {
      [x, y] = [e.offsetX, e.offsetY];
    }
    // Touch events
    else {
      const touch = e.touches[0];
      [x, y] = [touch.clientX - rect.left, touch.clientY - rect.top];
    }

    [lastMouseX, lastMouseY] = [x, y];

    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);

    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineCap = "round";
    ctx.lineWidth = strokeWidth.value;

    socket.emit("startDrawing", {
      x: lastMouseX,
      y: lastMouseY,
      width: strokeWidth.value,
      isErasing,
    });
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    let x, y;

    // mouse events
    if (e.type.startsWith("mouse")) {
      [x, y] = [e.offsetX, e.offsetY];
    }
    // touch events
    else {
      const touch = e.touches[0];
      [x, y] = [touch.clientX - rect.left, touch.clientY - rect.top];
    }

    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 0)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    socket.emit("draw", { x, y, isErasing });
    [lastMouseX, lastMouseY] = [x, y];
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();
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
    });
  });

  //draws on the non-drawing client(s) screen(s)
  socket.on("startDrawing", ({ x, y, color, width, isErasing }) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)"; 
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    isDrawing = true;
  });

  socket.on("draw", ({ x, y, color, width, isErasing }) => {
    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)"; 
    } else {
      ctx.globalCompositeOperation = "source-over"; 
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
  });

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
