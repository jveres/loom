import { D as e, E as t, S as n, T as r, v as i } from "./loom-cYHyKCVV.js";
//#region src/settle.ts
var a = (e, t) => e === t;
function o(t, n, o, s) {
	if (!Number.isFinite(o) || o < 0) throw RangeError("settle() delay must be a finite, non-negative number.");
	let c = s?.equals ?? a, l = !0, u, d, f, p = !1, m = !1, h = !1, g, _ = () => {
		g !== void 0 && (clearTimeout(g), g = void 0);
	}, v = () => {
		h || (p = !1, _());
	}, y = () => {
		if (h || m || !p) return;
		_(), p = !1;
		let e = f, t = d;
		d = e, r(() => n(e, t));
	}, b = () => {
		_(), g = setTimeout(() => {
			g = void 0, y();
		}, o);
	}, x = e(() => {
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
	}, C = i({
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
function s(e, t, s) {
	let { equals: c, ...l } = s ?? {}, u = s?.equals ?? a, d = n(r(e), l), f = o(e, (e) => d(e), t, s), p = !1, m = !1, h = i({
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
			let t = r(e);
			u(t, r(() => d())) || d(t);
		},
		stop: () => {
			p = !0, f.stop(), h();
		}
	});
}
function c(e, r, i) {
	let a = n(0, i), s = o(a, () => e(), r, {
		...i?.label ? { label: `${i.label}.settle` } : {},
		...i?.internal ? { internal: !0 } : {}
	});
	return {
		kick: () => t(a, (e) => e + 1),
		cancel: s.cancel,
		flush: s.flush,
		stop: s.stop
	};
}
//#endregion
export { c as quietTask, o as settle, s as settled };
