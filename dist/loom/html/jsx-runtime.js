import { n as e } from "../jsx-props-sAPN8GVq.js";
import { a as t, i as n, r } from "../html-B5P8BsRz.js";
//#region src/html/jsx-runtime.ts
var i = /^[A-Za-z][A-Za-z0-9:._-]*$/, a = /* @__PURE__ */ new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
function o(e, t, n) {
	return u(e, t, !1);
}
var s = o;
function c(e) {
	return e?.children ?? [];
}
function l(e, t, n, r, i, a) {
	return u(e, t, !0);
}
function u(t, i, a) {
	return typeof t == "function" ? n(r(t(e(i)))) : d(t, i, a);
}
function d(e, o, s) {
	if (!i.test(e)) throw Error(`Invalid HTML tag name "${e}".`);
	let c = `<${e}`, l;
	if (o) {
		for (let n in o) if (Object.hasOwn(o, n)) {
			if (n === "children") {
				l = o[n];
				continue;
			}
			c += t(e, n, o[n], s);
		}
	}
	return c += ">", a.has(e) || (c += r(l), c += `</${e}>`), n(c);
}
//#endregion
export { c as Fragment, o as jsx, l as jsxDEV, s as jsxs };
