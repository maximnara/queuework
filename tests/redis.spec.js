import { Redis } from '../src/connectors/redis';
const redis = jest.genMockFromModule('redis');

beforeEach(() => {
  redis.createClient.mockReturnValue({
    saddAsync: jest.fn(),
    spopAsync: jest.fn(),
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

test('should pop on getMessage', () => {
  let key = 'key';
  let redisConnector = new Redis({ uri: 'redis://test' });
  redisConnector.getMessage(key);
  expect(redisConnector.connection.spopAsync).toBeCalledWith(key);
});

test('should sadd on addMessage', () => {
  let queue = 'queue';
  let message = { message: 'test' };
  let redisConnector = new Redis({ uri: 'redis://test' });
  redisConnector.addMessage(queue, message);
  expect(redisConnector.connection.saddAsync).toBeCalledWith(queue, JSON.stringify(message));
  
  redisConnector.addMessage(queue, null);
  expect(redisConnector.connection.saddAsync).toBeCalledWith(queue, JSON.stringify({}));
});