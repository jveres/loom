import { D as e, E as t, c as n, n as r, w as i } from "./loom-C8RlpOsd.js";
//#region src/async/index.ts
function a(a, o) {
	let s = i(void 0, o), c = i(!0, o), l = i(!1, o), u = i(void 0, o), d = i(0, o), f = n(() => {
		d();
		let t = !0, n = new AbortController();
		c(!0);
		let i = e(() => s()), o;
		try {
			o = a(i, n.signal);
		} catch (e) {
			o = Promise.reject(e);
		}
		return o.then((e) => {
			t && r(() => {
				s(e), u(void 0), c(!1), l(!0);
			});
		}, (e) => {
			t && r(() => {
				u(e), c(!1);
			});
		}), () => {
			t = !1, n.abort();
		};
	}, o);
	return Object.assign(() => s(), {
		loading: () => c(),
		ready: () => l(),
		error: () => u(),
		refresh: () => {
			t(d);
		},
		stop: f
	});
}
function o(...e) {
	return () => e.some((e) => e.loading());
}
//#endregion
export { o as pending, a as resource };
