import { n as e, t } from "./jsx-props-CBvsxEaL.js";
//#region src/html/escape.ts
var n = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
};
function r(e) {
	return e.replace(/[&<>"']/g, (e) => n[e]);
}
function i(e) {
	return r(e);
}
var a = Object.fromEntries(Object.entries(n).map(([e, t]) => [t, e])), o = new RegExp(Object.values(n).join("|"), "g");
function s(e) {
	return e.replace(o, (e) => a[e] ?? e);
}
//#endregion
//#region src/html/attributes.ts
var c = /^[A-Za-z_:][A-Za-z0-9:._-]*$/, l = /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/, u = /^(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i, d = /[\u0000-\u0020]/g, f = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"formaction",
	"cite",
	"data",
	"poster"
]);
function p(e, t, n) {
	console.warn(`[loom/html] dropped <${e}> attribute "${t}": ${n}`);
}
function m(t, n, r, a) {
	if (r == null || n === "key" || n === "__proto__" || n === "constructor" || n === "prototype") return "";
	let o = n, s = r;
	if (o === "className" && (o = "class"), o === "htmlFor" && (o = "for"), o.startsWith("on") || (typeof s == "function" && (s = s()), s == null || s === !1 && !e(o))) return "";
	if (!c.test(o)) return a && p(t, n, "not a valid HTML attribute name"), "";
	if (o === "class" && (s = h(s)), o === "style" && s && typeof s == "object" && (s = g(s)), s === !0) return ` ${o}`;
	let l = String(s);
	return v(o) && u.test(l.replace(d, "")) ? (a && p(t, n, "unsafe URL scheme"), "") : ` ${o}="${i(l)}"`;
}
function h(e) {
	if (typeof e == "function") return h(e());
	if (Array.isArray(e)) {
		let t = [];
		for (let n of e) {
			if (!n) continue;
			let e = h(n);
			e && t.push(e);
		}
		return t.join(" ");
	}
	return e && typeof e == "object" ? Object.entries(e).filter(([, e]) => !!(typeof e == "function" ? e() : e)).map(([e]) => e).join(" ") : String(e);
}
function g(e) {
	let t = [];
	return _(e, t), t.join(";");
}
function _(e, n) {
	if (Array.isArray(e)) for (let t of e) _(t, n);
	else if (e) {
		if (typeof e == "string") n.length = 0, n.push(e);
		else if (typeof e == "object") for (let [r, i] of Object.entries(e)) {
			let e = typeof i == "function" ? i() : i;
			if (e == null || !l.test(r)) continue;
			let a = String(e).replace(/["<>{};]/g, ""), o = a.replace(d, "");
			/expression\(/i.test(o) || /^\s*javascript:/i.test(o) || n.push(`${t(r)}:${a}`);
		}
	}
}
function v(e) {
	return f.has(e) || /:(href|src|action|formaction|cite|data|poster)$/.test(e);
}
function y(e, t = {}) {
	let n = "", r = t.tag ?? "element";
	for (let i in e) Object.hasOwn(e, i) && (n += m(r, i, e[i], t.dev === !0));
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
	return e == null || e === !0 || e === !1 ? "" : w(e) ? e.value : r(String(e));
}
function w(e) {
	return typeof e == "object" && !!e && Object.hasOwn(e, b) && e[b] === !0 && typeof e.value == "string" && typeof e.toString == "function";
}
function T(e, t) {
	let n = E(typeof e == "string" ? e : e.value);
	if (n === void 0) return;
	let r = D(t), i = RegExp(`\\s${r}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(n);
	return i ? s(i[1] ?? i[2] ?? i[3] ?? "") : RegExp(`\\s${r}(?=\\s|$)`, "i").test(n) ? "" : void 0;
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
	let i = r, a = e.value.slice(r.length), o = {};
	for (let [e, r] of Object.entries(t)) {
		let t = n.merge?.[e];
		if (t !== void 0 && r != null && r !== !1) {
			let n = RegExp(`\\s${D(e)}="([^"]*)"`, "i").exec(i);
			if (n) {
				let a = `${s(n[1] ?? "")}${t}${r === !0 ? "" : String(r)}`;
				i = i.replace(n[0], () => y({ [e]: a }));
				continue;
			}
		}
		o[e] = r;
	}
	return x(`${i}${y(o, n.tag ? { tag: n.tag } : {})}${a}`);
}
//#endregion
export { x as a, y as c, C as i, i as l, S as n, O as o, w as r, m as s, T as t, r as u };
