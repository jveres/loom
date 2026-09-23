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
var i = Object.fromEntries(Object.entries(t).map(([e, t]) => [t, e])), a = new RegExp(Object.values(t).join("|"), "g");
function o(e) {
	return e.replace(a, (e) => i[e] ?? e);
}
//#endregion
//#region src/html/attributes.ts
var s = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, c = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, l = /^(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, u = /[\u0000-\u0020]/g, d = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]);
function f(e, t, n) {
	console.warn(`[loom/html] dropped <${e}> attribute "${t}": ${n}`);
}
function p(e, t, n, i) {
	if (n == null || t === "key" || t === "__proto__" || t === "constructor" || t === "prototype") return "";
	let a = t, o = n;
	if (a === "className" && (a = "class"), a === "htmlFor" && (a = "for"), a.startsWith("on") || (typeof o == "function" && (o = o()), o == null || o === !1 && !_(a))) return "";
	if (!s.test(a)) return i && f(e, t, "not a valid HTML attribute name"), "";
	if (a === "class" && (o = m(o)), a === "style" && o && typeof o == "object" && (o = h(o)), o === !0) return ` ${a}`;
	let c = String(o);
	return v(a) && l.test(c.replace(u, "")) ? (i && f(e, t, "unsafe URL scheme"), "") : ` ${a}="${r(c)}"`;
}
function m(e) {
	if (typeof e == "function") return m(e());
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = m(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!(typeof e == "function" ? e() : e)).map(([e]) => e).join(" ") : String(e);
}
function h(e) {
	let t = [];
	return g(e, t), t.join(";");
}
function g(t, n) {
	if (Array.isArray(t)) {
		for (let e of t) g(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			n.length = 0, n.push(t);
			return;
		}
		if (typeof t == "object") for (let [r, i] of Object.entries(t)) {
			let t = typeof i == "function" ? i() : i;
			if (t == null || !c.test(r)) continue;
			let a = String(t).replace(/["<>{};]/g, ""), o = a.replace(u, "");
			/expression\(/i.test(o) || /^\s*javascript:/i.test(o) || n.push(`${e(r)}:${a}`);
		}
	}
}
function _(e) {
	return e.startsWith("aria-");
}
function v(e) {
	return d.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
function y(e, t = {}) {
	let n = "", r = t.tag ?? "element";
	for (let i in e) Object.hasOwn(e, i) && (n += p(r, i, e[i], t.dev === !0));
	return n;
}
//#endregion
//#region src/html/index.ts
var b = Symbol.for("loom.html");
function x(e) {
	return {
		[b]: !0,
		value: e,
		toString: () => e
	};
}
function S(e, ...t) {
	let n = e[0] ?? "";
	for (let r = 0; r < t.length; r++) n += C(t[r]), n += e[r + 1] ?? "";
	return x(n);
}
function C(e) {
	if (Array.isArray(e)) {
		let t = "";
		for (let n of e) t += C(n);
		return t;
	}
	return e == null || e === !0 || e === !1 ? "" : w(e) ? e.value : n(String(e));
}
function w(e) {
	return typeof e == "object" && !!e && Object.hasOwn(e, b) && e[b] === !0 && typeof e.value == "string" && typeof e.toString == "function";
}
function T(e, t) {
	let n = E(typeof e == "string" ? e : e.value);
	if (n === void 0) return;
	let r = D(t), i = RegExp(`\\s${r}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(n);
	return i ? o(i[1] ?? i[2] ?? i[3] ?? "") : RegExp(`\\s${r}(?=\\s|$)`, "i").test(n) ? "" : void 0;
}
function E(e) {
	if (!/^\s*<[a-zA-Z]/.test(e)) return;
	let t = e.indexOf(">");
	return t === -1 ? void 0 : e.slice(0, t);
}
function D(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function O(e, t, n = {}) {
	let r = E(e.value);
	if (r === void 0) throw Error("withRootAttributes: the value has no root element tag.");
	let i = r, a = e.value.slice(r.length), s = {};
	for (let [e, r] of Object.entries(t)) {
		let t = n.merge?.[e];
		if (t !== void 0 && r != null && r !== !1) {
			let n = RegExp(`\\s${D(e)}="([^"]*)"`, "i").exec(i);
			if (n) {
				let a = `${o(n[1] ?? "")}${t}${r === !0 ? "" : String(r)}`;
				i = i.replace(n[0], () => y({ [e]: a }));
				continue;
			}
		}
		s[e] = r;
	}
	return x(`${i}${y(s, n.tag ? { tag: n.tag } : {})}${a}`);
}
//#endregion
export { x as a, y as c, C as i, r as l, S as n, O as o, w as r, p as s, T as t, n as u };
