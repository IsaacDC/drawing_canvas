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
  let clients = {};
  let mode = "pencil";
  var color;

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
    if (confirm('Are you sure you want to clear all drawings?')) {
      location.reload();
      socket.emit("clearDrawings");
    }
  });

  $("#pencil").click(function () { mode = "pencil"; });
  $("#eraser").click(function () { mode = "eraser"; });

  //updates stroke color
  $("#stroke-color").on("input", () => {
    color = $("#stroke-color").val();
    socket.emit("changeStrokeColor", color);
  })

  $(".color-field").on("click", function () {
    color = $(this).data("color");
    socket.emit("changeStrokeColor", color);
  });

  //change stroke width
  $("#stroke-width").on("input", () => {
    ctx.lineWidth = $("#stroke-width").val();
    socket.emit("changeStrokeWidth", $("#stroke-width").val());
  });

  //begins the drawing process
  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;

    if (mode == "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    const rect = canvas.getBoundingClientRect();
    let x, y;

    // Mouse events
    if (e.type.startsWith("mouse")) {
      [x, y] = [e.offsetX, e.offsetY];
    }
    else {  // Touch events
      const touch = e.touches[0];
      [x, y] = [touch.clientX - rect.left, touch.clientY - rect.top];
    }

    [lastMouseX, lastMouseY] = [x, y];

    ctx.beginPath();
    ctx.moveTo(lastMouseX, lastMouseY);
    ctx.lineCap = "round";
    ctx.lineWidth = $("#stroke-width").val();

    socket.emit("startDrawing", {
      x: lastMouseX,
      y: lastMouseY,
      width: $("#stroke-width").val(),
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

    if (mode === "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = $("#stroke-width").val();
      ctx.lineCap = "round";
      ctx.stroke();
      socket.emit("draw", { x, y });
    } else if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.lineTo(x, y);
      ctx.lineCap = "round";
      ctx.stroke();
      socket.emit("erase", { x, y, width: $("#stroke-width").val() });
    }

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
  socket.on("startDrawing", ({ x, y, color, width }) => {
    if (mode == "pencil") {
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    isDrawing = true;
  });

  socket.on("draw", ({ x, y, color, width, mode }) => {
    if (mode == "pencil") {
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.globalCompositeOperation = "destination-out";
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
