document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect("http://127.0.0.1:3000");
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  let drawing = false;
  let x;
  let y;

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    ctx.moveTo(x, y);
    socket.emit("down", {x , y });
  });

  canvas.addEventListener("mouseup", (e) => {
    drawing = false;
    
  });

  socket.on("ondraw", ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  socket.on("ondown", ({ x, y }) => {
    ctx.moveTo(x, y);
  });

  canvas.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;

    if (!drawing) return;

    socket.emit("draw", {x, y});
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  resizeCanvas();
});
