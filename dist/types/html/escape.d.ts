export declare function escapeText(value: string): string;
export declare function escapeAttribute(value: string): string;
/** @internal Reverse escapeText's entities in one pass (so `&amp;lt;` reads back as `&lt;`). */
export declare function unescapeAttribute(value: string): string;
