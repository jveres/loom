// Shared options for every Loom node the inspector creates: internal, so the inspector never
// appears in the observability it reports. Set once; nodes inherit it. (Binding lifetimes ride
// loom's own ownership: node-owned via bind()/text()/attr(), scope-owned via the panel scope.)
export const PANEL_OPTS = { internal: true } as const;
