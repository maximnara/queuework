import * as redis from 'redis';
import Promise from 'bluebird';

function Redis() {
  let connection = null;
  
  function connect() {
    const uri = process.env.REDIS_URI;
    const host = process.env.REDIS_HOST;
    const user = process.env.REDIS_USER;
    const password = process.env.REDIS_PASSWORD;
    const port = process.env.REDIS_PORT;
    
    if (uri && uri.length) {
      connection = Promise.promisifyAll(redis.createClient(uri));
      return connection;
    }
    let optional = {};
    if (user && user.length) {
      optional.user = user;
    }
    if (password && password.length) {
      optional.password = password;
    }
    connection = Promise.promisifyAll(redis.createClient(port, host, optional));
  };
  
  this.addMessage = async (queue, msg) => {
    return await connection.saddAsync(queue, JSON.stringify(msg || {}));
  };
  
  this.getMessage = async (key) => {
    return await connection.spopAsync(key);
  };
  
  connect();
  return this;
}

export default Redis;