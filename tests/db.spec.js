import { DB } from '../src/connectors/db';
import { Sequelize } from 'sequelize';
import Models from '../src/db/models/';
jest.mock('../src/db/models/');
jest.mock('sequelize');

let models;
let model;
beforeEach(() => {
  model = {
    id: 1,
    queue: 'testqueue',
    data: JSON.stringify({ hello: 'testdata' }),
    retries: 0,
    destroy: jest.fn(),
    update: jest.fn(),
  };
  models = {
    job: {
      create: jest.fn(),
      findOne: jest.fn().mockReturnValue(model),
      findByPk: jest.fn().mockReturnValue(model),
    },
    failedJob: {
      create: jest.fn(),
    },
  };
  Models.mockImplementation(() => {
    return models;
  });
  Sequelize.mockImplementation(() => {
    return {};
  });
  
  delete process.env.DB_URI;
  delete process.env.DB_DIALECT;
  delete process.env.DB_NAME;
  delete process.env.DB_HOST;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.DB_PORT;
  
  Models.mockClear();
  Sequelize.mockClear();
  model.destroy.mockClear();
  model.update.mockClear();
});

test('should connect by uri', () => {
  let uri = 'postgres://localhost';
  let db = new DB({ uri });
  expect(Sequelize).toBeCalledWith(uri);
  expect(db.models).toEqual(models);
  
  process.env.DB_URI = uri;
  db = new DB();
  expect(Sequelize).toBeCalledWith(uri);
  expect(db.models).toEqual(models);
});

test('should connect by params', () => {
  let name = 'testdb';
  let user = 'user';
  let password = 'pw';
  let host = 'localhost';
  let dialect = 'postgres';
  let port = '1234';
  let db = new DB({ name, user, password, host, dialect, port });
  expect(Sequelize).toBeCalledWith(name, user, password, { host, dialect, port });
  expect(db.models).toEqual(models);
  
  process.env.DB_DIALECT = dialect;
  process.env.DB_NAME = name;
  process.env.DB_HOST = host;
  process.env.DB_USER = user;
  process.env.DB_PASSWORD = password;
  process.env.DB_PORT = port;
  db = new DB({ name, user, password, host, dialect, port });
  expect(Sequelize).toBeCalledWith(name, user, password, { host, dialect, port });
  expect(db.models).toEqual(models);
});

test('should throw error on no params', () => {
  expect(() => {
    new DB();
  }).toThrow();
  
  let name = 'testdb';
  let user = 'user';
  let password = 'pw';
  let host = 'localhost';
  let dialect = 'postgres';
  let port = '1234';
  expect(() => {
    new DB({ name });
  }).toThrow();
  expect(() => {
    new DB({ name, user });
  }).toThrow();
  expect(() => {
    new DB({ name, user, password });
  }).toThrow();
  expect(() => {
    new DB({ name, user, password, host });
  }).toThrow();
  expect(() => {
    new DB({ name, user, password, host, dialect });
  }).not.toThrow();
});

test('add message', async () => {
  let uri = 'postgres://localhost';
  let db = new DB({ uri });
  let queue = 'testqueue';
  let message = { hello: 'test' };
  // Test message added correctly.
  await db.addMessage(queue, message);
  expect(db.models.job.create).toBeCalledWith({ queue, data: JSON.stringify(message), retries: 0 });
  // Test empty message added.
  await db.addMessage(queue);
  expect(db.models.job.create).toBeCalledWith({ queue, data: JSON.stringify({}), retries: 0 });
  // Test error on no queue.
  expect(db.addMessage()).rejects.toThrow();
});

test('get message', async () => {
  let uri = 'postgres://localhost';
  let db = new DB({ uri });
  let queue = 'testqueue';
  
  let message = await db.getMessage(queue);
  expect(db.models.job.findOne).toBeCalledWith({ where: { queue, reserved_at: null }, order: [['id', 'asc']] });
  expect(model.update.mock.calls[0][0]).toHaveProperty('reserved_at');
  expect(message).toEqual({ hello: 'testdata' });
});

test('commit message', async () => {
  let uri = 'postgres://localhost';
  let db = new DB({ uri });
  let queue = 'testqueue';
  
  await db.getMessage(queue);
  await db.commitMessage();
  expect(db.models.job.findByPk).toBeCalledWith(model.id);
  expect(model.destroy).toBeCalled();
  
  models = {
    job: {
      findOne: jest.fn().mockReturnValue(model),
      findByPk: jest.fn().mockReturnValue(null),
    },
  };
  Models.mockImplementation(() => {
    return models;
  });
  
  db = new DB({ uri });
  
  await db.getMessage(queue);
  expect(db.commitMessage()).rejects.toThrow();
});

test('fail message', async () => {
  let uri = 'postgres://localhost';
  let db = new DB({ uri });
  let queue = 'testqueue';
  
  await db.getMessage(queue);
  await db.failMessage(3);
  expect(model.update).toBeCalledWith({ retries: 1 });
  
  await db.getMessage(queue);
  await db.failMessage(1);
  expect(db.models.failedJob.create).toBeCalledWith({
    queue: model.queue, 
    data: JSON.stringify(model.data), 
    retries: 1,
  });
  expect(model.destroy).toBeCalled();
  
  models = {
    job: {
      findOne: jest.fn().mockReturnValue(model),
      findByPk: jest.fn().mockReturnValue(null),
    },
  };
  Models.mockImplementation(() => {
    return models;
  });
  
  db = new DB({ uri });
  
  await db.getMessage(queue);
  expect(db.failMessage()).rejects.toThrow();
});