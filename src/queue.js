import { Redis, Rabbit, DB } from './connectors/';
let messageInProgress = null;

class Queue {
  
  constructor(name, config) {
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
  
  encodeMessage(message) {
    return {
      queue: this.name,
      retries: 0,
      data: message,
    };
  }
  
  decodeMessage(message) {
    if (!message) {
      return null;
    }
    if (!message.data) {
      throw new Error('Message not original. Try to send messages via .addMessage() function.');
    }
    return message.data;
  }
  
  addRetry(message) {
    if (!message.retries) {
      message.retries = 0;
    }
    message.retries = message.retries + 1;
    return message;
  }
  
  getKey() {
    return this.name;
  }
  
  getFailedKey() {
    return this.name + '.Failed';
  }
  
  async addMessage(message) {
    return await this.connection.addMessage(this.getKey(), this.encodeMessage(message));
  }
  
  async getMessage() {
    const key = this.getKey();
    let message = await this.connection.getMessage(key);  
    message = JSON.parse(message);
    messageInProgress = message;
    return this.decodeMessage(message);
  }
  
  async failMessage(numberOfRetries) {
    let message = this.addRetry(messageInProgress);
    let key = this.getKey();
    if (message.retries >= numberOfRetries) {
      key = this.getFailedKey();
    }
    await this.connection.addMessage(key, message);
  }
}

export { Queue };