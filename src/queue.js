import { Redis, Rabbit, DB } from './connectors/';
let messageInProgress = null;

function Queue(name) {
  this.name = name;
  this.connection = null;
  
  const init = () => {
    const driver = process.env.QUEUE_DRIVER;
    switch (driver) {
      case 'redis':
        this.connection = new Redis();
        break;
      case 'rabbit':
        this.connection = new Rabbit();
        break;
      case 'db':
        this.connection = new DB();
        break;
    }
  }
  
  const encodeMessage = (message) => {
    return {
      queue: this.name,
      retries: 0,
      data: message,
    };
  };
  
  const decodeMessage = (message) => {
    if (!message) {
      return null;
    }
    if (!message.data) {
      throw new Error('Message not original. Try to send messages via .addMessage() function.');
    }
    return message.data;
  };
  
  const addRetry = (message) => {
    if (!message.retries) {
      message.retries = 0;
    }
    message.retries = message.retries + 1;
    return message;
  };
  
  this.getKey = () => {
    return this.name;
  }
  
  this.getFailedKey = () => {
    return this.name + '.Failed';
  }
  
  this.addMessage = async (message) => {
    return await this.connection.addMessage(this.getKey(), encodeMessage(message));
  };
  
  this.getMessage = async () => {
    const key = this.getKey();
    let message = await this.connection.getMessage(key);  
    message = JSON.parse(message);
    messageInProgress = message;
    console.log(message)
    return decodeMessage(message);
  };
  
  this.failMessage = async (numberOfRetries) => {
    let message = addRetry(messageInProgress);
    let key = this.getKey();
    if (message.retries >= numberOfRetries) {
      key = this.getFailedKey();
    }
    await this.connection.addMessage(key, message);
  };
  
  init();
}

export default Queue;