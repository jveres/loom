import { n as e, t } from "./lifetime-IDYcZLpq.js";
import { n } from "./tracking-HwerCAqq.js";
import { k as r, o as i } from "./loom-C8fvwr1e.js";
// src/schedule.ts
function a(e, t = globalThis) {
	let n = !0, r = () => {
		n && (n = !1, e());
	}, i = t.requestAnimationFrame?.(r);
	return i === void 0 && queueMicrotask(r), () => {
		n = !1, i !== void 0 && t.cancelAnimationFrame?.(i);
	};
}
function o(t, r, i) {
	let a = e(i?.signal), o, s = () => {
		o?.(), o = void 0;
	};
	return a.add(s), {
		request() {
			a.active && !o && (o = r(() => {
				o = void 0, a.active && n(t);
			}));
		},
		cancel: s,
		stop: a.stop
	};
}
function s(e, t) {
	return o(e, (e) => {
		let t = !0;
		return queueMicrotask(() => {
			t && e();
		}), () => {
			t = !1;
		};
	}, t);
}
function c(e, t) {
	return o(e, (e) => a(e, t?.window), t);
}
function l(t, r, i) {
	if (!Number.isInteger(t) || t < 1) throw RangeError("Frame count must be a positive integer.");
	let o = e(i?.signal), s;
	o.add(() => s?.());
	let c = () => {
		o.active && (--t === 0 ? (o.stop(), n(r)) : s = a(c, i?.window));
	};
	return o.active && (s = a(c, i?.window)), o.stop;
}
function u(r, i, a, o) {
	d(o.timeoutMs);
	let s = e(o.signal);
	if (!s.active) return s.stop;
	let c = (e) => {
		s.active && (s.stop(), n(() => a(e)));
	}, l = r, u = l.ownerDocument?.defaultView ?? l.defaultView ?? l.window ?? globalThis;
	try {
		r.addEventListener(i, c, { capture: o.capture ?? !1 }), s.add(() => r.removeEventListener(i, c, o.capture ?? !1));
		let e = u.setTimeout(c, o.timeoutMs);
		s.add(() => u.clearTimeout(e));
	} catch (e) {
		t(s, e);
	}
	return s.stop;
}
function d(e) {
	if (!Number.isFinite(e) || e < 0) throw RangeError("Delay must be finite and non-negative.");
}
function f(a, o, s) {
	d(s.delayMs);
	let c = e(s.signal), l = s.equals ?? ((e, t) => e === t), u = !0, f, p, m, h = !1, g, _ = () => {
		g !== void 0 && clearTimeout(g), g = void 0;
	}, v = () => {
		h = !1, _();
	}, y = () => {
		if (!c.active || !h) return;
		v();
		let e = p;
		p = m, n(() => o(p, e));
	};
	if (c.add(v), c.active) try {
		c.add(i(() => r(() => {
			let e = a();
			return u && (u = !1, f = p = e), e;
		}, (e) => {
			if (!c.active) return;
			let t = l(e, f);
			f = e, t ? h && (m = e) : l(e, p) ? v() : (m = e, h = !0, _(), g = setTimeout(y, s.delayMs));
		})));
	} catch (e) {
		t(c, e);
	}
	return {
		stop: c.stop,
		cancel: v,
		flush: y
	};
}
export { l as afterFrames, u as eventOrTimeout, c as frameCoalescer, s as microtaskCoalescer, f as watchSettled };
