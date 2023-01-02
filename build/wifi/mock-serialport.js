"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable = exports.enable = exports.MockSerialPort = exports.instance = void 0;
const rewiremock_1 = __importDefault(require("rewiremock"));
class _MockSerialPort {
    constructor(_options) {
        this.isOpen = true;
        this.destroyed = false;
        this._onCallbacks = {};
    }
    on(event, callback) {
        console.log("[on]", event);
        if (typeof this._onCallbacks === "undefined") {
            this._onCallbacks = {};
        }
        if (!Array.isArray(this._onCallbacks[event])) {
            this._onCallbacks[event] = [];
        }
        this._onCallbacks[event].push(callback);
    }
    ;
    open(callback) {
        console.log("[open]");
        if (callback) {
            callback(null);
        }
    }
    close(callback, _disconnectError) {
        console.log("[close]");
        if (callback) {
            callback(null);
        }
    }
    end(...args) {
        console.log("[end]");
        this._onCallbacks.close.forEach(callback => callback(false));
    }
    ;
    connect(...args) {
        console.log("[connect]");
        this._onCallbacks.connect.forEach(callback => callback());
    }
    ;
    setTimeout(timeout) {
        console.log("[setTimeout]", timeout);
    }
    ;
    destroy() {
        console.log("[destroy]");
        this.destroyed = true;
    }
    ;
    write(buffer, ..._args) {
        console.log("[write]", buffer);
        this._onCallbacks.write.forEach(callback => callback(buffer));
        return true;
    }
    removeAllListeners(event) {
        this._onCallbacks[event] = [];
    }
    _forwardData(data) {
        console.log("[forwardData]", data);
        this._onCallbacks.data.forEach(callback => callback(data));
    }
}
exports.instance = new _MockSerialPort();
class MockSerialPort {
    constructor(_options) {
        return exports.instance;
    }
}
exports.MockSerialPort = MockSerialPort;
(0, rewiremock_1.default)('serialport').with({ SerialPort: MockSerialPort });
function enable() {
    rewiremock_1.default.enable();
}
exports.enable = enable;
function disable() {
    rewiremock_1.default.disable();
}
exports.disable = disable;
