import { Redis } from '../src/connectors/redis';
const redis = jest.genMockFromModule('redis');

beforeEach(() => {
  redis.createClient.mockReturnValue({
    saddAsync: jest.fn(),
    spopAsync: jest.fn().mockReturnValue(JSON.stringify({ queue: 'queue', retries: 0, data: { hello: 'test' } })),
  });
  Redis.getRedis = () => redis;
  delete process.env.REDIS_URI;
  delete process.env.REDIS_PORT;
  delete process.env.REDIS_HOST;
  delete process.env.REDIS_USER;
  delete process.env.REDIS_PASSWORD;
});

test('should connect by uri', () => {
  const testUri = 'redis://test';
  new Redis({ uri: testUri });
  expect(redis.createClient).toBeCalledWith(testUri);
  
  process.env.REDIS_URI = testUri;
  new Redis({ uri: testUri });
  expect(redis.createClient).toBeCalledWith(testUri);
});

test('should connect by params', () => {
  const config = { host: 'test', port: 1234, user: 'test', password: '987' };
  new Redis(config);
  expect(redis.createClient).toBeCalledWith(config.port, config.host, { user: config.user, password: config.password });
  
  process.env.REDIS_PORT = config.port;
  process.env.REDIS_HOST = config.host;
  process.env.REDIS_USER = config.user;
  process.env.REDIS_PASSWORD = config.password;
  new Redis();
  expect(redis.createClient).toBeCalledWith(config.port, config.host, { user: config.user, password: config.password });
});

test('should throw error on no params', () => {
  expect(() => {
    new Redis();
  }).toThrow();
  expect(() => {
    new Redis({ host: 'test.com' });
  }).toThrow();
  expect(() => {
    new Redis({ port: 1234 });
  }).toThrow();
  expect(() => {
    new Redis({ host: 'test.com', port: 1234 });
  }).not.toThrow();
  expect(() => {
    new Redis({ uri: 'redis://test' });
  }).not.toThrow();
  // The same only with env vars
  expect(() => {
    new Redis();
  }).toThrow();
  process.env.REDIS_HOST = 'test.com';
  expect(() => {
    new Redis();
  }).toThrow();
  delete process.env.REDIS_HOST;
  process.env.REDIS_PORT = 1234;
  expect(() => {
    new Redis();
  }).toThrow();
  process.env.REDIS_HOST = 'test.com';
  process.env.REDIS_PORT = 1234;
  expect(() => {
    new Redis();
  }).not.toThrow();
  delete process.env.REDIS_HOST;
  delete process.env.REDIS_PORT;
  process.env.REDIS_URI = 'redis://test';
  expect(() => {
    new Redis();
  }).not.toThrow();
});

test('should pop on getMessage', async () => {
  let queue = 'queue';
  let redisConnector = new Redis({ uri: 'redis://test' });
  let message = await redisConnector.getMessage(queue);
  expect(redisConnector.connection.spopAsync).toBeCalledWith(queue);
  expect(message).toEqual({ hello: 'test' });
});

test('should sadd on addMessage', () => {
  let queue = 'queue';
  let message = { message: 'test' };
  let redisConnector = new Redis({ uri: 'redis://test' });
  redisConnector.addMessage(queue, message);
  let preparedMessage = JSON.stringify(redisConnector.encodeMessage(queue, message));
  expect(redisConnector.connection.saddAsync).toBeCalledWith(queue, preparedMessage);
  
  preparedMessage = JSON.stringify(redisConnector.encodeMessage(queue, null));
  redisConnector.addMessage(queue, null);
  expect(redisConnector.connection.saddAsync).toBeCalledWith(queue, preparedMessage);
});

test('should encode message', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  let message = {hello: 'test'};
  let queue = 'testqueue';
  let expectedMessage = {
    queue,
    retries: 0,
    data: message,
  };
  expect(redisConnector.encodeMessage(queue, message)).toEqual(expectedMessage);
});

test('should decode message', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  let message = {hello: 'test'};
  let queue = 'testqueue';
  let encodedMessage = {
    queue,
    retries: 0,
    data: message,
  };
  expect(redisConnector.decodeMessage(encodedMessage)).toEqual(message);
  expect(redisConnector.decodeMessage(null)).toEqual(null);
  
  let wrongMessage = {
    queue,
    retries: 0,
  };
  expect(() => {
    redisConnector.decodeMessage(wrongMessage);
  }).toThrow();
});

test('should add retry', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  let message = {hello: 'test'};
  let queue = 'testqueue';
  let encodedMessage = {
    queue,
    retries: 0,
    data: message,
  };
  let modifiedMessage = Object.assign({}, encodedMessage);
  modifiedMessage.retries += 1;
  expect(redisConnector.addRetry(encodedMessage)).toEqual(modifiedMessage);
  expect(redisConnector.addRetry({})).toEqual({ retries: 1 });
});

test('should return failed key', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  expect(redisConnector.getFailedKey('queue')).toEqual('queue.failed');
});

test('queue add previous message on fail', async () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  let message = await redisConnector.getMessage('queue');
  message = JSON.stringify(redisConnector.addRetry(redisConnector.encodeMessage('queue', message)));
  await redisConnector.failMessage(3);
  expect(redisConnector.connection.saddAsync).toBeCalledWith('queue', message);
});

test('queue add previous message to failed queue', async () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  let message = await redisConnector.getMessage('queue');
  expect(redisConnector.connection.spopAsync).toBeCalled();
  message = redisConnector.addRetry(redisConnector.encodeMessage('queue', message));
  await redisConnector.failMessage(1);
  expect(redisConnector.connection.saddAsync).toBeCalledWith(redisConnector.getFailedKey(message.queue), JSON.stringify(message));
});

test('message encoded correctly', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  const message = { hello: 'test' };
  const expectedMessageStructure = {
    queue: 'Job',
    retries: 0,
    data: message,
  };
  expect(redisConnector.encodeMessage('Job', message)).toEqual(expectedMessageStructure);
});

test('message decoded correctly', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  const message = { hello: 'test' };
  const messageStructure = {
    queue: 'Job',
    retries: 0,
    data: message,
  };
  expect(redisConnector.decodeMessage(messageStructure)).toEqual(message);
});

test('add retries correctly', () => {
  let redisConnector = new Redis({ uri: 'redis://test' });
  const message = { hello: 'test' };
  const messageStructure = {
    queue: 'Job',
    retries: 0,
    data: message,
  };
  expect(redisConnector.addRetry(messageStructure)).toEqual({
    queue: 'Job',
    retries: 1,
    data: message,
  });
});