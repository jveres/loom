/** Replace a host's content only after a different key builds and inserts successfully. */
export declare function keyedChild(host: Element): (key: string, build: () => Node) => void;
