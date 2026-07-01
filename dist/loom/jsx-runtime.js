import { h as e } from "./dom.js";
//#region src/dom/jsx-runtime.ts
function t(e, t, n) {
	return a(e, t);
}
var n = t;
function r(e) {
	return e?.children ?? [];
}
function i(e, t, n, r, i, o) {
	return a(e, t);
}
function a(e, t) {
	return typeof e == "function" ? e(s(t)) : o(e, t);
}
function o(t, n) {
	if (!n) return e(t);
	let r = n.children;
	if (!("children" in n || "htmlFor" in n || "key" in n)) return e(t, n);
	let i = {};
	for (let e in n) !Object.hasOwn(n, e) || e === "children" || e === "key" || (e === "htmlFor" ? i.for = n[e] : i[e] = n[e]);
	return e(t, i, r);
}
function s(e) {
	let t = {};
	if (e) for (let n in e) !Object.hasOwn(e, n) || n === "key" || (t[n] = e[n]);
	return t;
}
//#endregion
export { r as Fragment, t as jsx, i as jsxDEV, n as jsxs };
