interface StatsPanes {
    readonly statsPane: HTMLElement;
    readonly sparkEl: HTMLElement;
}
export declare function wireStats(opts: {
    activeTab: () => string | undefined;
    isMinimized: () => boolean;
}): StatsPanes;
export declare function pauseStats(): void;
export declare function resumeStats(): void;
export declare function stopStats(): void;
export {};
