document.addEventListener('DOMContentLoaded', () => {
    var socket;

    socket = io.connect('http://127.0.0.1:3000');

    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    function startPosition(e) {
        drawing = true;
        draw(e);
    }

    function finishedPosition() {
        drawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);

        var data = {
            x: e.clientX,
            y: e.clientY
        }

        socket.emit('draw', data);
    }

    socket.on('draw', ({ x, y }) => {
        drawLine(lastX, lastY, x, y);
        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
});

