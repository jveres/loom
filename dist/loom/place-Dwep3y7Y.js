//#region src/dom/place.ts
function e(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function t(t, i, a) {
	let o = i.length;
	if (o === 0) return;
	let s, c = !0, l = !1;
	for (let e = 0; e < o; e++) {
		let n = i[e];
		if (n.parentNode !== t) l = !0;
		else {
			if (s !== void 0 && s.nextSibling !== n) {
				c = !1;
				break;
			}
			s = n;
		}
	}
	if (c) {
		l && n(t, i, a);
		return;
	}
	let u = /* @__PURE__ */ new Map();
	for (let e = 0; e < o; e++) u.set(i[e], e);
	let d = new Int32Array(o), f = 0, p = !0;
	for (let e = t.firstChild; e !== null; e = e.nextSibling) {
		let t = u.get(e);
		t !== void 0 && (f > 0 && t < d[f - 1] && (p = !1), d[f++] = t);
	}
	if (p) {
		f < o && n(t, i, a);
		return;
	}
	let m = r(d, f, o), h = a;
	for (let n = o - 1; n >= 0; n--) {
		let r = i[n];
		m[n] === 0 && e(t, r, h), h = r;
	}
}
function n(t, n, r) {
	let i = r;
	for (let r = n.length - 1; r >= 0; r--) {
		let a = n[r];
		a.parentNode !== t && e(t, a, i), i = a;
	}
}
function r(e, t, n) {
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
function i(t, n) {
	let r = t.parentNode;
	r && (n.parentNode !== r || t.nextSibling !== n) && e(r, n, t.nextSibling);
}
//#endregion
export { t as n, i as t };
