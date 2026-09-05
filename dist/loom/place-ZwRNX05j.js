//#region src/dom/place.ts
function e(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function t(t, n, r) {
	let i = n.length;
	if (i === 0) return;
	let a, o = !0;
	for (let e of n) if (e.parentNode === t) {
		if (a !== void 0 && a.nextSibling !== e) {
			o = !1;
			break;
		}
		a = e;
	}
	if (o) {
		let a = r;
		for (let r = i - 1; r >= 0; r--) {
			let i = n[r];
			i.parentNode !== t && e(t, i, a), a = i;
		}
		return;
	}
	let s = /* @__PURE__ */ new Map();
	for (let e = 0; e < i; e++) s.set(n[e], e);
	let c = [], l = [], u = !0;
	for (let e = t.firstChild; e !== null; e = e.nextSibling) {
		let t = s.get(e);
		t !== void 0 && (t < (c[c.length - 1] ?? -1) && (u = !1), c.push(t), l.push(e));
	}
	if (u) {
		let a = r;
		for (let r = i - 1; r >= 0; r--) {
			let i = n[r];
			i.parentNode !== t && e(t, i, a), a = i;
		}
		return;
	}
	let d = /* @__PURE__ */ new Set(), f = [], p = [], m = Array(c.length).fill(-1);
	for (let e = 0; e < c.length; e++) {
		let t = c[e], n = 0, r = p.length;
		for (; n < r;) {
			let e = n + r >> 1;
			p[e] < t ? n = e + 1 : r = e;
		}
		n > 0 && (m[e] = f[n - 1]), f[n] = e, p[n] = t;
	}
	for (let e = f.length > 0 ? f[f.length - 1] : -1; e >= 0; e = m[e]) d.add(l[e]);
	let h = r;
	for (let r = i - 1; r >= 0; r--) {
		let i = n[r];
		d.has(i) || e(t, i, h), h = i;
	}
}
function n(t, n) {
	let r = t.parentNode;
	r && (n.parentNode !== r || t.nextSibling !== n) && e(r, n, t.nextSibling);
}
//#endregion
export { t as n, n as t };
