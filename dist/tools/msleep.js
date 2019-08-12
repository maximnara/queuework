"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const msleep = time => {
  return new Promise(resolve => setTimeout(_ => resolve(), time));
};

var _default = msleep;
exports.default = _default;