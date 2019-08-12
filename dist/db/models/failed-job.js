"use strict";

var _sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FailedJob extends _sequelize.Model {}

  FailedJob.init({
    queue: DataTypes.STRING,
    data: DataTypes.TEXT,
    retries: DataTypes.INTEGER(11).UNSIGNED,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'failed_job',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return FailedJob;
};