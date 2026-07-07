// Shared value rendering for the inspector's signal/trace rows.

// Compact display of a value. Strings are quoted and truncated past `cap` chars (the caller sets the
// budget — wide in the trace log, tight in the graph tree); other types get a short summary.
export function formatValue(v: unknown, cap: number): string {
  if (v === undefined) return "—";
  if (v === null) return "null";
  if (typeof v === "number")
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === "string")
    return v.length > cap ? `"${v.slice(0, cap)}…"` : `"${v}"`;
  if (typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === "object") return "{…}";
  return String(v);
}

// Type-colour class for a value (the --li-gv-* palette).
export function valueClass(v: unknown): string {
  if (typeof v === "number") return "li-gv-num";
  if (typeof v === "string") return "li-gv-str";
  if (typeof v === "boolean") return "li-gv-bool";
  if (v === null || v === undefined) return "li-gv-nul";
  return "";
}
