import { D as e, T as t, l as n, n as r } from "./loom-B6598vHo.js";
import { n as i } from "./tracking-DRP3LNHN.js";
//#region src/async/index.ts
function a(a, o) {
	let s = t(void 0, o), c = t(!0, o), l = t(!1, o), u = t(void 0, o), d = t(0, o), f = n(() => {
		d();
		let e = !0, t = new AbortController();
		c(!0);
		let n = i(() => s()), o;
		try {
			o = a(n, t.signal);
		} catch (e) {
			o = Promise.reject(e);
		}
		return o.then((t) => {
			e && r(() => {
				s(t), u(void 0), c(!1), l(!0);
			});
		}, (t) => {
			e && r(() => {
				u(t), c(!1);
			});
		}), () => {
			e = !1, t.abort();
		};
	}, o);
	return Object.assign(() => s(), {
		loading: () => c(),
		ready: () => l(),
		error: () => u(),
		refresh: () => {
			e(d);
		},
		stop: f
	});
}
function o(...e) {
	return () => e.some((e) => e.loading());
}
//#endregion
export { o as pending, a as resource };
