export interface CaretPoint {
    node: Node;
    offset: number;
}
export declare function caretAtPoint(doc: Document, x: number, y: number): CaretPoint | undefined;
