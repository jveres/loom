import { S as e, b as t, g as n, w as r } from "./loom-Doq0e1ZU.js";
//#region src/settle.ts
var i = (e, t) => e === t;
function a(t, a, o, s) {
	if (!Number.isFinite(o) || o < 0) throw RangeError("settle() delay must be a finite, non-negative number.");
	let c = s?.equals ?? i, l = !0, u, d, f, p = !1, m = !1, h = !1, g, _ = () => {
		g !== void 0 && (clearTimeout(g), g = void 0);
	}, v = () => {
		h || (p = !1, _());
	}, y = () => {
		if (h || m || !p) return;
		_(), p = !1;
		let t = f, n = d;
		d = t, e(() => a(t, n));
	}, b = () => {
		_(), g = setTimeout(() => {
			g = void 0, y();
		}, o);
	}, x = r(() => {
		let e = t();
		return l && (l = !1, u = e, d = e), e;
	}, (e) => {
		let t = c(e, u);
		if (u = e, t) {
			p && (f = e);
			return;
		}
		if (c(e, d)) {
			v();
			return;
		}
		f = e, p = !0, m || b();
	}, s), S = () => {
		h || (h = !0, p = !1, _(), x());
	}, C = n({
		pause: () => {
			m = !0, _();
		},
		resume: () => {
			m = !1, p && b();
		},
		stop: S
	});
	return {
		stop: () => {
			h || (S(), C());
		},
		cancel: v,
		flush: y
	};
}
function o(n, r, i) {
	let { equals: o, ...s } = i ?? {}, c = t(e(n), s), l = a(n, (e) => c(e), r, i);
	return Object.assign(() => c(), l, { flush: () => {
		l.flush(), c(e(n));
	} });
}
//#endregion
export { a as settle, o as settled };
