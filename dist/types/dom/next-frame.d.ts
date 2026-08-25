import type { Stop } from "../loom.js";
export declare function nextFrame(fn: () => void, owner?: Node): Stop;
export declare function afterFrames(n: number, fn: () => void, owner?: Node): Stop;
