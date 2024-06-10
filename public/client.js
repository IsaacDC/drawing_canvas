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

  const $eraserBtn = $("#eraser");
  const $pencilBtn = $("#pencil");

  $eraserBtn.click(function() {
    $eraserBtn.addClass('active');
    $pencilBtn.removeClass('active');
    mode = "eraser";
  });

  $pencilBtn.click(function() {
    $pencilBtn.addClass('active');
    $eraserBtn.removeClass('active');
    mode = "pencil";
  });

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
  function updateValues(value) {
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
    if (value > 100) {
      value = 100;
    } else if (value < 1) {
      value = 1;
    }
    updateValues(value);
  });
  // invalid stroke value handler
  $("#slider-value").on("blur", function () {
    let value = $(this).val();
    if (value > 100) {
      value = 100;
    } else if (value < 1) {
      value = 1;
    }
    updateValues(value);
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
    else {  // Touch events
      const touch = e.touches[0];
      [x, y] = [touch.clientX - rect.left, touch.clientY - rect.top];
    }

    [lastMouseX, lastMouseY] = [x, y];

    if (mode == "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(lastMouseX, lastMouseY);
      ctx.lineCap = "round";
      ctx.lineWidth = $("#stroke-width").val();
      ctx.strokeStyle = color;

      socket.emit("startDrawing", {
        x: lastMouseX,
        y: lastMouseY,
        width: $("#stroke-width").val(),
      });

    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(lastMouseX, lastMouseY);
      ctx.lineCap = "round";
      ctx.lineWidth = $("#stroke-width").val();

      socket.emit("startErasing", {
        x: lastMouseX,
        y: lastMouseY,
        width: $("#stroke-width").val(),
      });
    }

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
      ctx.stroke();
      socket.emit("draw", { x, y });
    } else if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineTo(x, y);
      ctx.stroke();
      socket.emit("erase", { x, y });
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
      } else if (data.type == "startErasing") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.lineWidth = data.width;
        ctx.lineCap = "round";
      } else if (data.type === "draw") {
        ctx.lineTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (data.type === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineTo(data.x, data.y);
        ctx.lineWidth = data.width;
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (data.type === "stop") {
        ctx.beginPath();
      }
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

    socket.on("draw", ({ x, y, color, width }) => {
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    });

    socket.on("erase", ({ x, y, width }) => {
      ctx.lineTo(x, y);
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
})
