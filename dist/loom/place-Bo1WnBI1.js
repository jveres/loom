// src/dom/place.ts
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
		if (s !== void 0 && s.nextSibling === n) s = n;
		else if (n.parentNode !== t) l = !0;
		else {
			if (s !== void 0) {
				c = !1;
				break;
			}
			s = n;
		}
	}
	if (c) {
		l && n(t, i, 0, o - 1, a);
		return;
	}
	let u = 0, d = o - 1, f = a, p = a ? a.previousSibling : t.lastChild, m = p ? t.firstChild : null;
	for (; u <= d && m && p;) if (i[u] === m) u++, m = m === p ? null : m.nextSibling;
	else if (i[d] === p) f = p, d--, p = p === m ? null : p.previousSibling;
	else if (u < d && i[u] === p && i[d] === m && (u + 1 === d || m.nextSibling !== p && i[u + 1].parentNode === t)) {
		if (u + 1 === d) {
			e(t, m, f);
			return;
		}
		let n = m.nextSibling, r = p.previousSibling;
		e(t, p, m), e(t, m, f), f = m, m = n, p = r, u++, d--;
	} else break;
	if (u > d) return;
	let h = d - u + 1, g = /* @__PURE__ */ new Map();
	for (let e = 0; e < h; e++) g.set(i[u + e], e);
	let _ = new Int32Array(h), v = 0, y = !0;
	for (let e = m; e !== null && e !== f; e = e.nextSibling) {
		let t = g.get(e);
		t !== void 0 && (v > 0 && t < _[v - 1] && (y = !1), _[v++] = t);
	}
	(!y || v < h) && n(t, i, u, d, f, y ? void 0 : r(_, v, h));
}
function n(t, n, r, i, a, o) {
	let s = a;
	for (let a = i; a >= r; a--) {
		let i = n[a];
		(o ? o[a - r] === 0 : i.parentNode !== t) && e(t, i, s), s = i;
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
export { t as n, i as t };
