//#region src/dom/ownership-base.ts
var e = Symbol("loom.owned");
function t(t, n, r) {
	let i = [t];
	for (let e = 0; e < i.length; e++) {
		let t = i[e];
		for (let e = t.lastChild; e; e = e.previousSibling) i.push(e);
	}
	let a;
	for (let t = i.length - 1; t >= 0; t--) {
		let o = i[t], s = o[e];
		if (s) if (r && (o[e] = void 0), Array.isArray(s)) {
			for (let e of s) if (!(typeof e != "function" && !e.active)) try {
				n(e);
			} catch (e) {
				a === void 0 ? a = [e] : a.push(e);
			}
		} else {
			let e = s;
			if (typeof e != "function" && !e.active) continue;
			try {
				n(e);
			} catch (e) {
				a === void 0 ? a = [e] : a.push(e);
			}
		}
	}
	if (a?.length === 1) throw a[0];
	if (a && a.length > 1) throw AggregateError(a, "Multiple Loom DOM disposers failed.");
}
function n(t, n) {
	let r = t, i = r[e];
	i ? Array.isArray(i) ? i.push(n) : r[e] = [i, n] : r[e] = n;
}
function r(t, n) {
	let r = t, i = r[e];
	if (!i) return;
	if (!Array.isArray(i)) {
		i === n && (r[e] = void 0);
		return;
	}
	let a = i.indexOf(n);
	if (a < 0) return;
	let o = i.pop();
	a < i.length && (i[a] = o), i.length === 1 ? r[e] = i[0] : i.length === 0 && (r[e] = void 0);
}
function i(t, n) {
	let r = t, i = r[e];
	i ? Array.isArray(i) ? i.push(n) : r[e] = [i, n] : r[e] = n;
}
function a(e, t) {
	let i = {
		active: !0,
		owner: e,
		stop: t,
		dispose: () => void 0
	};
	return i.dispose = () => {
		if (!i.active) return;
		i.active = !1;
		let e = i.owner, t = i.stop;
		i.owner = void 0, i.stop = void 0, e !== void 0 && r(e, i), t?.();
	}, n(e, i), i.dispose;
}
function o(e, n) {
	t(e, (e) => {
		let t = typeof e == "function" ? e : e.stop;
		t !== void 0 && n(t);
	}, !1);
}
function s(e) {
	t(e, (e) => {
		typeof e == "function" ? e() : e.dispose();
	}, !0);
}
function c(e) {
	let t = !1, n;
	try {
		s(e);
	} catch (e) {
		t = !0, n = e;
	}
	let r = !1, i;
	try {
		e.parentNode?.removeChild(e);
	} catch (e) {
		r = !0, i = e;
	}
	if (t && r) throw AggregateError([n, i], "Loom DOM disposal and removal both failed.");
	if (t) throw n;
	if (r) throw i;
}
//#endregion
export { c as a, i, o as n, a as r, s as t };
