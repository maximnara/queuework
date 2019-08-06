"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Queue = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _connectors = require("./connectors/");

var messageInProgress = null;

var Queue =
/*#__PURE__*/
function () {
  function Queue(name, config) {
    (0, _classCallCheck2["default"])(this, Queue);
    this.config = config || {};
    this.name = name;
    this.init();
  }

  (0, _createClass2["default"])(Queue, [{
    key: "init",
    value: function init() {
      var driver = process.env.QUEUE_DRIVER || this.config.driver;

      switch (driver) {
        case 'redis':
          this.connection = new _connectors.Redis(this.config);
          break;

        case 'rabbit':
          this.connection = new _connectors.Rabbit(this.config);
          break;

        case 'db':
          this.connection = new _connectors.DB(this.config);
          break;
      }
    }
  }, {
    key: "encodeMessage",
    value: function encodeMessage(message) {
      return {
        queue: this.name,
        retries: 0,
        data: message
      };
    }
  }, {
    key: "decodeMessage",
    value: function decodeMessage(message) {
      if (!message) {
        return null;
      }

      if (!message.data) {
        throw new Error('Message not original. Try to send messages via .addMessage() function.');
      }

      return message.data;
    }
  }, {
    key: "addRetry",
    value: function addRetry(message) {
      if (!message.retries) {
        message.retries = 0;
      }

      message.retries = message.retries + 1;
      return message;
    }
  }, {
    key: "getKey",
    value: function getKey() {
      return this.name;
    }
  }, {
    key: "getFailedKey",
    value: function getFailedKey() {
      return this.name + '.Failed';
    }
  }, {
    key: "addMessage",
    value: function () {
      var _addMessage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(message) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.connection.addMessage(this.getKey(), this.encodeMessage(message));

              case 2:
                return _context.abrupt("return", _context.sent);

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addMessage(_x) {
        return _addMessage.apply(this, arguments);
      }

      return addMessage;
    }()
  }, {
    key: "getMessage",
    value: function () {
      var _getMessage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var key, message;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                key = this.getKey();
                _context2.next = 3;
                return this.connection.getMessage(key);

              case 3:
                message = _context2.sent;
                message = JSON.parse(message);
                messageInProgress = message;
                return _context2.abrupt("return", this.decodeMessage(message));

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMessage() {
        return _getMessage.apply(this, arguments);
      }

      return getMessage;
    }()
  }, {
    key: "failMessage",
    value: function () {
      var _failMessage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3(numberOfRetries) {
        var message, key;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                message = this.addRetry(messageInProgress);
                key = this.getKey();

                if (message.retries >= numberOfRetries) {
                  key = this.getFailedKey();
                }

                _context3.next = 5;
                return this.connection.addMessage(key, message);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function failMessage(_x2) {
        return _failMessage.apply(this, arguments);
      }

      return failMessage;
    }()
  }]);
  return Queue;
}();

exports.Queue = Queue;