"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _queue = _interopRequireDefault(require("./queue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function Job() {
  var _this = this;

  var DEFAULT_NAME = 'default';
  var queue = null;
  this.name = DEFAULT_NAME;

  this.config = function (_ref) {
    var name = _ref.name;
    _this.name = name;
    queue = new _queue["default"](name);
    return _this;
  };

  this.handle = function (func) {
    _this.handleFunc = func;
    return _this;
  };

  this.addMessage =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(msg) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return queue.addMessage(msg);

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
      return _ref2.apply(this, arguments);
    };
  }();

  this.work =
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var message;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (queue) {
              _context2.next = 2;
              break;
            }

            throw new Error('Queue not configured. Set env vars to connect.');

          case 2:
            _context2.next = 4;
            return queue.getMessage();

          case 4:
            message = _context2.sent;
            _context2.prev = 5;

            _this.handleFunc(message);

            _context2.next = 13;
            break;

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](5);
            _context2.next = 13;
            return queue.rollbackMessage();

          case 13:
            return _context2.abrupt("return", _this);

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[5, 9]]);
  }));

  this.daemonize =
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(processCount) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!true) {
                _context3.next = 5;
                break;
              }

              _context3.next = 3;
              return _this.work();

            case 3:
              _context3.next = 0;
              break;

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x2) {
      return _ref4.apply(this, arguments);
    };
  }();
}

var _default = Job;
exports["default"] = _default;