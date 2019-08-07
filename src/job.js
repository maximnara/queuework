import { Queue } from './queue';
import { CronJob } from 'cron';
import msleep from './tools/msleep';

class Job {
  static get queue() {
    return new Queue(this.name, this.config);
  };
  
  static setConfig(config) {
    this.config = config;
  }
  
  static async addMessage(msg) {
    return await this.queue.addMessage(msg);
  };
  
  static async work() {
    if (!this.queue) {
      throw new Error('Queue not configured. Set env vars to connect.');
    }
    let message = await this.queue.getMessage();
    try {
      if (message) {
        this.handle(message);
      }
    } catch (err) {
      await this.queue.failMessage(this.numberOfRetries);
    }
    return this;
  };
  
  static async daemonize(processCount) {
    if (this.schedule) {
      this.daemon = new CronJob(this.schedule, this.work.bind(this), null, true, null, {}, true);
      return this;
    }
    this.inProgress = true;
    while (true) {
      if (!this.inProgress) {
        break;
      }
      await this.work();
      await msleep(this.waitBeforeMessage);
    }
  };
  
  static stop() {
    this.inProgress = false;
    if (this.daemon) {
      this.daemon.stop();
      this.daemon = null;
    }
  }
  
  // User overrided properties and functions.
  static get numberOfRetries() {
    return 5;
  }
  
  static get schedule() {
    return null;
  }
  
  static get waitBeforeMessage() {
    return 1000;
  }
  
  static handle() {};
}

export { Job };