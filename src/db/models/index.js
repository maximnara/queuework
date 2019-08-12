import Job from './job';
import FailedJob from './failed-job';

module.exports = (sequelize, DataTypes) => {
  return {
    job: Job(sequelize, DataTypes),
    failedJob: FailedJob(sequelize, DataTypes),
  };
};