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

// Op parameters, defined once so every implementation provably runs the same workload — a drifted
// copy in one impl would silently make the frameworks incomparable.
export const UPDATE_STRIDE = 10;
export const UPDATE_SUFFIX = " !!!";
export const SWAP_A = 1;
export const SWAP_B = 998;

// The command surface every implementation provides. The runner drives ONLY this interface, so all
// frameworks execute the same ops on the same data.
export interface Impl {
  readonly name: string;
  mount(root: HTMLElement): void;
  /** Replace all rows. */
  create(rows: Row[]): void;
  /** Append UPDATE_SUFFIX to every UPDATE_STRIDE-th row's label. */
  update(): void;
  /** Swap the rows at SWAP_A and SWAP_B. */
  swap(): void;
  /** Remove all rows. */
  clear(): void;
  destroy(): void;
}
