"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Queue = void 0;

var _connectors = require("./connectors/");

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
        this.connection = new _connectors.Redis(this.config);
        break;

      case 'rabbit':
        this.connection = new _connectors.Rabbit(this.config);
        break;

      case 'db':
        this.connection = new _connectors.DB(this.config);
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

exports.Queue = Queue;