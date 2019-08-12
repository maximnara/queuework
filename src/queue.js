import { Redis, Rabbit, DB } from './connectors/';

class Queue {
  
  constructor(name, config) {
    if (!name || !name.length) {
      throw new Error('Queue should have a name');
    }
    this.config = config || {};
    this.name = name;
    this.init();
  }
  
  init() {
    const driver = process.env.QUEUE_DRIVER || this.config.driver;
    switch (driver) {
      case 'redis':
        this.connection = new Redis(this.config);
        break;
      case 'rabbit':
        this.connection = new Rabbit(this.config);
        break;
      case 'db':
        this.connection = new DB(this.config);
        break;
    }
  }
  
  async addMessage(message) {
    return await this.connection.addMessage(this.name, message);
  }
  
  async getMessage() {
    return await this.connection.getMessage(this.name);  
  }
  
  async commitMessage() {
    return await this.connection.commitMessage();  
  }
  
  async failMessage(numberOfRetries) {
    return await this.connection.failMessage(numberOfRetries);
  }
}

export { Queue };