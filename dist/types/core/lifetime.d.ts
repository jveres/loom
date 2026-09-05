/** Internal terminal lifetime. Register cleanup before installing fallible work. */
export declare function lifetime(signal?: AbortSignal): {
    readonly active: boolean;
    readonly stop: () => void;
    readonly add: (cleanup: () => void) => void;
};
/** Preserve the setup failure when rollback also fails. */
export declare function failSetup(life: {
    stop: () => void;
}, error: unknown): never;
