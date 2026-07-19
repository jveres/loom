// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { remove, startPointerSession } from "./index.js";

const pointer = (type: string, pointerId: number, clientX = 0): PointerEvent =>
  new PointerEvent(type, { pointerId, clientX });

describe("loom DOM pointer sessions", () => {
  it("routes only the starting pointer and finishes exactly once", () => {
    const handle = document.createElement("div");
    const order: string[] = [];
    const capture = vi.fn();
    const release = vi.fn(() => order.push("release"));
    Object.defineProperties(handle, {
      setPointerCapture: { configurable: true, value: capture },
      releasePointerCapture: { configurable: true, value: release },
    });
    const moves: number[] = [];
    const ends: string[] = [];
    const stop = startPointerSession(handle, pointer("pointerdown", 7), {
      move: (event) => moves.push(event.clientX),
      end: (reason) => {
        order.push("end");
        ends.push(reason);
      },
    });

    handle.dispatchEvent(pointer("pointermove", 3, 3));
    handle.dispatchEvent(pointer("pointermove", 7, 7));
    handle.dispatchEvent(pointer("pointerup", 3));
    handle.dispatchEvent(pointer("pointerup", 7));
    handle.dispatchEvent(pointer("pointermove", 7, 8));
    stop();

    expect(moves).toEqual([7]);
    expect(ends).toEqual(["pointerup"]);
    expect(capture).toHaveBeenCalledWith(7);
    expect(release).toHaveBeenCalledWith(7);
    expect(order).toEqual(["release", "end"]);
  });

  it.each(["pointercancel", "lostpointercapture"] as const)(
    "finishes on %s",
    (kind) => {
      const handle = document.createElement("div");
      const end = vi.fn();
      startPointerSession(handle, pointer("pointerdown", 4), {
        move: () => {},
        end,
      });

      handle.dispatchEvent(pointer(kind, 4));
      handle.dispatchEvent(pointer("pointerup", 4));

      expect(end).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledWith(kind, expect.any(PointerEvent));
    },
  );

  it("stops manually or with Loom-managed unmount", () => {
    const manualHandle = document.createElement("div");
    const manualEnd = vi.fn();
    const stop = startPointerSession(manualHandle, pointer("pointerdown", 1), {
      move: () => {},
      end: manualEnd,
    });
    stop();
    stop();
    expect(manualEnd).toHaveBeenCalledOnce();
    expect(manualEnd).toHaveBeenCalledWith("stopped", undefined);

    const ownedHandle = document.createElement("div");
    document.body.append(ownedHandle);
    const ownedEnd = vi.fn();
    startPointerSession(ownedHandle, pointer("pointerdown", 2), {
      move: () => {},
      end: ownedEnd,
    });
    remove(ownedHandle);
    expect(ownedEnd).toHaveBeenCalledOnce();
    expect(ownedEnd).toHaveBeenCalledWith("stopped", undefined);
  });

  it("cleans listeners before ending and tolerates capture failures", () => {
    const handle = document.createElement("div");
    Object.defineProperties(handle, {
      setPointerCapture: {
        configurable: true,
        value: () => {
          throw new DOMException("capture failed");
        },
      },
      releasePointerCapture: {
        configurable: true,
        value: () => {
          throw new DOMException("capture already lost");
        },
      },
    });
    const move = vi.fn();
    const end = vi.fn(() => {
      document.dispatchEvent(pointer("pointermove", 9, 6));
    });

    expect(() =>
      startPointerSession(handle, pointer("pointerdown", 9), { move, end }),
    ).not.toThrow();
    document.dispatchEvent(pointer("pointermove", 9, 5));
    expect(() => document.dispatchEvent(pointer("pointerup", 9))).not.toThrow();

    expect(move).toHaveBeenCalledOnce();
    expect(move).toHaveBeenCalledWith(expect.objectContaining({ clientX: 5 }));
    expect(end).toHaveBeenCalledOnce();
  });
});
