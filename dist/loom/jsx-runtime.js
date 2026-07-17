import { n as e } from "./jsx-props-sAPN8GVq.js";
import { a as t } from "./dom-D_4lRDUq.js";
//#region src/dom/jsx-runtime.ts
function n(e, t, n) {
	return o(e, t);
}
var r = n;
function i(e) {
	return e?.children ?? [];
}
function a(e, t, n, r, i, a) {
	return o(e, t);
}
function o(t, n) {
	return typeof t == "function" ? t(e(n)) : s(t, n);
}
function s(e, n) {
	if (!n) return t(e);
	if (!("htmlFor" in n) && !("key" in n)) return t(e, n, n.children);
	let r = {};
	for (let e in n) !Object.hasOwn(n, e) || e === "children" || e === "key" || (e === "htmlFor" ? r.for = n[e] : r[e] = n[e]);
	return t(e, r, n.children);
}
//#endregion
export { i as Fragment, n as jsx, a as jsxDEV, r as jsxs };
