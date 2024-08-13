"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;

  let isDrawing = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let color = "#000000";
  let strokeWidth = 5;

  // mouse events
  $(canvas).on("mousedown", startDrawing);
  $(canvas).on("mousemove", draw);
  $(canvas).on("mouseup", stopDrawing);
  $(canvas).on("mouseleave", stopDrawing);

  // touch events
  $(canvas).on("touchstart", startDrawing);
  $(canvas).on("touchmove", draw);
  $(canvas).on("touchend", stopDrawing);
  $(canvas).on("touchcancel", stopDrawing);

  //Clears drawings
  $("#clear-all").on("click", () => {
    if (confirm("Are you sure you want to clear all drawings?")) {
      location.reload();
      socket.emit("clearDrawings");
    }
  });

  //updates stroke color
  $("#stroke-color").on("input", () => {
    color = $("#stroke-color").val();
    socket.emit("changeStrokeColor", color);
  });

  //change stroke width
  function updateValues(value) {
    strokeWidth = value;
    $("#stroke-width").val(value);
    $("#slider-value").val(value);
    ctx.lineWidth = value;
    socket.emit("changeStrokeWidth", value);
  }
  // Update input value and stroke width when slider changes
  $("#stroke-width").on("input", function () {
    const value = $(this).val();
    updateValues(value);
  });
  // Update slider and stroke width when input value changes
  $("#slider-value").on("input", function () {
    let value = $(this).val();
    value = Math.max(0, Math.min(value, 100));
    updateValues(value);
  });
  // invalid stroke value handler
  $("#slider-value").on("blur", function () {
    let value = $(this).val();
    if (value === "" || value < 1) {
      value = 1;
    } else {
      value = Math.min(value, 100);
    }
    updateValues(value);
  });

  //begins the drawing process
  // function startDrawing(e) {
  //   e.preventDefault();
  //   isDrawing = true;

  //   const rect = canvas.getBoundingClientRect();
  //   let x, y;

  //   // Mouse events
  //   if (e.type.startsWith("mouse")) {
  //     [x, y] = [e.offsetX, e.offsetY];
  //   } else {
  //     // Touch events
  //     const touch = e.touches[0];
  //     [x, y] = [touch.clientX - rect.left, touch.clientY - rect.top];
  //   }

  //   [lastMouseX, lastMouseY] = [x, y];

  //   ctx.beginPath();
  //   ctx.moveTo(lastMouseX, lastMouseY);
  //   ctx.lineCap = "round";
  //   ctx.lineWidth = strokeWidth;
  //   ctx.strokeStyle = color;

  //   socket.emit("startDrawing", {
  //     x: lastMouseX,
  //     y: lastMouseY,
  //     color,
  //     width: $("#stroke-width").val(),
  //   });
  // }

  // function draw(e) {
  //   if (!isDrawing) return;
  //   e.preventDefault();

  //   const rect = canvas.getBoundingClientRect();
  //   let x, y;

  //   // mouse events
  //   if (e.type.startsWith("mouse")) {
  //     [x, y] = [e.offsetX, e.offsetY];
  //   }
  //   // touch events
  //   else {
  //     const touch = e.touches[0];
  //     [x, y] = [touch.clientX - rect.left, touch.clientY - rect.top];
  //   }

  //   ctx.lineTo(x, y);
  //   ctx.stroke();

  //   socket.emit("draw", { x, y, color, width: strokeWidth });
  // }

  // function stopDrawing(e) {
  //   if (!isDrawing) return;
  //   e.preventDefault();
  //   isDrawing = false;
  //   ctx.beginPath();
  //   socket.emit("stopDrawing");
  // }
  function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    [lastMouseX, lastMouseY] = [x, y];

    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);
    ctx.lineCap = "round";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = color;

    socket.emit("startDrawing", {
      x: lastMouseX,
      y: lastMouseY,
      color,
      width: strokeWidth,
    });
  }
  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw", { x, y, color, width: strokeWidth });
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.beginPath();
    socket.emit("stopDrawing");
  }

  let activeDrawings = new Map();

  function createNewPath(socketId, color, width) {
    let path = new Path2D();
    activeDrawings.set(socketId, { path, color, width });
    return path;
  }

  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.type.startsWith("mouse")) {
      return { x: e.offsetX, y: e.offsetY };
    } else {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  }

  // Incoming socket events
  socket.on("loadDrawingData", (drawingData) => {
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

  socket.on("banUser", () => {
    alert("Your access has been revoked.");
    socket.disconnect();
  });

  // draws on the non-drawing client(s) screen(s)
  // socket.on("startDrawing", ({ x, y, color, width }) => {
  //   ctx.beginPath();
  //   ctx.moveTo(x, y);
  //   ctx.strokeStyle = color;
  //   ctx.lineWidth = width;
  //   ctx.lineCap = "round";
  //   isDrawing = true;
  // });

  // socket.on("draw", ({ x, y, color, width }) => {
  //   ctx.lineTo(x, y);
  //   ctx.strokeStyle = color;
  //   ctx.lineWidth = width;
  //   ctx.lineCap = "round";
  //   ctx.stroke();
  // });

  // socket.on("stopDrawing", () => {
  //   isDrawing = false;
  //   ctx.beginPath();
  // });

  socket.on("startDrawing", ({ x, y, color, width, socketId }) => {
    if (socketId === socket.id) return;
    let path = createNewPath(socketId, color, width);
    path.moveTo(x, y);
  });

  socket.on("draw", ({ x, y, color, width, socketId }) => {
    if (socketId === socket.id) return;
    let drawingState = activeDrawings.get(socketId);
    if (drawingState) {
      drawingState.path.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke(drawingState.path);
    }
  });

  socket.on("stopDrawing", ({ socketId }) => {
    if (socketId === socket.id) return;
    activeDrawings.delete(socketId);
  });

  socket.on("changeStrokeColor", ({ socketId, color }) => {
    if (socketId !== socket.id) {
      ctx.strokeStyle = color;
    }
  });

  socket.on("changeStrokeWidth", ({ socketId, width }) => {
    if (socketId !== socket.id) {
      ctx.lineWidth = width;
    }
  });
});
