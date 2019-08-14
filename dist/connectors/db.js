"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DB = void 0;

var _sequelize = require("sequelize");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _models = _interopRequireDefault(require("../db/models/"));

let connection = null;
let messageInProgress = null;

class DB {
  constructor(config) {
    this.connect(config);
  }

  connect(config) {
    config = config || {};
    const uri = process.env.DB_URI || config.uri;
    const dialect = process.env.DB_DIALECT || config.dialect;
    const name = process.env.DB_NAME || config.name;
    const host = process.env.DB_HOST || config.host;
    const user = process.env.DB_USER || config.user;
    const password = process.env.DB_PASSWORD || config.password;
    const port = process.env.DB_PORT || config.port;

    if (!uri && (!name || !user || !password || !host || !dialect)) {
      throw new Error('DB cannot be configured, set uri or db name, host, user, password and dialect.');
    }

    if (uri && uri.length) {
      this.connection = new _sequelize.Sequelize(uri);
      this.initModels();
      return connection;
    }

    let parameters = {
      host,
      dialect,
      port
    };
    this.connection = new _sequelize.Sequelize(name, user, password, parameters);
    this.initModels();
  }

  initModels() {
    this.models = (0, _models.default)(this.connection, _sequelize.Sequelize.DataTypes);
  }

  async addMessage(queue, message) {
    return await this.models.job.create({
      queue,
      data: JSON.stringify(message || {}),
      retries: 0
    });
  }

  async getMessage(queue) {
    let message = await this.models.job.findOne({
      where: {
        queue,
        reserved_at: null
      },
      order: [['id', 'asc']]
    });

    if (message) {
      await message.update({
        reserved_at: +new Date()
      });
    }

    messageInProgress = message;
    return message ? JSON.parse(message.data) : null;
  }

  async commitMessage() {
    let job = await this.models.job.findByPk(messageInProgress.id);

    if (!job) {
      throw new Error('Cannot find job to commit.');
    }

    await job.destroy();
    messageInProgress = null;
  }

  async failMessage(numberOfRetries) {
    let job = await this.models.job.findByPk(messageInProgress.id);

    if (!job) {
      throw new Error('Message failed but not retried.');
    }

    let retries = messageInProgress.retries + 1;

    if (retries >= numberOfRetries) {
      await this.models.failedJob.create({
        queue: messageInProgress.queue,
        data: JSON.stringify(messageInProgress.data || {}),
        retries
      });
      await job.destroy();
      messageInProgress = null;
      return;
    }

    return job.update({
      retries
    });
  }

}

exports.DB = DB;