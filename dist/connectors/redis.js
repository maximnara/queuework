"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Redis = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var redis = _interopRequireWildcard(require("redis"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var connection = null;

var Redis =
/*#__PURE__*/
function () {
  function Redis(config) {
    (0, _classCallCheck2["default"])(this, Redis);
    this.connect(config);
  }

  (0, _createClass2["default"])(Redis, [{
    key: "connect",
    value: function connect(config) {
      config = config || {};
      var uri = process.env.REDIS_URI || config.uri;
      var host = process.env.REDIS_HOST || config.host;
      var user = process.env.REDIS_USER || config.user;
      var password = process.env.REDIS_PASSWORD || config.password;
      var port = process.env.REDIS_PORT || config.port;

      if (!uri && !host && !port || host && !port || !host && port) {
        throw new Error('Redis cannot be configured, set uri or port, host.');
      }

      if (uri && uri.length) {
        this.connection = _bluebird["default"].promisifyAll(Redis.getRedis().createClient(uri));
        return connection;
      }

      var optional = {};

      if (user && user.length) {
        optional.user = user;
      }

      if (password && password.length) {
        optional.password = password;
      }

      this.connection = _bluebird["default"].promisifyAll(Redis.getRedis().createClient(port, host, optional));
    }
  }, {
    key: "addMessage",
    value: function () {
      var _addMessage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(queue, message) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.connection.saddAsync(queue, JSON.stringify(message || {}));

              case 2:
                return _context.abrupt("return", _context.sent);

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addMessage(_x, _x2) {
        return _addMessage.apply(this, arguments);
      }

      return addMessage;
    }()
  }, {
    key: "getMessage",
    value: function () {
      var _getMessage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(key) {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.connection.spopAsync(key);

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMessage(_x3) {
        return _getMessage.apply(this, arguments);
      }

      return getMessage;
    }()
  }], [{
    key: "getRedis",
    value: function getRedis() {
      return redis;
    }
  }]);
  return Redis;
}();

exports.Redis = Redis;