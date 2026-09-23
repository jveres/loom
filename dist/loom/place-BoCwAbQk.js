//#region src/dom/place.ts
function e(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function t(t, r, i) {
	let a = r.length;
	if (a === 0) return;
	let o, s = !0;
	for (let e of r) if (e.parentNode === t) {
		if (o !== void 0 && o.nextSibling !== e) {
			s = !1;
			break;
		}
		o = e;
	}
	if (s) {
		let n = i;
		for (let i = a - 1; i >= 0; i--) {
			let a = r[i];
			a.parentNode !== t && e(t, a, n), n = a;
		}
		return;
	}
	let c = /* @__PURE__ */ new Map();
	for (let e = 0; e < a; e++) c.set(r[e], e);
	let l = new Int32Array(a), u = 0, d = !0;
	for (let e = t.firstChild; e !== null; e = e.nextSibling) {
		let t = c.get(e);
		t !== void 0 && (u > 0 && t < l[u - 1] && (d = !1), l[u++] = t);
	}
	if (d) {
		let n = i;
		for (let i = a - 1; i >= 0; i--) {
			let a = r[i];
			a.parentNode !== t && e(t, a, n), n = a;
		}
		return;
	}
	let f = n(l, u, a), p = i;
	for (let n = a - 1; n >= 0; n--) {
		let i = r[n];
		f[n] === 0 && e(t, i, p), p = i;
	}
}
function n(e, t, n) {
	let r = new Int32Array(t), i = new Int32Array(t), a = 0;
	for (let n = 0; n < t; n++) {
		let t = e[n], o = 0, s = a;
		for (; o < s;) {
			let n = o + s >> 1;
			e[r[n]] < t ? o = n + 1 : s = n;
		}
		i[n] = o > 0 ? r[o - 1] : -1, r[o] = n, o === a && a++;
	}
	let o = new Uint8Array(n);
	for (let t = a > 0 ? r[a - 1] : -1; t >= 0; t = i[t]) o[e[t]] = 1;
	return o;
}
function r(t, n) {
	let r = t.parentNode;
	r && (n.parentNode !== r || t.nextSibling !== n) && e(r, n, t.nextSibling);
}
//#endregion
export { t as n, r as t };
