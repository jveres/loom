export interface ChannelNode {
    readonly name: string;
    readonly cap: number;
    readonly mask: number;
    readonly fields: readonly string[];
    cols: unknown[][] | undefined;
    meters: number;
    samples: number;
    seq: number;
    head: number;
}
export declare const channelRegistry: Map<string, ChannelNode>;
export declare const sampler: {
    record(node: ChannelNode, _a: unknown, _b: unknown, _c: unknown, _d: unknown, _e: unknown): void;
};
export declare const readCh: ChannelNode;
export declare const writeCh: ChannelNode;
export declare const computeCh: ChannelNode;
export declare const effectCh: ChannelNode;
export declare const flushCh: ChannelNode;
export declare const createCh: ChannelNode;
export declare const disposeCh: ChannelNode;
