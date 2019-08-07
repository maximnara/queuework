import { Queue } from '../dist/queue';
import { Redis, Rabbit, DB } from '../dist/connectors/';
jest.mock('../dist/connectors/redis');
jest.mock('../dist/connectors/rabbit');
jest.mock('../dist/connectors/db');

let addMessage;
let getMessage;
beforeAll(() => {
  addMessage = jest.fn();
  getMessage = jest.fn().mockReturnValue(JSON.stringify({ data: { hello: 'test' }, queue: "Job" }));
  Redis.mockImplementation(() => {
    return {
      addMessage,
      getMessage,
    };
  });
});

beforeEach(() => {
  Redis.mockClear();
  addMessage.mockClear();
  getMessage.mockClear();
});

test('should connect right adapter', () => {
  const config = { driver: 'redis', uri: 'redis://' };
  new Queue('Job', config);
  expect(Redis).toBeCalledWith(config);
  expect(Rabbit).not.toBeCalled();
  expect(DB).not.toBeCalled();
});

test('should work with env config', () => {
  process.env.QUEUE_DRIVER = 'redis';
  new Queue('Job');
  expect(Redis).toBeCalledWith({});
  expect(Rabbit).not.toBeCalled();
  expect(DB).not.toBeCalled();
});

test('should throw error when no name', () => {
  expect(() => {
    new Queue();
  }).toThrow();
});

test('queue add prepared message to right queue', async () => {
  const queue = new Queue('Job', { driver: 'redis' });
  const message = { message: 'test' };
  await queue.addMessage(message);
  expect(queue.connection.addMessage).toBeCalledWith(queue.getKey(), queue.encodeMessage(message));
});

test('queue add previous message on fail', async () => {
  const queue = new Queue('Job', { driver: 'redis' });
  let message = await queue.getMessage();
  expect(queue.connection.getMessage).toBeCalled();
  message = queue.addRetry(queue.encodeMessage(message));
  await queue.failMessage(3);
  expect(queue.connection.addMessage).toBeCalledWith(queue.getKey(), message);
});

test('queue add previous message to failed queue', async () => {
  const queue = new Queue('Job', { driver: 'redis' });
  let message = await queue.getMessage();
  expect(queue.connection.getMessage).toBeCalled();
  message = queue.addRetry(queue.encodeMessage(message));
  await queue.failMessage(1);
  expect(queue.connection.addMessage).toBeCalledWith(queue.getFailedKey(), message);
});

test('queue get and decode message', async () => {
  const queue = new Queue('Job', { driver: 'redis' });
  let message = await queue.getMessage();
  expect(queue.connection.getMessage).toBeCalled();
  expect(message).toEqual({ hello: 'test' });
});