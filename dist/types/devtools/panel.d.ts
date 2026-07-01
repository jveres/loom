export type TabId = "stats" | "graph" | "trace";
/** Mount the floating inspector panel (dev only). Idempotent; a no-op until called. */
export declare function mountInspector(target?: Element): void;
/** Remove the panel and stop all observation/timers. Safe to call when not mounted. */
export declare function unmountInspector(): void;
/** Whether the inspector is currently mounted. */
export declare function inspectorMounted(): boolean;
/** Show the inspector if hidden, hide it if shown. */
export declare function toggleInspector(target?: Element): void;
