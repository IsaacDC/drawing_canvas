const { parentPort } = require("node:worker_threads");
const db = require("../databases/dbSwitcher");
parentPort.on("message", (message) => {
  if (message.type === "loadDrawingData") {
    db.getAllDrawingData((err, drawingData) => {
      parentPort.postMessage({ type: "drawingData", data: drawingData });
    });
  }

  if (message.type === "insertDrawingData") {
    db.insertDrawingData(message.sessionId, message.data);
    parentPort.postMessage({ type: "draw", data: message.data });
  }
});
