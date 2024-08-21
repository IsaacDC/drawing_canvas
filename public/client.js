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

  document.getElementById("trash-btn").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all your drawings?")) {
      location.reload();
      socket.emit("trashDrawings");
    }
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

  // Update stroke color
  document
    .getElementById("stroke-color")
    .addEventListener("input", function () {
      color = this.value;
    });

  // Update stroke width
  function updateValues(value) {
    strokeWidth = value;
    document.getElementById("stroke-width").value = value;
    document.getElementById("slider-value").value = value;
    ctx.lineWidth = value;
  }

  document
    .getElementById("stroke-width")
    .addEventListener("input", function () {
      updateValues(this.value);
    });

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

  function drawLine(x1, y1, x2, y2, color, width, emit) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();

    if (emit) {
      socket.emit("draw", { x1, y1, x2, y2, color, width });
    }
  }

  // Incoming socket events
  socket.on("loadDrawingData", (drawingData) => {
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    drawingData.forEach((data) => {
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(data.x1, data.y1);
      offscreenCtx.lineTo(data.x2, data.y2);
      offscreenCtx.strokeStyle = data.color;
      offscreenCtx.lineWidth = data.width;
      offscreenCtx.lineCap = "round";
      offscreenCtx.stroke();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
  });

  socket.on("banUser", () => {
    alert("Your access has been revoked.");
    socket.disconnect();
  });

  socket.on("drawingLimitReached", () => {
    alert("Drawing limit reached. Please try again later.");
    isDrawing = false;
  });

  // draws on the non-drawing client(s) screen(s)
  socket.on("draw", (data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.width, false);
  });
});
