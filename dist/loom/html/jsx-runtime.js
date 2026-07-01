import { t as e } from "../jsx-props-0B9e31e8.js";
import { escapeAttribute as t, renderToString as n, unsafeHtml as r } from "../html.js";
//#region src/html/jsx-runtime.ts
var i = /^[A-Za-z][A-Za-z0-9:._-]*$/, a = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, o = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, s = /^(?:\s*)(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, c = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]), l = /* @__PURE__ */ new Set([
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
function u(e, t, n) {
	return m(e, t);
}
var d = u;
function f(e) {
	return r(n(e?.children));
}
function p(e, t, n, r, i, a) {
	return m(e, t);
}
function m(t, i) {
	return typeof t == "function" ? r(n(t(e(i)))) : h(t, i);
}
function h(e, t) {
	if (!i.test(e)) throw Error(`Invalid HTML tag name "${e}".`);
	let a = `<${e}`, o;
	if (t) {
		for (let e in t) if (Object.hasOwn(t, e)) {
			if (e === "children") {
				o = t[e];
				continue;
			}
			a += g(e, t[e]);
		}
	}
	return a += ">", l.has(e) || (a += n(o), a += `</${e}>`), r(a);
}
function g(e, n) {
	if (n == null || n === !1 || e === "key" || e === "__proto__" || e === "constructor" || e === "prototype") return "";
	let r = e, i = n;
	if (r === "className" && (r = "class"), r === "htmlFor" && (r = "for"), r.startsWith("on") || !a.test(r)) return "";
	if (r === "class" && (i = _(i)), r === "style" && i && typeof i == "object" && (i = v(i)), i === !0) return ` ${r}`;
	let o = String(i);
	return b(r) && s.test(o) ? "" : ` ${r}="${t(o)}"`;
}
function _(e) {
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = _(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!e).map(([e]) => e).join(" ") : String(e);
}
function v(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) {
		if (r == null || !o.test(n)) continue;
		let e = String(r).replace(/["<>{};]/g, "");
		/expression\(/i.test(e) || /^\s*javascript:/i.test(e) || t.push(`${y(n)}:${e}`);
	}
	return t.join(";");
}
function y(e) {
	return e.startsWith("--") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function b(e) {
	return c.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
//#endregion
export { f as Fragment, u as jsx, p as jsxDEV, d as jsxs };
