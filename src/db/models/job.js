import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  class Job extends Model {    
  }
  Job.init({
    queue: DataTypes.STRING,
    data: DataTypes.TEXT,
    retries: DataTypes.INTEGER(11).UNSIGNED,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, { 
    sequelize, 
    modelName: 'job',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })
  return Job;
}

