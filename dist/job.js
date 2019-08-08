"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Job = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _queue = require("./queue");

var _cron = require("cron");

var _msleep = _interopRequireDefault(require("./tools/msleep"));

var Job =
/*#__PURE__*/
function () {
  function Job() {
    (0, _classCallCheck2["default"])(this, Job);
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

                this.daemon = new _cron.CronJob(this.schedule, this.work.bind(this), null, true, null, {}, true);
                return _context3.abrupt("return", this);

              case 3:
                this.inProgress = true;

              case 4:
                if (!true) {
                  _context3.next = 13;
                  break;
                }

                if (this.inProgress) {
                  _context3.next = 7;
                  break;
                }

                return _context3.abrupt("break", 13);

              case 7:
                _context3.next = 9;
                return this.work();

              case 9:
                _context3.next = 11;
                return (0, _msleep["default"])(this.waitBeforeMessage);

              case 11:
                _context3.next = 4;
                break;

              case 13:
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
    key: "stop",
    value: function stop() {
      this.inProgress = false;

      if (this.daemon) {
        this.daemon.stop();
        this.daemon = null;
      }
    } // User overrided properties and functions.

  }, {
    key: "setName",
    value: function setName(name) {
      this._name = name;
    }
  }, {
    key: "setConfig",
    value: function setConfig(config) {
      this._config = config;
    }
  }, {
    key: "setNumberOfRetries",
    value: function setNumberOfRetries(numberOfRetries) {
      this._numberOfRetries = numberOfRetries;
    }
  }, {
    key: "setSchedule",
    value: function setSchedule(schedule) {
      this._schedule = schedule;
    }
  }, {
    key: "setWaitBeforeMessage",
    value: function setWaitBeforeMessage(waitBeforeMessage) {
      this._waitBeforeMessage = waitBeforeMessage;
    }
  }, {
    key: "handle",
    value: function handle() {}
  }, {
    key: "queue",
    get: function get() {
      if (!this.name) {
        throw new Error('Queue should have a name');
      }

      return new _queue.Queue(this.name, this.config);
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "config",
    get: function get() {
      return this._config || {};
    }
  }, {
    key: "numberOfRetries",
    get: function get() {
      return this._numberOfRetries || 5;
    }
  }, {
    key: "schedule",
    get: function get() {
      return this._schedule;
    }
  }, {
    key: "waitBeforeMessage",
    get: function get() {
      return this._waitBeforeMessage || 1000;
    }
  }]);
  return Job;
}();

exports.Job = Job;