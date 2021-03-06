import { Queue } from '../src/queue';
const { Job } = require('../src/job');
jest.mock('../src/queue');

let addMessage;
let getMessage;
let failMessage;
let commitMessage;
beforeAll(() => {
  addMessage = jest.fn(() => true);
  getMessage = jest.fn(() => 'message');
  failMessage = jest.fn(() => true);
  commitMessage = jest.fn(() => true);
  Queue.mockImplementation(() => {
    return {
      addMessage: addMessage,
      getMessage: getMessage,
      failMessage: failMessage,
      commitMessage: commitMessage,
    };
  });
});

beforeEach(() => {
  Queue.mockClear();
  addMessage.mockClear();
  getMessage.mockClear();
  failMessage.mockClear();
  commitMessage.mockClear();
  Job.setName('test');
  Job.handle = null;
  Job.prototype.waitBeforeMessage = null;
});

test('should throw error when no name', () => {
  Job.setName(null);
  expect(() => {
    Job.queue;
  }).toThrow();
});

test('should call queue addMessage', async function() {
  let result = await Job.addMessage({ hello: 'test' });
  expect(addMessage).toBeCalled();
  expect(result).toEqual(true);
});

test('should call handle', async function() {
  Job.handle = function(message) {
    expect(message).toEqual('message');
  };
  await Job.work();
  expect(getMessage).toBeCalled();
  expect(commitMessage).toBeCalled();
});

test('should call retry message on error', async function() {
  Job.handle = function(message) {
    throw new Error('test error');
  };
  await Job.work();
  expect(failMessage).toBeCalled();
});

test('should work when daemonized', (done) => {
  Job.prototype.waitBeforeMessage = 200;
  Job.handle = function(message) {
    expect(message).toEqual('message');
  };
  Job.daemonize();
  setTimeout(() => {
    Job.stop();
    expect(getMessage).toBeCalled();
    done();
  }, 100);
});

test('should daemonize with schedule', (done) => {
  Job.prototype.schedule = '* * * * *';
  Job.prototype.waitBeforeMessage = 200;
  Job.daemonize();
  setTimeout(() => {
    Job.stop();
    expect(getMessage.mock.calls.length).toEqual(1);
    done();
  }, 600);
});

test('set config', () => {
  Job.setConfig({ uri: 'postgres://' });
  expect(Job.config).toEqual({ uri: 'postgres://' });
});

test('set set number of retries', () => {
  Job.setNumberOfRetries(5);
  expect(Job.numberOfRetries).toEqual(5);
});

test('set set schedule', () => {
  Job.setSchedule('* * * * *');
  expect(Job.schedule).toEqual('* * * * *');
});

test('set set wait before message', () => {
  Job.setWaitBeforeMessage(200);
  expect(Job.waitBeforeMessage).toEqual(200);
});