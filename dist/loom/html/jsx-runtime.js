import { t as e } from "../jsx-props-0B9e31e8.js";
import { escapeAttribute as t, renderToString as n, unsafeHtml as r } from "../html.js";
//#region src/html/jsx-runtime.ts
var i = /^[A-Za-z][A-Za-z0-9:._-]*$/, a = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, o = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, s = /^(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, c = /[\u0000-\u0020]/g, l = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]), u = /* @__PURE__ */ new Set([
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
function d(e, t, n) {
	return h(e, t, !1);
}
var f = d;
function p(e) {
	return r(n(e?.children));
}
function m(e, t, n, r, i, a) {
	return h(e, t, !0);
}
function h(t, i, a) {
	return typeof t == "function" ? r(n(t(e(i)))) : g(t, i, a);
}
function g(e, t, a) {
	if (!i.test(e)) throw Error(`Invalid HTML tag name "${e}".`);
	let o = `<${e}`, s;
	if (t) {
		for (let n in t) if (Object.hasOwn(t, n)) {
			if (n === "children") {
				s = t[n];
				continue;
			}
			o += v(e, n, t[n], a);
		}
	}
	return o += ">", u.has(e) || (o += n(s), o += `</${e}>`), r(o);
}
function _(e, t, n) {
	console.warn(`[loom/html] dropped <${e}> attribute "${t}": ${n}`);
}
function v(e, n, r, i) {
	if (r == null || r === !1 || n === "key" || n === "__proto__" || n === "constructor" || n === "prototype") return "";
	let o = n, l = r;
	if (o === "className" && (o = "class"), o === "htmlFor" && (o = "for"), o.startsWith("on")) return "";
	if (!a.test(o)) return i && _(e, n, "not a valid HTML attribute name"), "";
	if (o === "class" && (l = y(l)), o === "style" && l && typeof l == "object" && (l = b(l)), l === !0) return ` ${o}`;
	let u = String(l);
	return S(o) && s.test(u.replace(c, "")) ? (i && _(e, n, "unsafe URL scheme"), "") : ` ${o}="${t(u)}"`;
}
function y(e) {
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = y(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!e).map(([e]) => e).join(" ") : String(e);
}
function b(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) {
		if (r == null || !o.test(n)) continue;
		let e = String(r).replace(/["<>{};]/g, ""), i = e.replace(c, "");
		/expression\(/i.test(i) || /^\s*javascript:/i.test(i) || t.push(`${x(n)}:${e}`);
	}
	return t.join(";");
}
function x(e) {
	return e.startsWith("--") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function S(e) {
	return l.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
//#endregion
export { p as Fragment, d as jsx, m as jsxDEV, f as jsxs };
