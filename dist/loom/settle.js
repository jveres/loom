import { D as e, k as t, w as n, y as r } from "./loom-C8RlpOsd.js";
//#region src/settle.ts
var i = (e, t) => e === t;
function a(n, a, o, s) {
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
	}, x = t(() => {
		let e = n();
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
	}, C = r({
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
function o(t, o, s) {
	let { equals: c, ...l } = s ?? {}, u = s?.equals ?? i, d = n(e(t), l), f = a(t, (e) => d(e), o, s), p = !1, m = !1, h = r({
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
			let n = e(t);
			u(n, e(() => d())) || d(n);
		},
		stop: () => {
			p = !0, f.stop(), h();
		}
	});
}
var s = (e) => {
	if (!Number.isFinite(e) || e < 0) throw RangeError("quiet delay must be a finite, non-negative number.");
};
function c(t, n, i) {
	s(n);
	let a = n, o = !1, c = !1, l = !1, u, d = () => {
		u !== void 0 && (clearTimeout(u), u = void 0);
	}, f = () => {
		l || c || !o || (d(), o = !1, e(t));
	}, p = () => {
		d(), u = setTimeout(() => {
			u = void 0, f();
		}, a);
	}, m = () => {
		l || (o = !1, d());
	}, h = (e) => {
		e !== void 0 && s(e), !l && (e !== void 0 && (a = e), o = !0, c || p());
	}, g = () => {
		l = !0, o = !1, d();
	}, _ = r({
		pause: () => {
			c = !0, d();
		},
		resume: () => {
			c = !1, o && p();
		},
		stop: g
	});
	return {
		kick: h,
		cancel: m,
		flush: f,
		stop: () => {
			l || (g(), _());
		}
	};
}
function l(e) {
	s(e);
	let t = -Infinity, n = "";
	return {
		touch(e = "") {
			n = e, t = performance.now();
		},
		open(r = "") {
			return r === n && performance.now() - t < e;
		},
		close() {
			t = -Infinity;
		}
	};
}
//#endregion
export { c as quietTask, l as quietWindow, a as settle, o as settled };
