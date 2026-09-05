// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { scope, state } from "../loom.js";
import { bind, h, onUnmount, remove, resourceGroup } from "./index.js";

it("preserves registration order after several early stops during group construction", () => {
  const calls: string[] = [];
  const group = resourceGroup(() => {
    const node = h("div");
    const a = onUnmount(node, () => {
      calls.push("a");
    });
    const b = onUnmount(node, () => {
      calls.push("b");
    });
    onUnmount(node, () => {
      calls.push("c");
    });
    a();
    onUnmount(node, () => {
      calls.push("d");
    });
    b();
    onUnmount(node, () => {
      calls.push("e");
    });
    return node;
  });

  group.dispose();
  remove(group.value);

  expect(calls).toEqual(["a", "b", "c", "d", "e"]);
});

it("keeps descendant-first cleanup after granular removal and throwing callbacks", () => {
  const calls: string[] = [];
  const group = resourceGroup(() => {
    const root = h("div");
    onUnmount(root, () => {
      calls.push("root");
    });
    for (const label of ["removed", "left", "right"]) {
      const node = h("span");
      onUnmount(node, () => {
        calls.push(label);
        if (label === "left") throw new Error("left failed");
      });
      root.append(node);
    }
    return root;
  });
  remove(group.value.firstChild as Node);
  expect(() => group.dispose()).toThrow("left failed");
  group.dispose();
  remove(group.value);

  expect(calls).toEqual(["removed", "left", "right", "root"]);
});

it("handles scope-stopped bindings before the resource group stops", () => {
  const calls: string[] = [];
  const signal = state(0);
  let owner: ReturnType<typeof scope> | undefined;
  const group = resourceGroup(() => {
    const root = h("div");
    owner = scope(() => {
      bind(root, () => {
        root.textContent = String(signal());
        return () => {
          calls.push("scoped");
        };
      });
    });
    onUnmount(root, () => {
      calls.push("manual");
    });
    return root;
  });

  owner?.stop();
  signal(1);
  group.dispose();
  remove(group.value);

  expect(calls).toEqual(["scoped", "manual"]);
  expect(group.value.textContent).toBe("0");
});

it("releases a sibling from the group during cleanup without skipping remaining callbacks", () => {
  const calls: number[] = [];
  let stopSibling = () => {};
  const group = resourceGroup(() => {
    const root = h("div");
    onUnmount(root, () => {
      calls.push(1);
      stopSibling();
    });
    stopSibling = onUnmount(root, () => {
      calls.push(2);
    });
    onUnmount(root, () => {
      calls.push(3);
    });
    return root;
  });
  group.dispose();
  remove(group.value);
  expect(calls).toEqual([1, 2, 3]);
});
