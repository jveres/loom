import { h as e } from "./dom.js";
import { t } from "./jsx-props-0B9e31e8.js";
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
function o(e, n) {
	return typeof e == "function" ? e(t(n)) : s(e, n);
}
function s(t, n) {
	if (!n) return e(t);
	let r = n.children;
	if (!("children" in n || "htmlFor" in n || "key" in n)) return e(t, n);
	let i = {};
	for (let e in n) !Object.hasOwn(n, e) || e === "children" || e === "key" || (e === "htmlFor" ? i.for = n[e] : i[e] = n[e]);
	return e(t, i, r);
}
//#endregion
export { i as Fragment, n as jsx, a as jsxDEV, r as jsxs };
