export declare function renderAttribute(tag: string, name: string, value: unknown, dev: boolean): string;
export interface SerializeAttributesOptions {
    /** Warn (console) for the two drops that almost always mean a bug —
     *  a malformed name, an unsafe URL scheme. */
    readonly dev?: boolean;
    /** The tag named in those warnings. */
    readonly tag?: string;
}
/** Serialize an attribute bag with the JSX runtime's rule: each rendered
 *  attribute joins with a LEADING space (` a="1" b`) so the result drops
 *  straight after a tag name; an all-dropped bag is "". */
export declare function serializeAttributes(attrs: Record<string, unknown>, options?: SerializeAttributesOptions): string;
