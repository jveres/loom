import type { TabId } from "./panel.js";
export declare function wireStats(opts: {
    activeTab: () => TabId | undefined;
    isMinimized: () => boolean;
}): HTMLElement;
export declare function pauseStats(): void;
export declare function resumeStats(): void;
export declare function stopStats(): void;
