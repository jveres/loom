import { t as e } from "./jsx-props-sAPN8GVq.js";
//#region src/html/escape.ts
var t = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
};
function n(e) {
	return e.replace(/[&<>"']/g, (e) => t[e]);
}
function r(e) {
	return n(e);
}
//#endregion
//#region src/html/attributes.ts
var i = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, a = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, o = /^(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, s = /[\u0000-\u0020]/g, c = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]);
function l(e, t, n) {
	console.warn(`[loom/html] dropped <${e}> attribute "${t}": ${n}`);
}
function u(e, t, n, a) {
	if (n == null || t === "key" || t === "__proto__" || t === "constructor" || t === "prototype") return "";
	let c = t, u = n;
	if (c === "className" && (c = "class"), c === "htmlFor" && (c = "for"), c.startsWith("on") || (typeof u == "function" && (u = u()), u == null || u === !1 && !p(c))) return "";
	if (!i.test(c)) return a && l(e, t, "not a valid HTML attribute name"), "";
	if (c === "class" && (u = d(u)), c === "style" && u && typeof u == "object" && (u = f(u)), u === !0) return ` ${c}`;
	let h = String(u);
	return m(c) && o.test(h.replace(s, "")) ? (a && l(e, t, "unsafe URL scheme"), "") : ` ${c}="${r(h)}"`;
}
function d(e) {
	if (typeof e == "function") return d(e());
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = d(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!(typeof e == "function" ? e() : e)).map(([e]) => e).join(" ") : String(e);
}
function f(t) {
	let n = [];
	for (let [r, i] of Object.entries(t)) {
		let t = typeof i == "function" ? i() : i;
		if (t == null || !a.test(r)) continue;
		let o = String(t).replace(/["<>{};]/g, ""), c = o.replace(s, "");
		/expression\(/i.test(c) || /^\s*javascript:/i.test(c) || n.push(`${e(r)}:${o}`);
	}
	return n.join(";");
}
function p(e) {
	return e.startsWith("aria-");
}
function m(e) {
	return c.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
function h(e, t = {}) {
	let n = "", r = t.tag ?? "element";
	for (let i in e) Object.hasOwn(e, i) && (n += u(r, i, e[i], t.dev === !0));
	return n;
}
//#endregion
//#region src/html/index.ts
var g = Symbol.for("loom.html");
function _(e) {
	return {
		[g]: !0,
		value: e,
		toString: () => e
	};
}
function v(e, ...t) {
	let n = e[0] ?? "";
	for (let r = 0; r < t.length; r++) n += y(t[r]), n += e[r + 1] ?? "";
	return _(n);
}
function y(e) {
	if (Array.isArray(e)) {
		let t = "";
		for (let n of e) t += y(n);
		return t;
	}
	return e == null || e === !0 || e === !1 ? "" : b(e) ? e.value : n(String(e));
}
function b(e) {
	return typeof e == "object" && !!e && Object.hasOwn(e, g) && e[g] === !0 && typeof e.value == "string" && typeof e.toString == "function";
}
//#endregion
export { u as a, n as c, _ as i, b as n, h as o, y as r, r as s, v as t };
