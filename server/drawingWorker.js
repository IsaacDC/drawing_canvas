const { parentPort } = require('node:worker_threads');
const db = require('../database/mysql');

parentPort.on('message', (message) => {
    if (message === 'loadDrawingData') {
        db.uniqueSessionIds((sessionIds) => {
            sessionIds.forEach((sessionId) => {
                db.getDrawingsBySessionID(sessionId

                )
            })
        })
    }
    parentPort.postMessage(drawingData);
});