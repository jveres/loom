import { escapeAttribute as e, renderToString as t, unsafeHtml as n } from "../html.js";
//#region src/html/jsx-runtime.ts
var r = /^[A-Za-z][A-Za-z0-9:._-]*$/, i = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, a = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, o = /^(?:\s*)(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, s = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]), c = /* @__PURE__ */ new Set([
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
function l(e, t, n) {
	return p(e, t);
}
var u = l;
function d(e) {
	return n(t(e?.children));
}
function f(e, t, n, r, i, a) {
	return p(e, t);
}
function p(e, r) {
	return typeof e == "function" ? n(t(e(b(r)))) : m(e, r);
}
function m(e, i) {
	if (!r.test(e)) throw Error(`Invalid HTML tag name "${e}".`);
	let a = `<${e}`, o;
	if (i) {
		for (let e in i) if (Object.hasOwn(i, e)) {
			if (e === "children") {
				o = i[e];
				continue;
			}
			a += h(e, i[e]);
		}
	}
	return a += ">", c.has(e) || (a += t(o), a += `</${e}>`), n(a);
}
function h(t, n) {
	if (n == null || n === !1 || t === "key" || t === "__proto__" || t === "constructor" || t === "prototype") return "";
	let r = t, a = n;
	if (r === "className" && (r = "class"), r === "htmlFor" && (r = "for"), r.startsWith("on") || !i.test(r)) return "";
	if (r === "class" && (a = g(a)), r === "style" && a && typeof a == "object" && (a = _(a)), a === !0) return ` ${r}`;
	let s = String(a);
	return y(r) && o.test(s) ? "" : ` ${r}="${e(s)}"`;
}
function g(e) {
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = g(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!e).map(([e]) => e).join(" ") : String(e);
}
function _(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) {
		if (r == null || !a.test(n)) continue;
		let e = String(r).replace(/["<>{};]/g, "");
		/expression\(/i.test(e) || /^\s*javascript:/i.test(e) || t.push(`${v(n)}:${e}`);
	}
	return t.join(";");
}
function v(e) {
	return e.startsWith("--") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function y(e) {
	return s.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
function b(e) {
	let t = {};
	if (e) for (let n in e) !Object.hasOwn(e, n) || n === "key" || (t[n] = e[n]);
	return t;
}
//#endregion
export { d as Fragment, l as jsx, f as jsxDEV, u as jsxs };
