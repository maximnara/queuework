import Queue from './queue';

function Job() {
  const DEFAULT_NAME = 'default';
  let queue = null;
  
  this.name = DEFAULT_NAME;
  
  this.config = ({ name }) => {
    this.name = name;
    queue = new Queue(name);
    return this;
  };
  
  this.handle = (func) => {
    this.handleFunc = func;
    return this;
  };
  
  this.addMessage = async (msg) => {
    return await queue.addMessage(msg);
  };
  
  this.work = async () => {
    if (!queue) {
      throw new Error('Queue not configured. Set env vars to connect.');
    }
    let message = await queue.getMessage();
    try {
      this.handleFunc(message);
    } catch (err) {
      await queue.rollbackMessage();
    }
    return this;
  };
  
  this.daemonize = async (processCount) => {
    // new pid in processCount processes
    while (true) {
      await this.work();
    }
  };
}

export default Job;