document.addEventListener('DOMContentLoaded', () => {
    var socket;

    socket = io.connect('http://127.0.0.1:3000');
    socket.on('draw', newDrawing);

    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    let drawing = false;

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

    function newDrawing(data){
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);

        finishedPosition();
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);
});

