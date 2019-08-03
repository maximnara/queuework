"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Job", {
  enumerable: true,
  get: function get() {
    return _job["default"];
  }
});

var _job = _interopRequireDefault(require("./job.js"));

var dotenv = _interopRequireWildcard(require("dotenv"));

var polyfill = _interopRequireWildcard(require("@babel/polyfill"));

dotenv.config();