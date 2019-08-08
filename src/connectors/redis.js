import * as redis from 'redis';
import Promise from 'bluebird';
let connection = null;

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
  
  async addMessage(queue, message) {
    return await this.connection.saddAsync(queue, JSON.stringify(message || {}));
  };
  
  async getMessage(key) {
    return await this.connection.spopAsync(key);
  };
}

export { Redis };