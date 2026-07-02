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

// Flag bits (upstream ReactiveFlags): Mutable=1, Watching=2, RecursedCheck=4,
// Recursed=8, Dirty=16, Pending=32. loom.ts declares the same constants; the
// function bodies below use the raw numbers exactly as upstream does.
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

interface Stack<T> {
  value: T;
  prev: Stack<T> | undefined;
}

export function createReactiveSystem({
  update,
  notify,
  unwatched,
}: {
  update(sub: ReactiveNode): boolean;
  notify(sub: ReactiveNode): void;
  unwatched(sub: ReactiveNode): void;
}) {
  return {
    link,
    unlink,
    propagate,
    checkDirty,
    shallowPropagate,
  };

  function link(dep: ReactiveNode, sub: ReactiveNode, version: number): void {
    const prevDep = sub.depsTail;
    if (prevDep !== undefined && prevDep.dep === dep) {
      return;
    }
    const nextDep = prevDep !== undefined ? prevDep.nextDep : sub.deps;
    if (nextDep !== undefined && nextDep.dep === dep) {
      nextDep.version = version;
      sub.depsTail = nextDep;
      return;
    }
    const prevSub = dep.subsTail;
    if (
      prevSub !== undefined &&
      prevSub.version === version &&
      prevSub.sub === sub
    ) {
      return;
    }
    const newLink: Link =
      (sub.depsTail =
      dep.subsTail =
        {
          version,
          dep,
          sub,
          prevDep,
          nextDep,
          prevSub,
          nextSub: undefined,
        });
    if (nextDep !== undefined) {
      nextDep.prevDep = newLink;
    }
    if (prevDep !== undefined) {
      prevDep.nextDep = newLink;
    } else {
      sub.deps = newLink;
    }
    if (prevSub !== undefined) {
      prevSub.nextSub = newLink;
    } else {
      dep.subs = newLink;
    }
  }

  function unlink(link: Link, sub: ReactiveNode = link.sub): Link | undefined {
    const { dep, prevDep, nextDep, nextSub, prevSub } = link;
    if (nextDep !== undefined) {
      nextDep.prevDep = prevDep;
    } else {
      sub.depsTail = prevDep;
    }
    if (prevDep !== undefined) {
      prevDep.nextDep = nextDep;
    } else {
      sub.deps = nextDep;
    }
    if (nextSub !== undefined) {
      nextSub.prevSub = prevSub;
    } else {
      dep.subsTail = prevSub;
    }
    if (prevSub !== undefined) {
      prevSub.nextSub = nextSub;
    } else if ((dep.subs = nextSub) === undefined) {
      unwatched(dep);
    }
    return nextDep;
  }

  function propagate(link: Link, innerWrite: boolean): void {
    let next = link.nextSub;
    let stack: Stack<Link | undefined> | undefined;
    top: do {
      const sub = link.sub;
      let flags = sub.flags;
      if (!(flags & (4 | 8 | 16 | 32))) {
        sub.flags = flags | 32;
        if (innerWrite) {
          sub.flags |= 8;
        }
      } else if (!(flags & (4 | 8))) {
        flags = 0;
      } else if (!(flags & 4)) {
        sub.flags = (flags & ~8) | 32;
      } else if (!(flags & (16 | 32)) && isValidLink(link, sub)) {
        sub.flags = flags | (8 | 32);
        flags &= 1;
      } else {
        flags = 0;
      }
      if (flags & 2) {
        notify(sub);
      }
      if (flags & 1) {
        const subSubs = sub.subs;
        if (subSubs !== undefined) {
          const nextSub = (link = subSubs).nextSub;
          if (nextSub !== undefined) {
            stack = { value: next, prev: stack };
            next = nextSub;
          }
          continue;
        }
      }
      if ((link = next as Link) !== undefined) {
        next = link.nextSub;
        continue;
      }
      while (stack !== undefined) {
        link = stack.value as Link;
        stack = stack.prev;
        if (link !== undefined) {
          next = link.nextSub;
          continue top;
        }
      }
      break;
    } while (true);
  }

  function checkDirty(link: Link, sub: ReactiveNode): boolean {
    let stack: Stack<Link> | undefined;
    let checkDepth = 0;
    let dirty = false;
    top: do {
      const dep = link.dep;
      const flags = dep.flags;
      if (sub.flags & 16) {
        dirty = true;
      } else if ((flags & (1 | 16)) === (1 | 16)) {
        const subs = dep.subs as Link;
        if (update(dep)) {
          if (subs.nextSub !== undefined) {
            shallowPropagate(subs);
          }
          dirty = true;
        }
      } else if ((flags & (1 | 32)) === (1 | 32)) {
        stack = { value: link, prev: stack };
        link = dep.deps as Link;
        sub = dep;
        ++checkDepth;
        continue;
      }
      if (!dirty) {
        const nextDep = link.nextDep;
        if (nextDep !== undefined) {
          link = nextDep;
          continue;
        }
      }
      while (checkDepth--) {
        link = (stack as Stack<Link>).value;
        stack = (stack as Stack<Link>).prev;
        if (dirty) {
          const subs = sub.subs as Link;
          if (update(sub)) {
            if (subs.nextSub !== undefined) {
              shallowPropagate(subs);
            }
            sub = link.sub;
            continue;
          }
          dirty = false;
        } else {
          sub.flags &= ~32;
        }
        sub = link.sub;
        const nextDep = link.nextDep;
        if (nextDep !== undefined) {
          link = nextDep;
          continue top;
        }
      }
      return dirty && !!sub.flags;
    } while (true);
  }

  function shallowPropagate(link: Link): void {
    do {
      const sub = link.sub;
      const flags = sub.flags;
      if ((flags & (32 | 16)) === 32) {
        sub.flags = flags | 16;
        if ((flags & (2 | 4)) === 2) {
          notify(sub);
        }
      }
    } while ((link = link.nextSub as Link) !== undefined);
  }

  function isValidLink(checkLink: Link, sub: ReactiveNode): boolean {
    let link = sub.depsTail;
    while (link !== undefined) {
      if (link === checkLink) {
        return true;
      }
      link = link.prevDep;
    }
    return false;
  }
}
