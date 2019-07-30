import { Redis, Rabbit, DB } from './connectors/';

function Queue(name) {
  let messageInProgress = null;
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
  
  this.getKey = () => {
    return this.name;
  }
  
  this.addMessage = async (msg) => {
    return await this.connection.addMessage(this.getKey(), msg);
  };
  
  this.getMessage = async () => {
    const key = this.getKey();
    const message = await this.connection.getMessage(key);
    messageInProgress = message;
    return message;
  };
  
  this.rollbackMessage = async () => {
    await this.connection.rollbackMessage(messageInProgress);
  };
  
  init();
}

export default Queue;