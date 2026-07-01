import { n as e, t } from "../jsx-props-sAPN8GVq.js";
import { escapeAttribute as n, renderToString as r, unsafeHtml as i } from "../html.js";
//#region src/html/jsx-runtime.ts
var a = /^[A-Za-z][A-Za-z0-9:._-]*$/, o = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, s = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, c = /^(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, l = /[\u0000-\u0020]/g, u = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]), d = /* @__PURE__ */ new Set([
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
function f(e, t, n) {
	return g(e, t, !1);
}
var p = f;
function m(e) {
	return i(r(e?.children));
}
function h(e, t, n, r, i, a) {
	return g(e, t, !0);
}
function g(t, n, a) {
	return typeof t == "function" ? i(r(t(e(n)))) : _(t, n, a);
}
function _(e, t, n) {
	if (!a.test(e)) throw Error(`Invalid HTML tag name "${e}".`);
	let o = `<${e}`, s;
	if (t) {
		for (let r in t) if (Object.hasOwn(t, r)) {
			if (r === "children") {
				s = t[r];
				continue;
			}
			o += y(e, r, t[r], n);
		}
	}
	return o += ">", d.has(e) || (o += r(s), o += `</${e}>`), i(o);
}
function v(e, t, n) {
	console.warn(`[loom/html] dropped <${e}> attribute "${t}": ${n}`);
}
function y(e, t, r, i) {
	if (r == null || r === !1 || t === "key" || t === "__proto__" || t === "constructor" || t === "prototype") return "";
	let a = t, s = r;
	if (a === "className" && (a = "class"), a === "htmlFor" && (a = "for"), a.startsWith("on")) return "";
	if (!o.test(a)) return i && v(e, t, "not a valid HTML attribute name"), "";
	if (a === "class" && (s = b(s)), a === "style" && s && typeof s == "object" && (s = x(s)), s === !0) return ` ${a}`;
	let u = String(s);
	return S(a) && c.test(u.replace(l, "")) ? (i && v(e, t, "unsafe URL scheme"), "") : ` ${a}="${n(u)}"`;
}
function b(e) {
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = b(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!e).map(([e]) => e).join(" ") : String(e);
}
function x(e) {
	let n = [];
	for (let [r, i] of Object.entries(e)) {
		if (i == null || !s.test(r)) continue;
		let e = String(i).replace(/["<>{};]/g, ""), a = e.replace(l, "");
		/expression\(/i.test(a) || /^\s*javascript:/i.test(a) || n.push(`${t(r)}:${e}`);
	}
	return n.join(";");
}
function S(e) {
	return u.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
//#endregion
export { m as Fragment, f as jsx, h as jsxDEV, p as jsxs };
