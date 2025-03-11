const { Worker } = require('node:worker_threads');
const { join } = require('node:path');

class WorkerPool {
  constructor(numWorkers, workerFile) {
    this.workers = [];
    this.availableWorkers = [];
    this.workerFile = workerFile;

    for (let i = 0; i < numWorkers; i++) {
      this.addWorker();
    }
  }

  addWorker() {
    const worker = new Worker(join(__dirname, this.workerFile));
    worker.on('message', (message) => {
      worker.isBusy = false;
      if (worker.onComplete) {
        worker.onComplete(message);
      }
    });
    worker.isBusy = false;
    this.workers.push(worker);
    this.availableWorkers.push(worker);
  }

  runTask(task, callback) {
    const worker = this.availableWorkers.find(w => !w.isBusy);
    if (worker) {
      worker.isBusy = true;
      worker.onComplete = callback;
      worker.postMessage(task);
    } else {
      setTimeout(() => this.runTask(task, callback), 100);
    }
  }
}

module.exports = WorkerPool;
