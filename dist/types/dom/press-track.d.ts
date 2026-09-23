import type { Stop } from "../loom.js";
/** Track one primary-button press at a time on `el`: `onChange(true)` at pointerdown, then
 *  `onChange(false)` when that pointer is released, cancelled, or leaves `el`. A second pointer
 *  landing mid-press neither restarts nor steals the sequence. Window listeners exist only during
 *  a press. `when` is read untracked at contact; returning false ignores the press. The returned
 *  stop removes every listener without reporting a final `false`. Shared by pressed() and
 *  pressClass(). */
export declare function trackPress(el: Element, onChange: (pressed: boolean) => void, when?: () => boolean): Stop;
