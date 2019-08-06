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
  
  async addMessage(queue, msg) {
    return await this.connection.saddAsync(queue, JSON.stringify(msg || {}));
  };
  
  async getMessage(key) {
    return await this.connection.spopAsync(key);
  };
}

export { Redis };