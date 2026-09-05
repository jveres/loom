/** An installation ends on manual stop, abort, or Loom disposal of its owner. */
export declare function nodeLifetime(owner: Node, signal?: AbortSignal): {
    readonly active: boolean;
    readonly stop: () => void;
    readonly add: (cleanup: () => void) => void;
};
