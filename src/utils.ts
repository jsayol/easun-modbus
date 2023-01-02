export function assert(condition: boolean, errMsg: string): void | never {
    if (!condition) {
        throw new Error(errMsg);
    }
}
