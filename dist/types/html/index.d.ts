export interface Html {
    readonly value: string;
    toString(): string;
}
export type HtmlChild = Html | string | number | boolean | null | undefined | readonly HtmlChild[];
export declare function unsafeHtml(value: string): Html;
export declare function html(strings: TemplateStringsArray, ...values: readonly HtmlChild[]): Html;
export declare function renderToString(value: HtmlChild): string;
export declare function isHtml(value: unknown): value is Html;
export declare function escapeText(value: string): string;
export declare function escapeAttribute(value: string): string;
