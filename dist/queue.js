"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _connectors = require("./connectors/");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function Queue(name) {
  var _this = this;

  var messageInProgress = null;
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

  this.getKey = function () {
    return _this.name;
  };

  this.addMessage =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(msg) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.connection.addMessage(_this.getKey(), msg);

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
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var key, message;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            key = _this.getKey();
            _context2.next = 3;
            return _this.connection.getMessage(key);

          case 3:
            message = _context2.sent;
            messageInProgress = message;
            return _context2.abrupt("return", message);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  this.rollbackMessage =
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _this.connection.rollbackMessage(messageInProgress);

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  init();
}

var _default = Queue;
exports["default"] = _default;