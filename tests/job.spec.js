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
      addMessage:addMessage,
      getMessage: getMessage,
      failMessage: failMessage,
    };
  });
});

beforeEach(() => {
  Queue.mockClear();
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

// @TODO: add test for daemonize() and waitBeforeMessage