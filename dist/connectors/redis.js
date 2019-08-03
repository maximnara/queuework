"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var redis = _interopRequireWildcard(require("redis"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function Redis() {
  var connection = null;

  function connect() {
    var uri = process.env.REDIS_URI;
    var host = process.env.REDIS_HOST;
    var user = process.env.REDIS_USER;
    var password = process.env.REDIS_PASSWORD;
    var port = process.env.REDIS_PORT;

    if (uri && uri.length) {
      connection = _bluebird["default"].promisifyAll(redis.createClient(uri));
      return connection;
    }

    var optional = {};

    if (user && user.length) {
      optional.user = user;
    }

    if (password && password.length) {
      optional.password = password;
    }

    connection = _bluebird["default"].promisifyAll(redis.createClient(port, host, optional));
  }

  ;

  this.addMessage =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(queue, msg) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return connection.saddAsync(queue, JSON.stringify(msg || {}));

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  this.getMessage =
  /*#__PURE__*/
  function () {
    var _ref2 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2(key) {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return connection.spopAsync(key);

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  connect();
  return this;
}

var _default = Redis;
exports["default"] = _default;