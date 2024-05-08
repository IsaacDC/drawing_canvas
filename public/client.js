document.addEventListener("DOMContentLoaded", () => {
  var socket;
  socket = io.connect("http://127.0.0.1:3000");

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", onResize, false);
  onResize();

  let drawing = false;
  let x;
  let y;

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
});
