import { Queue } from './queue';
import { CronJob } from 'cron';
import msleep from './tools/msleep';

class Job {
  static get queue() {
    if (!this.name) {
      throw new Error('Queue should have a name');
    }
    return new Queue(this.name, this.config);
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
        await this.handle(message);
        await this.queue.commitMessage();
      }
    } catch (err) {
      await this.queue.failMessage(this.numberOfRetries);
    }
    return this;
  };
  
  static async daemonize(processCount) {
    if (this.schedule) {
      this.daemon = new CronJob(this.schedule, this.handle.bind(this), null, true, null, {}, true);
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
  static get name () {
    return this._name;
  }
  
  static setName(name) {
    this._name = name;
  }
  
  static get config() {
    return this._config || {};
  }
  
  static setConfig(config) {
    this._config = config;
  }
  
  static get numberOfRetries() {
    return this._numberOfRetries || 5;
  }
  
  static setNumberOfRetries(numberOfRetries) {
    this._numberOfRetries = numberOfRetries;
  }
  
  static get schedule() {
    return this._schedule;
  }
  
  static setSchedule(schedule) {
    this._schedule = schedule;
  }
  
  static get waitBeforeMessage() {
    return this._waitBeforeMessage || 1000;
  }
  
  static setWaitBeforeMessage(waitBeforeMessage) {
    this._waitBeforeMessage = waitBeforeMessage;
  }
  
  static async handle() {};
}

export { Job };