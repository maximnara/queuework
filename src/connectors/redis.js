import * as redis from 'redis';
import Promise from 'bluebird';
let connection = null;
let messageInProgress = null;

class Redis {
  
  constructor(config) {
    this.connect(config);
  }
  
  connect(config) {
    config = config || {};
    const uri = process.env.REDIS_URI || config.uri;
    const host = process.env.REDIS_HOST || config.host;
    const user = process.env.REDIS_USER || config.user;
    const password = process.env.REDIS_PASSWORD || config.password;
    const port = process.env.REDIS_PORT || config.port;
    
    if (!uri && !host && !port || host && !port || !host && port) {
      throw new Error('Redis cannot be configured, set uri or port, host.');
    }
    if (uri && uri.length) {
      this.connection = Promise.promisifyAll(Redis.getRedis().createClient(uri));
      return connection;
    }
    let optional = {};
    if (user && user.length) {
      optional.user = user;
    }
    if (password && password.length) {
      optional.password = password;
    }
    this.connection = Promise.promisifyAll(Redis.getRedis().createClient(port, host, optional));
  };
  
  static getRedis() {
    return redis;
  };
  
  encodeMessage(queue, message) {
    return {
      queue,
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
  
  getFailedKey(queue) {
    return queue + '.failed';
  }
  
  async addMessage(queue, message) {
    let encodedMessage = this.encodeMessage(queue, message);
    return await this.connection.saddAsync(queue, JSON.stringify(encodedMessage));
  };
  
  async getMessage(queue) {
    let message = await this.connection.spopAsync(queue);
    if (message) {
      message = JSON.parse(message);
    }
    messageInProgress = message;
    return this.decodeMessage(message);
  };
  
  async commitMessage() {
    
  }
  
  async failMessage(numberOfRetries) {
    let message = this.addRetry(messageInProgress);
    let key = message.queue;
    if (message.retries >= numberOfRetries) {
      key = this.getFailedKey(message.queue);
    }
    await this.connection.saddAsync(key, JSON.stringify(message));
    messageInProgress = null;
  }
}

export { Redis };