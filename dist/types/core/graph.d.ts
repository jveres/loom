/**
 * Vendored reactive-graph system from alien-signals v3.2.1 (system.mjs),
 * typed for this codebase. Verbatim port — the algorithm, flag values, and
 * control flow are intentionally identical to upstream so benchmarks compare
 * like for like; do not "clean up" without re-running `pnpm bench`.
 *
 * MIT License
 * Copyright (c) 2024-present Johnson Chu
 * https://github.com/stackblitz/alien-signals
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
export interface ReactiveNode {
    deps?: Link | undefined;
    depsTail?: Link | undefined;
    subs?: Link | undefined;
    subsTail?: Link | undefined;
    flags: number;
}
export interface Link {
    version: number;
    dep: ReactiveNode;
    sub: ReactiveNode;
    prevSub: Link | undefined;
    nextSub: Link | undefined;
    prevDep: Link | undefined;
    nextDep: Link | undefined;
}
export declare function createReactiveSystem({ update, notify, unwatched, }: {
    update(sub: ReactiveNode): boolean;
    notify(sub: ReactiveNode): void;
    unwatched(sub: ReactiveNode): void;
}): {
    link: (dep: ReactiveNode, sub: ReactiveNode, version: number) => void;
    unlink: (link: Link, sub?: ReactiveNode) => Link | undefined;
    propagate: (link: Link, innerWrite: boolean) => void;
    checkDirty: (link: Link, sub: ReactiveNode) => boolean;
    shallowPropagate: (link: Link) => void;
};
