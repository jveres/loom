//#region src/html/index.ts
var e = Symbol.for("loom.html");
function t(t) {
	return {
		[e]: !0,
		value: t,
		toString: () => t
	};
}
function n(e, ...n) {
	let i = e[0] ?? "";
	for (let t = 0; t < n.length; t++) i += r(n[t]), i += e[t + 1] ?? "";
	return t(i);
}
function r(e) {
	if (Array.isArray(e)) {
		let t = "";
		for (let n of e) t += r(n);
		return t;
	}
	return e == null || e === !0 || e === !1 ? "" : i(e) ? e.value : o(String(e));
}
function i(t) {
	return typeof t == "object" && !!t && e in t && typeof t.value == "string";
}
var a = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
};
function o(e) {
	return e.replace(/[&<>"']/g, (e) => a[e]);
}
function s(e) {
	return o(e);
}
//#endregion
export { s as escapeAttribute, o as escapeText, n as html, i as isHtml, r as renderToString, t as unsafeHtml };
