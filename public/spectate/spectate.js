"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const offscreenCanvas = document.getElementById("offscreenCanvas");
  const offscreenCtx = offscreenCanvas.getContext("2d");

  const canvasWidth = 1920;
  const canvasHeight = 1080;

  // Set up canvas
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;

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
});
