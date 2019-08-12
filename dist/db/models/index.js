"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _job = _interopRequireDefault(require("./job"));

var _failedJob = _interopRequireDefault(require("./failed-job"));

module.exports = (sequelize, DataTypes) => {
  return {
    job: (0, _job.default)(sequelize, DataTypes),
    failedJob: (0, _failedJob.default)(sequelize, DataTypes)
  };
};