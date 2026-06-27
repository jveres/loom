// A soft edge fade for a scroll container, masking only as far as content is actually clipped (so a
// fully-scrolled edge is sharp). Drives two CSS custom properties the `.li-fade-y` / `.li-fade-x`
// mask reads; rAF-throttled, auto-refreshing on scroll and resize. Shared by the panel body and the
// Events list. Returns refresh() (for content changes the ResizeObserver can't see) and dispose().
export function wireScrollFade(
  scroller: HTMLElement,
  axis: "x" | "y",
): { refresh: () => void; dispose: () => void } {
  const FADE = 16;
  const DEAD = 6;
  let frame = 0;
  const update = (): void => {
    frame = 0;
    const size = axis === "x" ? scroller.clientWidth : scroller.clientHeight;
    const full = axis === "x" ? scroller.scrollWidth : scroller.scrollHeight;
    const before = axis === "x" ? scroller.scrollLeft : scroller.scrollTop;
    const after = Math.max(0, full - size) - before;
    scroller.style.setProperty(
      "--li-fade-a",
      `${before < DEAD ? 0 : Math.min(before, FADE)}px`,
    );
    scroller.style.setProperty(
      "--li-fade-b",
      `${after < DEAD ? 0 : Math.min(after, FADE)}px`,
    );
  };
  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };
  scroller.addEventListener("scroll", schedule, { passive: true });
  const ro =
    typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
  ro?.observe(scroller);
  schedule();
  return {
    refresh: schedule,
    dispose: (): void => {
      scroller.removeEventListener("scroll", schedule);
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    },
  };
}
