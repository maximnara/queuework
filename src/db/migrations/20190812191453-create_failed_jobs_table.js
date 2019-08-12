'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.query('CREATE TABLE failed_jobs(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, queue VARCHAR(255), `data` TEXT, retries INT UNSIGNED, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);');
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.query('DROP TABLE jobs');
  }
};