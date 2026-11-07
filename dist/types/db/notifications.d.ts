import { type Read } from "../loom.js";
export declare class NotificationBus {
    readonly name: string;
    readonly mode: import("../loom.js").State<"broadcast" | "manual">;
    private channel;
    private owners;
    private listeners;
    private pending;
    private all;
    private queued;
    private readonly sender;
    private readonly resume;
    private readonly visible;
    constructor(name: string);
    retain(): () => void;
    subscribe(stores: ReadonlySet<string>, notify: () => void): () => void;
    invalidate(stores?: readonly string[]): void;
    commit(version: number, stores: readonly string[]): void;
    private closeChannel;
    private disable;
}
export declare function notifications(name: string): NotificationBus;
export declare function modeRead(bus: NotificationBus): Read<"broadcast" | "manual">;
