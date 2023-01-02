"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = void 0;
function assert(condition, errMsg) {
    if (!condition) {
        throw new Error(errMsg);
    }
}
exports.assert = assert;
