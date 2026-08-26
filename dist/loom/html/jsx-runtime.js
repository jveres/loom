import { n as e } from "../jsx-props-sAPN8GVq.js";
import { a as t, i as n, o as r } from "../html-C2irJAB9.js";
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
function u(r, i, a) {
	return typeof r == "function" ? t(n(r(e(i)))) : d(r, i, a);
}
function d(e, o, s) {
	if (!i.test(e)) throw Error(`Invalid HTML tag name "${e}".`);
	let c = `<${e}`, l;
	if (o) {
		for (let t in o) if (Object.hasOwn(o, t)) {
			if (t === "children") {
				l = o[t];
				continue;
			}
			c += r(e, t, o[t], s);
		}
	}
	return c += ">", a.has(e) || (c += n(l), c += `</${e}>`), t(c);
}
//#endregion
export { c as Fragment, o as jsx, l as jsxDEV, s as jsxs };
