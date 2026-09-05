import { A as e, o as t } from "./loom-B6598vHo.js";
import { n } from "./tracking-DRP3LNHN.js";
import { n as r, t as i } from "./lifetime-D9QsK10p.js";
//#region src/schedule.ts
function a(e, t = globalThis) {
	let n = !0, r = () => {
		n && (n = !1, e());
	}, i = t.requestAnimationFrame?.(r);
	return i === void 0 && queueMicrotask(r), () => {
		n = !1, i !== void 0 && t.cancelAnimationFrame?.(i);
	};
}
function o(e, t, i) {
	let a = r(i?.signal), o, s = () => {
		o?.(), o = void 0;
	};
	return a.add(s), {
		request() {
			!a.active || o || (o = t(() => {
				o = void 0, a.active && n(e);
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
function l(e, t, i) {
	if (!Number.isInteger(e) || e < 1) throw RangeError("Frame count must be a positive integer.");
	let o = r(i?.signal), s;
	o.add(() => s?.());
	let c = () => {
		o.active && (--e === 0 ? (o.stop(), n(t)) : s = a(c, i?.window));
	};
	return o.active && (s = a(c, i?.window)), o.stop;
}
function u(e, t, a, o) {
	d(o.timeoutMs);
	let s = r(o.signal);
	if (!s.active) return s.stop;
	let c = (e) => {
		s.active && (s.stop(), n(() => a(e)));
	}, l = e, u = l.ownerDocument?.defaultView ?? l.defaultView ?? l.window ?? globalThis;
	try {
		e.addEventListener(t, c, { capture: o.capture ?? !1 }), s.add(() => e.removeEventListener(t, c, o.capture ?? !1));
		let n = u.setTimeout(c, o.timeoutMs);
		s.add(() => u.clearTimeout(n));
	} catch (e) {
		i(s, e);
	}
	return s.stop;
}
function d(e) {
	if (!Number.isFinite(e) || e < 0) throw RangeError("Delay must be finite and non-negative.");
}
function f(a, o, s) {
	d(s.delayMs);
	let c = r(s.signal), l = s.equals ?? ((e, t) => e === t), u = !0, f, p, m, h = !1, g, _ = () => {
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
		c.add(t(() => e(() => {
			let e = a();
			return u && (u = !1, f = p = e), e;
		}, (e) => {
			if (!c.active) return;
			let t = l(e, f);
			if (f = e, t) {
				h && (m = e);
				return;
			}
			if (l(e, p)) {
				v();
				return;
			}
			m = e, h = !0, _(), g = setTimeout(y, s.delayMs);
		})));
	} catch (e) {
		i(c, e);
	}
	return {
		stop: c.stop,
		cancel: v,
		flush: y
	};
}
//#endregion
export { l as afterFrames, u as eventOrTimeout, c as frameCoalescer, s as microtaskCoalescer, f as watchSettled };
