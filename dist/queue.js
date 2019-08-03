"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _connectors = require("./connectors/");

var messageInProgress = null;

function Queue(name) {
  var _this = this;

  this.name = name;
  this.connection = null;

  var init = function init() {
    var driver = process.env.QUEUE_DRIVER;

    switch (driver) {
      case 'redis':
        _this.connection = new _connectors.Redis();
        break;

      case 'rabbit':
        _this.connection = new _connectors.Rabbit();
        break;

      case 'db':
        _this.connection = new _connectors.DB();
        break;
    }
  };

  var encodeMessage = function encodeMessage(message) {
    return {
      queue: _this.name,
      retries: 0,
      data: message
    };
  };

  var decodeMessage = function decodeMessage(message) {
    if (!message) {
      return null;
    }

    if (!message.data) {
      throw new Error('Message not original. Try to send messages via .addMessage() function.');
    }

    return message.data;
  };

  var addRetry = function addRetry(message) {
    if (!message.retries) {
      message.retries = 0;
    }

    message.retries = message.retries + 1;
    return message;
  };

  this.getKey = function () {
    return _this.name;
  };

  this.getFailedKey = function () {
    return _this.name + '.Failed';
  };

  this.addMessage =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(message) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.connection.addMessage(_this.getKey(), encodeMessage(message));

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  this.getMessage =
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2() {
    var key, message;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            key = _this.getKey();
            _context2.next = 3;
            return _this.connection.getMessage(key);

          case 3:
            message = _context2.sent;
            message = JSON.parse(message);
            messageInProgress = message;
            console.log(message);
            return _context2.abrupt("return", decodeMessage(message));

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  this.failMessage =
  /*#__PURE__*/
  function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3(numberOfRetries) {
      var message, key;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              message = addRetry(messageInProgress);
              key = _this.getKey();

              if (message.retries >= numberOfRetries) {
                key = _this.getFailedKey();
              }

              _context3.next = 5;
              return _this.connection.addMessage(key, message);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x2) {
      return _ref3.apply(this, arguments);
    };
  }();

  init();
}

var _default = Queue;
exports["default"] = _default;