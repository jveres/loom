import { n as e, t } from "./jsx-props-BmFOdt8N.js";
// src/html/escape.ts
var n = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
}, r = /[&<>"']/, i = /[&<>"']/g;
function a(e) {
	return r.test(e) ? e.replace(i, (e) => n[e]) : e;
}
function o(e) {
	return a(e);
}
var s = {};
for (let e in n) s[n[e]] = e;
var c = new RegExp(Object.values(n).join("|"), "g");
function l(e) {
	return e.replace(c, (e) => s[e] ?? e);
}
// src/html/attributes.ts
var u = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, d = /^(?:--|-?)[A-Za-z][A-Za-z0-9-]*$/, f = /["<>{};]/g, p = /^(?:(?:java|vb)script:|data:(?:text\/(?:html|xml)|application\/xhtml\+xml|image\/svg))/i, m = /[\u0000-\u0020]/g, h = /^(?:[^:]+:)?(?:href|src|action|formaction|cite|data|poster)$/;
function g(e, t, n) {
	console.warn(`[loom/html] dropped <${e}> attribute "${t}": ${n}`);
}
function _(t, n, r, i) {
	if (r == null || n === "key" || n === "__proto__" || n === "constructor" || n === "prototype" || n.startsWith("on")) return "";
	let o = n === "className" ? "class" : n === "htmlFor" ? "for" : n, s = typeof r == "function" ? r() : r;
	if (s == null || s === !1 && !e(o)) return "";
	if (!u.test(o)) return i && g(t, n, "not a valid HTML attribute name"), "";
	if (o === "class" && typeof s != "string" ? s = v(s) : o === "style" && s && typeof s == "object" && (s = y(s)), s === !0) return ` ${o}`;
	let c = typeof s == "string" ? s : `${s}`;
	return c.includes(":") && h.test(o) && p.test(c.replace(m, "")) ? (i && g(t, n, "unsafe URL scheme"), "") : ` ${o}="${a(c)}"`;
}
function v(e) {
	if (typeof e == "string") return e;
	if (typeof e == "function") return v(e());
	let t = "";
	if (Array.isArray(e)) {
		for (let n of e) {
			let e = n && v(n);
			e && (t = t ? `${t} ${e}` : e);
		}
		return t;
	}
	if (e && typeof e == "object") {
		for (let n in e) {
			let r = Object.hasOwn(e, n) && e[n];
			(typeof r == "function" ? r() : r) && (t = t ? `${t} ${n}` : n);
		}
		return t;
	}
	return `${e}`;
}
function y(e, n = "") {
	if (Array.isArray(e)) {
		for (let t of e) n = y(t, n);
		return n;
	}
	if (!e) return n;
	if (typeof e == "string") return e;
	if (typeof e == "object") for (let r in e) {
		if (!Object.hasOwn(e, r)) continue;
		let i = e[r];
		if (typeof i == "function" && (i = i()), i == null || !d.test(r)) continue;
		let a = typeof i == "number" ? `${i}` : `${i}`.replace(f, "");
		(a.includes("(") || a.includes(":")) && /expression\(|^\s*javascript:/i.test(a.replace(m, "")) || (n = `${n ? `${n};` : ""}${t(r)}:${a}`);
	}
	return n;
}
function b(e, t) {
	let n = "", r = t?.tag ?? "element", i = t?.dev === !0;
	for (let t in e) Object.hasOwn(e, t) && (n += _(r, t, e[t], i));
	return n;
}
// src/html/index.ts
var x = Symbol.for("loom.html");
function S() {
	return this.value;
}
function C(e) {
	return {
		[x]: !0,
		value: e,
		toString: S
	};
}
function w(e, ...t) {
	let n = e[0] ?? "";
	for (let r = 0; r < t.length; r++) n += T(t[r]) + (e[r + 1] ?? "");
	return C(n);
}
function T(e) {
	if (typeof e == "string") return a(e);
	if (e == null || typeof e == "boolean") return "";
	if (Array.isArray(e)) {
		let t = "";
		for (let n = 0; n < e.length; n++) t += T(e[n]);
		return t;
	}
	return E(e) ? e.value : a(`${e}`);
}
function E(e) {
	let t = e;
	return !!(t && typeof t == "object" && t[x] === !0 && typeof t.value == "string" && typeof t.toString == "function" && Object.hasOwn(t, x));
}
var D = (e, t) => RegExp(`\\s${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${t}`, "i");
function O(e, t) {
	let n = k(typeof e == "string" ? e : e.value);
	if (!n) return;
	let r = D(t, "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'>]+))").exec(n);
	return r ? l(r[1] ?? r[2] ?? r[3] ?? "") : D(t, "(?=\\s|$)").test(n) ? "" : void 0;
}
function k(e) {
	let t = /^\s*<[a-zA-Z]/.test(e) ? e.indexOf(">") : -1;
	return t < 0 ? void 0 : e.slice(0, t);
}
function A(e, t, n = {}) {
	let r = k(e.value);
	if (!r) throw Error("withRootAttributes: the value has no root element tag.");
	let i = e.value.slice(r.length), a = {};
	for (let [e, i] of Object.entries(t)) {
		let t = n.merge?.[e];
		if (t != null && i != null && i !== !1) {
			let n = D(e, "=\"([^\"]*)\"").exec(r);
			if (n) {
				let a = `${l(n[1] ?? "")}${t}${i === !0 ? "" : i}`;
				r = r.replace(n[0], () => b({ [e]: a }));
				continue;
			}
		}
		a[e] = i;
	}
	return C(`${r}${b(a, n)}${i}`);
}
export { C as a, b as c, T as i, o as l, w as n, A as o, E as r, _ as s, O as t, a as u };
