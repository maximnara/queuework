# QueueWork - is super simple NodeJS queue and job manager.
Works with Redis and SQL Databases. Can work by cron schedule or receive messages. Check it.

<p align="center">
<a href="https://travis-ci.org/maximnara/queuework"><img src="https://travis-ci.org/maximnara/queuework.svg?branch=master" alt="Build Status"></a>
<a href='https://coveralls.io/github/maximnara/queuework'><img src='https://coveralls.io/repos/github/maximnara/queuework/badge.svg' alt='Coverage Status' /></a>
<a href="https://www.npmjs.com/package/@maximnara/queuework"><img src="https://img.shields.io/npm/dm/@maximnara/queuework" alt="Total Downloads"></a>
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/maximnara/queuework">
</p>

## Install
```
npm install @maximnara/queuework --save
```

## How to use
First define you own Job as follows:
```
import { Job } from 'queuework';

class TestJob extends Job {
  static get name() {
    return 'test'; // queue name
  }
  
  static get numberOfRetries() {
    return 3;
  }
  
  /**
   * You can define your config in some BaseJob in you project and then extend your class.
   * Otherwise you can set configs via .env file or process.env.
   */
  static get config() {
    return {
      driver: 'redis',
      uri: 'redis://127.0.0.1:6379',
      //host: '127.0.0.1',
      //user: '',
      //password: '',
      //port: 6379,
    };
  }
  
  static get schedule() {
    return '* * * * *'; // This Job will be executed every minute every hour and so on.
  }
  
  static handle(message) { // This handler will be executed on Job work.
    console.log(message);
  };
}
export default TestJob;
```

### Add message
And then use it in you project. To add message use:
```
await TestJob.addMessage({ hello: 'test1' });
```

### Daemonize
To daemonize or to execute one job:
```
await TestJob.work(); // use await for work function. Node works faster than queue.
await TestJob.daemonize(); // here if you will use await, next functions not be called and you will not have ability to stop daemon programmatically
TestJob.stop(); // Stops daemon
```

To deamonize you Job type on your server for example
```
nohup node daemons.js &
```

And in the `daemons.js` write:
```
import { TestJob } from './jobs/index.js';
import * as polyfill from '@babel/polyfill';

(async function () {
  await TestJob.daemonize();
})();
```

### Scheduling
If you are using `schedule` you will not receive messages, your handle function will be executed as is.
If you want to execute job more than one time a minute use `waitBeforeMessage` instead of `schedule`.
It will run process in `while (true)` with sleep time for 2 seconds.
```
class TestJob extends Job {
  static get waitBeforeMessage() {
    return 2000; // micro seconds
  }
}
```

## Works with
Now queue works with Redis and SQL Databases. In future it will be RabbitMQ also.

### How to configure Redis
Use env vars, it's handy. You can set them in `.env` file in you project.
```
QUEUE_DRIVER=redis

#REDIS_URI=redis://127.0.0.1:6379
REDIS_HOST=127.0.0.1
REDIS_USER=
REDIS_PASSWORD=
REDIS_PORT=6379
```
Otherwise use `config` property.
```
static get config() {
  return {
    driver: 'redis',
    uri: 'redis://127.0.0.1:6379',
    //host: '127.0.0.1',
    //user: '',
    //password: '',
    //port: 6379,
  };
}
```

### How to work with DB
Works with MySQL, PostgreSQL, MariaDB, SQLite and MSSQL.
To start use PostgreSQL or MySQL create two tables and one index in you db.
```
CREATE TABLE jobs(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, queue VARCHAR(255), `data` TEXT, retries INT UNSIGNED, reserved_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE jobs ADD INDEX queue_reserved_at_idx(queue, reserved_at);

CREATE TABLE failed_jobs(id int not null AUTO_INCREMENT PRIMARY KEY, queue VARCHAR(255), `data` TEXT, retries INT UNSIGNED, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
```

Configs for DB:
```
static get config() {
  return {
    driver: 'db',
    dialect: 'mysql',
    //uri: 'postgres://127.0.0.1:6379',
    name: 'test',
    user: 'maxim',
    password: 'secretpassword',
    host: '127.0.0.1',
    port: 8889
  };
}
```
Or use `.env` vars:
```
#DB_URI=postgres://127.0.0.1:6379
DB_DIALECT=mysql
DB_NAME=test
DB_HOST=127.0.0.1
DB_USER=maxim
DB_PASSWORD=secretpassword
DB_PORT=8889
```

## ES5
To use `queuework` with ES5 define you class:

```
function MyJob() {
};
MyJob.prototype = Object.create(queuework.Job);

let job = new MyJob();
job.setName('MyJob');
job.setConfig({
  driver: 'redis',
  uri: 'redis://127.0.0.1:6379',
});
job.setWaitBeforeMessage(5000);
job.setNumberOfRetries(3);
job.handle = function (message) {
  console.log(message);
  throw new Error('User error');
};

module.exports = job;
```