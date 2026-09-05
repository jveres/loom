// @vitest-environment happy-dom
import { expect, it, onTestFinished, vi } from "vitest";
import { effect, type Read, scope } from "../loom.js";
import {
  attr,
  classed,
  connected,
  focusWithin,
  hovered,
  mediaRead,
  pressed,
  style,
} from "./index.js";

interface Fixture {
  read(): Read<unknown>;
  set(active: boolean): void;
  readonly initial: unknown;
  readonly next: unknown;
}

const fixtures = {
  attribute(el: HTMLElement): Fixture {
    el.setAttribute("data-active", "no");
    return {
      read: () => attr(el, "data-active"),
      set: (active) => el.setAttribute("data-active", active ? "yes" : "no"),
      initial: "no",
      next: "yes",
    };
  },
  class(el: HTMLElement): Fixture {
    return {
      read: () => classed(el, "active"),
      set: (active) => {
        el.classList.toggle("active", active);
      },
      initial: false,
      next: true,
    };
  },
  style(el: HTMLElement): Fixture {
    el.style.opacity = "0";
    return {
      read: () => style(el, "opacity"),
      set: (active) => {
        el.style.opacity = active ? "1" : "0";
      },
      initial: "0",
      next: "1",
    };
  },
  connected(el: HTMLElement): Fixture {
    el.remove();
    return {
      read: () => connected(el),
      set: (active) => {
        if (active) document.body.append(el);
        else el.remove();
      },
      initial: false,
      next: true,
    };
  },
  hovered(el: HTMLElement): Fixture {
    return {
      read: () => hovered(el),
      set: (active) => {
        el.dispatchEvent(
          new PointerEvent(active ? "pointerenter" : "pointerleave", {
            pointerType: "mouse",
          }),
        );
      },
      initial: false,
      next: true,
    };
  },
  focusWithin(el: HTMLElement): Fixture {
    return {
      read: () => focusWithin(el),
      set: (active) => {
        el.dispatchEvent(new FocusEvent(active ? "focusin" : "focusout"));
      },
      initial: false,
      next: true,
    };
  },
  pressed(el: HTMLElement): Fixture {
    return {
      read: () => pressed(el),
      set: (active) => {
        if (active)
          el.dispatchEvent(
            new PointerEvent("pointerdown", { pointerId: 1, button: 0 }),
          );
        else
          window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
      },
      initial: false,
      next: true,
    };
  },
};

it.each(Object.entries(fixtures))(
  "shared %s reads survive the creating consumer's pause and stop",
  async (_name, create) => {
    const el = document.createElement("div");
    document.body.append(el);
    onTestFinished(() => el.remove());
    const fixture = create(el);
    const firstSeen: unknown[] = [];
    const secondSeen: unknown[] = [];
    const first = scope(() => {
      const read = fixture.read();
      effect(() => {
        firstSeen.push(read());
      });
    });
    onTestFinished(first.stop);
    const second = scope(() => {
      const read = fixture.read();
      effect(() => {
        secondSeen.push(read());
      });
    });
    onTestFinished(second.stop);

    first.pause();
    fixture.set(true);
    await vi.waitFor(() =>
      expect(secondSeen).toEqual([fixture.initial, fixture.next]),
    );
    expect(firstSeen).toEqual([fixture.initial]);
    first.resume();
    expect(firstSeen).toEqual([fixture.initial, fixture.next]);
    first.stop();
    fixture.set(false);
    await vi.waitFor(() =>
      expect(secondSeen).toEqual([
        fixture.initial,
        fixture.next,
        fixture.initial,
      ]),
    );
  },
);

it("shared media queries disconnect only after the last consumer stops", () => {
  const listeners = new Set<() => void>();
  const list = {
    matches: false,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal("matchMedia", () => list);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  const seen: boolean[] = [];
  const first = scope(() => {
    const read = mediaRead("(shared-source-test)");
    effect(() => read());
  });
  onTestFinished(first.stop);
  const second = scope(() => {
    const read = mediaRead("(shared-source-test)");
    effect(() => {
      seen.push(read());
    });
  });
  onTestFinished(second.stop);

  first.pause();
  expect(listeners.size).toBe(1);
  list.matches = true;
  for (const listener of listeners) listener();
  first.stop();
  expect(listeners.size).toBe(1);
  second.stop();

  expect(seen).toEqual([false, true]);
  expect(listeners.size).toBe(0);
});
