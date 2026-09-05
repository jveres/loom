import { r as e } from "./ownership-base-hl0GKMLF.js";
import { n as t } from "./lifetime-D9QsK10p.js";
//#region src/dom/lifetime.ts
function n(n, r) {
	let i = t(r);
	return i.active && i.add(e(n, i.stop)), i;
}
//#endregion
export { n as t };
