import { D as e, c as t, n, w as r } from "./loom-C8fvwr1e.js";
// src/async/index.ts
function i(i, a) {
	let o = r(void 0, a), s = r(!0, a), c = r(!1, a), l = r(void 0, a), u = r(0, a), d = 0, f = t(() => {
		u();
		let t = !0, r = new AbortController();
		s(!0);
		let a = e(() => o()), d;
		try {
			d = i(a, r.signal);
		} catch (e) {
			d = Promise.reject(e);
		}
		return d.then((e) => {
			t && n(() => {
				o(e), l(void 0), s(!1), c(!0);
			});
		}, (e) => {
			t && n(() => {
				l(e), s(!1);
			});
		}), () => {
			t = !1, r.abort();
		};
	}, a);
	return Object.assign(() => o(), {
		loading: () => s(),
		ready: () => c(),
		error: () => l(),
		refresh: () => {
			d = d + 1 | 0, u(d);
		},
		stop: f
	});
}
function a(...e) {
	return () => e.some((e) => e.loading());
}
export { a as pending, i as resource };
