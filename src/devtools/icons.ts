// Lucide icons (https://lucide.dev) as inline SVG; stroke inherits currentColor. Shared by the
// panel chrome, the graph tree, and the theme menu.

export function svgMarkup(inner: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
export const ICON_MINIMIZE =
  '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>';
export const ICON_MAXIMIZE =
  '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>';
export const ICON_SUN =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
export const ICON_MOON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
export const ICON_MONITOR =
  '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>';
export const ICON_SETTINGS =
  '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>';
// State markers: a filled dot when the cell drives a DOM element downstream (bound — the hover
// highlight can outline it), a hollow ring otherwise (text-only or unread). Computed = function (ƒ).
export const ICON_BOUND =
  '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>';
export const ICON_UNBOUND = '<circle cx="12" cy="12" r="5"/>';
export const ICON_COMPUTED =
  '<path d="M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8"/>';
export const ICON_CHEVRON = '<path d="m6 9 6 6 6-6"/>';
// lucide crosshair — "scroll this group's rendered output into view".
export const ICON_LOCATE =
  '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>';

// Trash (Lucide `trash`) — the Trace tab's clear control.
export const ICON_CLEAR =
  '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>';

// Lucide `pause` / `play` — the Trace tab's pause/resume toggle.
export const ICON_PAUSE =
  '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>';
export const ICON_PLAY = '<polygon points="6 3 20 12 6 21 6 3"/>';

// Parse an SVG markup string into its <svg> element. Shared by icon() here and barIcon() in the
// panel chrome (which builds a different viewBox).
export function elementFromMarkup(markup: string): Element {
  const tmp = document.createElement("div");
  tmp.innerHTML = markup;
  const svg = tmp.firstElementChild;
  if (!svg) throw new Error("icon markup produced no element");
  return svg;
}

// Build an <svg> element from icon markup at the given size.
export function icon(inner: string, size: number): Element {
  return elementFromMarkup(svgMarkup(inner, size));
}

// The Loom brand mark (two interlocked links) for the header — the same artwork as the repo
// `assets/loom.svg`, self-colored via gradients so it ignores currentColor and reads on either
// theme. Gradient ids are namespaced (`li-loom-*`) to avoid colliding with the host page.
export function loomLogo(size: number): Element {
  return elementFromMarkup(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 96 96" fill="none" aria-hidden="true">` +
      "<defs>" +
      '<linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient>' +
      '<linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient>' +
      "</defs>" +
      '<rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/>' +
      '<rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/>' +
      '<path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/>' +
      "</svg>",
  );
}
