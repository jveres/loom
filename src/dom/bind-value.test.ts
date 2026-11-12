// @vitest-environment happy-dom
import { batch, type State, state, writable } from "loom";
import { bindValue, remove } from "loom/dom";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
});
function field(cell: State<string>): HTMLInputElement {
  const el = document.createElement("input");
  document.body.append(el);
  bindValue(el, cell);
  return el;
}
function type(el: HTMLInputElement, value: string, isComposing = false): void {
  el.value = value;
  el.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing }));
}
// Count every write to the element's property, through its native accessor.
function countWrites(el: HTMLInputElement, property: "value" | "checked") {
  let proto: object | null = el;
  let native: PropertyDescriptor | undefined;
  while (proto && !native) {
    native = Object.getOwnPropertyDescriptor(proto, property);
    proto = Object.getPrototypeOf(proto);
  }
  let writes = 0;
  Object.defineProperty(el, property, {
    configurable: true,
    get() {
      return native?.get?.call(el);
    },
    set(next) {
      writes++;
      native?.set?.call(el, next);
    },
  });
  return () => writes;
}
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
  it("writes an outside change into the focused field", () => {
    const cell = state("", { label: "test.bindValue.focus" });
    const el = field(cell);
    el.focus();
    type(el, "draft");
    cell(""); // the program empties the field after a submit
    expect(el.value).toBe("");
  });
  it("never writes the field's own input back, even when the state rewrites it", () => {
    const raw = state("");
    const cell = writable(() => raw().toUpperCase(), raw);
    const el = field(cell);
    const writes = countWrites(el, "value");
    el.focus();
    type(el, "ab");
    batch(() => type(el, "abc"));
    expect(cell()).toBe("ABC");
    expect(el.value).toBe("abc"); // the caret stays where the human typed
    expect(writes()).toBe(2); // only the human's two edits
    el.blur();
    el.dispatchEvent(new Event("blur"));
    expect(el.value).toBe("ABC"); // the state's value lands when focus leaves
  });
  it("writes nothing when the value equals the field's value", () => {
    const cell = state("", { label: "test.bindValue.equal" });
    const el = field(cell);
    const writes = countWrites(el, "value");
    el.focus();
    el.value = "same"; // changed without an input event
    cell("same");
    expect(writes()).toBe(1); // only the test's own write
  });
  it("holds an outside change during a composition; the last value wins at its end", () => {
    const cell = state("", { label: "test.bindValue.compose" });
    const el = field(cell);
    el.focus();
    el.dispatchEvent(new Event("compositionstart"));
    type(el, "ka", true);
    cell("first");
    cell("second");
    expect(el.value).toBe("ka");
    el.dispatchEvent(new Event("compositionend"));
    expect(el.value).toBe("second");
  });
  it("keeps what the human composed after an outside change", () => {
    const cell = state("", { label: "test.bindValue.compose.typed" });
    const el = field(cell);
    el.focus();
    el.dispatchEvent(new Event("compositionstart"));
    cell("outside");
    type(el, "kana", true);
    el.dispatchEvent(new Event("compositionend"));
    expect(el.value).toBe("kana");
    expect(cell()).toBe("kana");
  });
  it("treats an input event that is composing as a composition", () => {
    const cell = state("", { label: "test.bindValue.isComposing" });
    const el = field(cell);
    el.focus();
    type(el, "k", true); // the binding missed compositionstart
    cell("outside");
    expect(el.value).toBe("k");
    el.dispatchEvent(new Event("compositionend"));
    expect(el.value).toBe("outside");
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
  it("writes an outside change into the focused control", () => {
    const cell = state(false, { label: "test.bindValue.checked.focus" });
    const el = document.createElement("input");
    el.type = "checkbox";
    document.body.append(el);
    bindValue(el, cell, { property: "checked" });
    const writes = countWrites(el, "checked");
    el.focus();
    el.checked = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(cell()).toBe(true);
    expect(writes()).toBe(1); // only the test's own click
    cell(false); // a reset while the control has the focus
    expect(el.checked).toBe(false);
    remove(el);
    cell(true);
    expect(el.checked).toBe(false); // dead binding
  });
});
