import { S as e, b as t, g as n, w as r } from "./loom-btAeTSbc.js";
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
function o(r, o, s) {
	let { equals: c, ...l } = s ?? {}, u = s?.equals ?? i, d = t(e(r), l), f = a(r, (e) => d(e), o, s), p = !1, m = !1, h = n({
		pause: () => {
			m = !0;
		},
		resume: () => {
			m = !1;
		},
		stop: () => {
			p = !0;
		}
	});
	return Object.assign(() => d(), f, {
		flush: () => {
			if (p || m) return;
			f.flush();
			let t = e(r);
			u(t, e(() => d())) || d(t);
		},
		stop: () => {
			p = !0, f.stop(), h();
		}
	});
}
//#endregion
export { a as settle, o as settled };
