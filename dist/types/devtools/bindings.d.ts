import { type EffectOptions } from "loom";
export declare const PANEL_OPTS: {
    readonly internal: true;
};
export declare function bind(fn: () => void, extra?: EffectOptions): void;
export declare function disposeBindings(): void;
