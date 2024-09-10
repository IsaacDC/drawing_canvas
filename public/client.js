"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const offscreenCanvas = document.getElementById("offscreenCanvas");
  const offscreenCtx = offscreenCanvas.getContext("2d");

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let color = "#000000";
  let strokeWidth = 5;
  let pencilColor = color;
  let currentTool = "pencil";

  const canvasWidth = 1920;
  const canvasHeight = 1080;

  // Set up canvas
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;

  // Mouse events
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // Touch events
  canvas.addEventListener("touchstart", touchStart);
  canvas.addEventListener("touchmove", touchMove);
  canvas.addEventListener("touchend", stopDrawing);
  canvas.addEventListener("touchcancel", stopDrawing);

  loadDrawings();

  // Update stroke color
  document
    .getElementById("stroke-color")
    .addEventListener("input", function () {
      if (currentTool === "pencil") {
        color = this.value;
        pencilColor = color;
      }
    });

  // Deletes all of the users drawings
  document.getElementById("trash-btn").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all of your drawings?")) {
      socket.emit("trashDrawings");
    }
  });

  //Pencil Event Listener
  const pencilButton = document.getElementById("pencil-btn");
  pencilButton.addEventListener("click", function () {
    setActiveTool("pencil");
  });

  //Eraser event listener
  const eraserButton = document.getElementById("eraser-btn");
  eraserButton.addEventListener("click", function () {
    setActiveTool("eraser");
  });

  // Save image button
  document
    .getElementById("download-btn")
    .addEventListener("click", function () {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "drawing.png";

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

      tempCtx.drawImage(canvas, 0, 0);

      const tempImage = tempCanvas.toDataURL("image/png");

      link.href = tempImage;

      link.click();
    });

  // Update stroke width based on slider value
  document
    .getElementById("stroke-width-slider")
    .addEventListener("input", function () {
      updateValues(this.value);
    });

  // Update stroke width based on input value
  document
    .getElementById("slider-value")
    .addEventListener("input", function () {
      updateValues(this.value);
    });

  //gets the coordinates of the mouse in relation to the canvas
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.type.startsWith("mouse")) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    } else {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
  }

  // sets active tool with color and "active" class
  function setActiveTool(tool) {
    switch (tool) {
      case "pencil":
        pencilButton.classList.add("active");
        eraserButton.classList.remove("active");
        color = pencilColor;
        break;
      case "eraser":
        eraserButton.classList.add("active");
        pencilButton.classList.remove("active");
        color = "white";
        break;
    }
    currentTool = tool;
  }

  // Sets default active tool as pencil
  setActiveTool("pencil");

  // Update stroke width
  function updateValues(value) {
    strokeWidth = value;
    document.getElementById("stroke-width-slider").value = value;
    document.getElementById("slider-value").value = value;
    ctx.lineWidth = value;
  }

  function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    [lastX, lastY] = [x, y];

    drawLine(lastX, lastY, x, y, color, strokeWidth, true);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);

    drawLine(lastX, lastY, x, y, color, strokeWidth, true);

    [lastX, lastY] = [x, y];
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function touchStart(e) {
    if (e.touches.length === 1) {
      startDrawing(e);
    }
  }

  function touchMove(e) {
    if (e.touches.length === 1) {
      draw(e);
    }
  }

  function drawLine(startX, startY, endX, endY, color, width, emit) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();

    if (emit) {
      socket.emit("draw", { startX, startY, endX, endY, color, width });
    }
  }

  function loadDrawings() {
    fetch("/getDrawingData")
      .then((response) => response.json())
      .then((drawingData) => {
        offscreenCtx.clearRect(
          0,
          0,
          offscreenCanvas.width,
          offscreenCanvas.height
        );
        drawingData.forEach((data) => {
          offscreenCtx.beginPath();
          offscreenCtx.moveTo(data.startX, data.startY);
          offscreenCtx.lineTo(data.endX, data.endY);
          offscreenCtx.strokeStyle = data.color;
          offscreenCtx.lineWidth = data.width;
          offscreenCtx.lineCap = "round";
          offscreenCtx.stroke();
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0);
      })
      .catch((error) => {
        console.error("Error fetching drawing data:", error);
      });
  }

  // Incoming socket events
  socket.on("banUser", () => {
    socket.disconnect();
    alert("Your access has been revoked.");
  });

  socket.on("drawingLimitReached", () => {
    alert("Drawing limit reached. Please try again later.");
    isDrawing = false;
  });

  socket.on("updateCanvas", () => {
    loadDrawings();
  });

  // draws on the non-drawing client(s) screen(s)
  socket.on("draw", (data) => {
    drawLine(
      data.startX,
      data.startY,
      data.endX,
      data.endY,
      data.color,
      data.width,
      false
    );
  });

  // Obtain Username from server
  fetch("/getUsername")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("username").textContent = data.username;
    })
    .catch((error) => console.error("Error fetching username:", error));
});
