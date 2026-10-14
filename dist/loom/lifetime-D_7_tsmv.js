import { r as e } from "./ownership-base-1B2CbISn.js";
import { n as t } from "./lifetime-CYx3KLZ0.js";
//#region src/dom/lifetime.ts
function n(n, r) {
	let i = t(r);
	return i.active && i.add(e(n, i.stop)), i;
}
//#endregion
export { n as t };
