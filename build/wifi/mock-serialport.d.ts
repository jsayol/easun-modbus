/// <reference types="node" />
export declare type ErrorCallback = (err: Error | null) => void;
declare class _MockSerialPort {
    isOpen: boolean;
    destroyed: boolean;
    private _onCallbacks;
    constructor(_options?: any);
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
    open(callback?: ErrorCallback): void;
    close(callback?: ErrorCallback | undefined, _disconnectError?: Error | null): void;
    end(...args: any[]): void;
    connect(...args: any[]): void;
    setTimeout(timeout: number): void;
    destroy(): void;
    write(buffer: Uint8Array, cb?: (err?: Error) => void): boolean;
    write(str: string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
    removeAllListeners(event: string): void;
    _forwardData(data: Buffer): void;
}
export declare const instance: _MockSerialPort;
export declare class MockSerialPort {
    constructor(_options: any);
}
export declare function enable(): void;
export declare function disable(): void;
export {};
