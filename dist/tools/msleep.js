"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var msleep = function msleep(time) {
  return new Promise(function (resolve) {
    return setTimeout(function (_) {
      return resolve();
    }, time);
  });
};

var _default = msleep;
exports["default"] = _default;