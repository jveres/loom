// Popover discipline, learned the hard way: the menu belongs to the WHOLE
// control (it aligns with the group's left edge, not with the chevron that
// opened it), the toggle carries aria-expanded, and dismissal is factory
// behavior — outside pointerdown or Escape — wired as an effect cleanup
// that dies with the menu.
import { state } from "loom";
import { bind, when } from "loom/dom";

const open = state(false);
const picked = state("(nothing yet)");

const pick = (item: string) => {
  picked(item);
  open(false);
};

const group = (
  <span class="row menu-host">
    <button type="button" onclick={() => pick("Save")}>
      Save
    </button>
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onclick={() => open(!open())}
    >
      ▾
    </button>
    {when(open, () => {
      const menu = (
        <span class="menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onclick={() => pick("Save as Version…")}
          >
            Save as Version…
          </button>
          <button type="button" role="menuitem" onclick={() => pick("Export…")}>
            Export…
          </button>
        </span>
      );
      bind(menu, () => {
        const away = (event: PointerEvent) => {
          if (!group.contains(event.target as Node)) open(false);
        };
        const key = (event: KeyboardEvent) => {
          if (event.key === "Escape") open(false);
        };
        document.addEventListener("pointerdown", away);
        document.addEventListener("keydown", key);
        return () => {
          document.removeEventListener("pointerdown", away);
          document.removeEventListener("keydown", key);
        };
      });
      return menu;
    })}
  </span>
);

export default (
  <div class="col">
    {group}
    <p class="mono">{() => `picked: ${picked()}`}</p>
    <p class="muted">
      The listeners exist only while the menu does — when() disposes the subtree
      and the bind's cleanup runs.
    </p>
  </div>
);
