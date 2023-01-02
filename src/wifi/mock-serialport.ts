import { SerialPort as _SerialPort } from "serialport";
import rewiremock from "rewiremock";

export declare type ErrorCallback = (err: Error | null) => void;

class _MockSerialPort {
    isOpen = true;
    destroyed = false;

    private _onCallbacks: { [k: string]: Array<(...args: any[]) => void> } = {}

    constructor(_options?: any) {

    }

    on(event: string, listener: (...args: any[]) => void): void;
    on(event: 'close', listener: (hadError: boolean) => void): void;
    on(event: 'connect', listener: () => void): void;
    on(event: 'data', listener: (data: Buffer) => void): void;
    on(event: 'drain', listener: () => void): void;
    on(event: 'end', listener: () => void): void;
    on(event: 'error', listener: (err: Error) => void): void;
    on(event: 'lookup', listener: (err: Error, address: string, family: string | number, host: string) => void): void;
    on(event: 'ready', listener: () => void): void;
    on(event: 'timeout', listener: () => void): void;
    on(event: 'write', listener: (data: Buffer) => void): void;
    on(event: string, callback: (...args: any[]) => void): void {
        console.log("[on]", event);

        if (typeof this._onCallbacks === "undefined") {
            this._onCallbacks = {};
        }

        if (!Array.isArray(this._onCallbacks[event])) {
            this._onCallbacks[event] = [];
        }

        this._onCallbacks[event].push(callback);
    };

    open(callback?: ErrorCallback): void {
        console.log("[open]");

        if (callback) {
            callback(null);
        }
    }

    close(callback?: ErrorCallback | undefined, _disconnectError?: Error | null): void {
        console.log("[close]");

        if (callback) {
            callback(null);
        }
    }

    end(...args: any[]): void {
        console.log("[end]");
        this._onCallbacks.close.forEach(callback => callback(false));
    };

    connect(...args: any[]): void {
        console.log("[connect]");
        this._onCallbacks.connect.forEach(callback => callback());
    };

    setTimeout(timeout: number): void {
        console.log("[setTimeout]", timeout);
    };

    destroy(): void {
        console.log("[destroy]");
        this.destroyed = true;
    };

    write(buffer: Uint8Array, cb?: (err?: Error) => void): boolean;
    write(str: string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
    write(buffer: Uint8Array | string, ..._args: any[]): boolean {
        console.log("[write]", buffer);
        this._onCallbacks.write.forEach(callback => callback(buffer));

        return true;
    }

    removeAllListeners(event: string) {
        this._onCallbacks[event] = [];
    }

    _forwardData(data: Buffer) {
        console.log("[forwardData]", data);
        this._onCallbacks.data.forEach(callback => callback(data));
    }
}

export const instance = new _MockSerialPort();

export class MockSerialPort {
    constructor(_options: any) {
        return instance;
    }
}

rewiremock('serialport').with({ SerialPort: MockSerialPort });

export function enable() {
    rewiremock.enable();
}

export function disable() {
    rewiremock.disable();
}
