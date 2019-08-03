"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _queue = _interopRequireDefault(require("./queue"));

var _cron = require("cron");

var _sleep = require("sleep");

var Job =
/*#__PURE__*/
function () {
  function Job(message) {
    (0, _classCallCheck2["default"])(this, Job);
    this.addMessage(message);
  }

  (0, _createClass2["default"])(Job, null, [{
    key: "addMessage",
    value: function () {
      var _addMessage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(msg) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.queue.addMessage(msg);

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
    key: "work",
    value: function () {
      var _work = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var message;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.queue) {
                  _context2.next = 2;
                  break;
                }

                throw new Error('Queue not configured. Set env vars to connect.');

              case 2:
                _context2.next = 4;
                return this.queue.getMessage();

              case 4:
                message = _context2.sent;
                _context2.prev = 5;

                if (message) {
                  this.handle(message);
                }

                _context2.next = 13;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](5);
                _context2.next = 13;
                return this.queue.failMessage(this.numberOfRetries);

              case 13:
                return _context2.abrupt("return", this);

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 9]]);
      }));

      function work() {
        return _work.apply(this, arguments);
      }

      return work;
    }()
  }, {
    key: "daemonize",
    value: function () {
      var _daemonize = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3(processCount) {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this.schedule) {
                  _context3.next = 3;
                  break;
                }

                new _cron.CronJob(this.schedule, this.work.bind(this), null, true);
                return _context3.abrupt("return", this);

              case 3:
                if (!true) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 6;
                return this.work();

              case 6:
                (0, _sleep.sleep)(this.waitBeforeMessage);
                _context3.next = 3;
                break;

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function daemonize(_x2) {
        return _daemonize.apply(this, arguments);
      }

      return daemonize;
    }()
  }, {
    key: "handle",
    value: function handle() {}
  }, {
    key: "queue",
    get: function get() {
      return new _queue["default"](this.name);
    }
  }, {
    key: "numberOfRetries",
    // User overrided properties and functions.
    get: function get() {
      return 5;
    }
  }, {
    key: "schedule",
    get: function get() {
      return null;
    }
  }, {
    key: "waitBeforeMessage",
    get: function get() {
      return 1;
    }
  }]);
  return Job;
}();

var _default = Job;
exports["default"] = _default;