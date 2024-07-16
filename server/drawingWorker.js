const { parentPort } = require('node:worker_threads');
const db = require('../database/db');

parentPort.on('message', (message) => {
    if (message === 'loadDrawingData') {
        db.getAllDrawingData((drawingData) => {
            parentPort.postMessage(drawingData);
        });
    }
});
