import { Queue } from '../dist/queue';
const { Job } = require('../dist/job.js');
jest.mock('../dist/queue');

let addMessage;
let getMessage;
let failMessage;
beforeAll(() => {
  addMessage = jest.fn(() => true);
  getMessage = jest.fn(() => 'message');
  failMessage = jest.fn(() => true);
  Queue.mockImplementation(() => {
    return {
      addMessage: addMessage,
      getMessage: getMessage,
      failMessage: failMessage,
    };
  });
});

beforeEach(() => {
  Queue.mockClear();
  addMessage.mockClear();
  getMessage.mockClear();
  failMessage.mockClear();
  Job.handle = null;
  Job.prototype.waitBeforeMessage = null;
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
});

test('should call retry message on error', async function() {
  Job.handle = function(message) {
    throw new Error('test error');
  };
  await Job.work();
  expect(failMessage).toBeCalled();
});

test('should work when daemonized', async () => {
  Job.handle = function(message) {
    expect(message).toEqual('message');
  };
  Job.daemonize();
  setTimeout(() => {
    Job.stop();
    expect(getMessage).toBeCalled();
  }, 300);
});

test('should work when daemonized after some time', () => {
  Job.prototype.waitBeforeMessage = 200;
  Job.daemonize();
  setTimeout(() => {
    expect(getMessage.mock.calls.length).toEqual(1);
  }, 300);
  setTimeout(() => {
    Job.stop();
    expect(getMessage.mock.calls.length).toEqual(2);
  }, 500);
  setTimeout(() => {
    expect(getMessage.mock.calls.length).toEqual(2);
  }, 800);
});

test('should daemonize with schedule', () => {
  Job.prototype.schedule = '* * * * *';
  Job.prototype.waitBeforeMessage = 200;
  Job.daemonize();
  setTimeout(() => {
    expect(getMessage.mock.calls.length).toEqual(1);
  }, 50);
  setTimeout(() => {
    Job.stop();
    expect(getMessage.mock.calls.length).toEqual(1);
  }, 500);
});