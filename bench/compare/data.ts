// Shared row model + deterministic label generator for the comparative bench (krausest-style).
export interface Row {
  id: number;
  label: string;
}

const A = ["pretty", "large", "big", "small", "tall", "cheap", "hot", "odd"];
const B = ["red", "yellow", "blue", "green", "pink", "brown", "white", "black"];
const C = ["table", "chair", "house", "bbq", "desk", "car", "pony", "keyboard"];

let nextId = 1;
// Deterministic PRNG so every framework builds identical data (comparable GC/layout work).
let seed = 42;
function rand(max: number): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % max;
}

export function resetIds(): void {
  nextId = 1;
  seed = 42;
}

export function buildRows(count: number): Row[] {
  const rows: Row[] = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: nextId++,
      label: `${A[rand(A.length)]} ${B[rand(B.length)]} ${C[rand(C.length)]}`,
    };
  }
  return rows;
}

// The command surface every implementation provides. The runner drives ONLY this interface, so all
// frameworks execute the same ops on the same data.
export interface Impl {
  readonly name: string;
  mount(root: HTMLElement): void;
  /** Replace all rows. */
  create(rows: Row[]): void;
  /** Append ' !!!' to every 10th row's label. */
  update(): void;
  /** Swap rows at index 1 and 998. */
  swap(): void;
  /** Remove all rows. */
  clear(): void;
  destroy(): void;
}
