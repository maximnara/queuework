import { Queue } from '../src/queue';
import { Redis, Rabbit, DB } from '../src/connectors/';
jest.mock('../src/connectors/redis');
jest.mock('../src/connectors/rabbit');
jest.mock('../src/connectors/db');

let addMessage;
let getMessage;
let failMessage;
beforeAll(() => {
  addMessage = jest.fn();
  getMessage = jest.fn().mockReturnValue(JSON.stringify({ data: { hello: 'test' }, queue: "Job" }));
  failMessage = jest.fn();
  Redis.mockImplementation(() => {
    return {
      addMessage,
      getMessage,
      failMessage,
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
  expect(queue.connection.addMessage).toBeCalledWith(queue.name, message);
});

test('queue add previous message on fail', async () => {
  const queue = new Queue('Job', { driver: 'redis' });
  let message = await queue.getMessage();
  expect(queue.connection.getMessage).toBeCalled();
  await queue.failMessage(3);
  expect(queue.connection.failMessage).toBeCalledWith(3);
});