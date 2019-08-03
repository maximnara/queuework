import Queue from './queue';
import { CronJob } from 'cron';
import { sleep } from 'sleep';

class Job {
  constructor(message) {
    this.addMessage(message);
  }
  
  static get queue() {
    return new Queue(this.name);
  };
  
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
      new CronJob(this.schedule, this.work.bind(this), null, true);
      return this;
    }
    while (true) {
      await this.work();
      sleep(this.waitBeforeMessage);
    }
  };
  
  // User overrided properties and functions.
  static get numberOfRetries() {
    return 5;
  }
  
  static get schedule() {
    return null;
  }
  
  static get waitBeforeMessage() {
    return 1;
  }
  
  static handle() {};
}

export default Job;