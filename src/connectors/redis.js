import * as redis from 'redis';

function Redis() {
  let connection = null;
  
  function connect() {
    const uri = process.env.REDIS_URI;
    const host = process.env.REDIS_HOST;
    const user = process.env.REDIS_USER;
    const password = process.env.REDIS_PASSWORD;
    const port = process.env.REDIS_PORT;
    
    if (!uri || !uri.length) {
      return connection = redis.createClient(uri);
    }
    connection = redis.createClient(port, host, { user, password });
  };
  
  function addNumberOfRetries(message) {
    message = JSON.parse(message);
    message.retries += message.retries;
    return JSON.stringify(message);
  }
  
  this.addMessage = async (queue, msg) => {
    return await connection.sadd(queue, JSON.stringify(msg || {}));
  };
  
  this.getMessage = async (key) => {
    return await connection.spop(key);
  };
  
  this.rollbackMessage = async (message) => {
    message = addNumberOfRetries(message);
    await connection.rpush(message);
  };
  
  connect();
  return this;
}

export default Redis;