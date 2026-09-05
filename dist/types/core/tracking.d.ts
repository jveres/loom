type Untrack = <T>(run: () => T) => T;
export declare function installUntrack(run: Untrack): void;
export declare function untrack<T>(run: () => T): T;
export {};
