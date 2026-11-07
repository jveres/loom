import { n as e } from "./lifetime-BJiN2AyE.js";
import { r as t } from "./ownership-base-SRCUIJtL.js";
// src/dom/lifetime.ts
function n(n, r) {
	let i = e(r);
	return i.active && i.add(t(n, i.stop)), i;
}
export { n as t };
