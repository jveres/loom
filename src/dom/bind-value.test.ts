// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { state } from "../loom.js";
import { bindValue } from "./bind-value.js";
import { remove } from "./ownership.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("bindValue", () => {
  it("writes the cell on input and follows the cell while unfocused", () => {
    const cell = state("seed", { label: "test.bindValue" });
    const el = document.createElement("input");
    document.body.append(el);
    bindValue(el, cell);
    expect(el.value).toBe("seed");

    el.value = "typed";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    expect(cell()).toBe("typed");

    cell("external");
    expect(el.value).toBe("external");
  });

  it("NEVER overwrites the focused element; the suppressed value lands on blur", () => {
    const cell = state("", { label: "test.bindValue.focus" });
    const el = document.createElement("input");
    document.body.append(el);
    bindValue(el, cell);
    el.focus();
    el.value = "mid-edit";
    el.dispatchEvent(new Event("input", { bubbles: true }));

    cell("echo"); // a reactive echo while typing
    expect(el.value).toBe("mid-edit"); // the edit survives

    el.blur();
    el.dispatchEvent(new Event("blur"));
    expect(el.value).toBe("echo"); // the suppressed value applies
  });

  it("the follow effect and input listeners die with the element", () => {
    const cell = state("a", { label: "test.bindValue.life" });
    const el = document.createElement("input");
    document.body.append(el);
    bindValue(el, cell);
    remove(el);
    cell("b");
    expect(el.value).toBe("a"); // no zombie follow

    el.value = "detached edit";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    expect(cell()).toBe("b");
  });
});

describe("bindValue { property: 'checked' }", () => {
  it("writes the boolean cell on change and follows it while unfocused", () => {
    const cell = state(false, { label: "test.bindValue.checked" });
    const el = document.createElement("input");
    el.type = "checkbox";
    document.body.append(el);
    bindValue(el, cell, { property: "checked" });
    expect(el.checked).toBe(false);

    el.checked = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(cell()).toBe(true);

    cell(false);
    expect(el.checked).toBe(false);
  });

  it("never overwrites the focused control; the suppressed value lands on blur", () => {
    const cell = state(false, { label: "test.bindValue.checked.focus" });
    const el = document.createElement("input");
    el.type = "checkbox";
    document.body.append(el);
    bindValue(el, cell, { property: "checked" });
    el.focus();
    el.checked = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    cell(false); // an echo mid-interaction
    expect(el.checked).toBe(true);
    el.blur();
    el.dispatchEvent(new Event("blur"));
    expect(el.checked).toBe(false);
    remove(el);
    cell(true);
    expect(el.checked).toBe(false); // dead binding
  });
});
