import { n as e } from "./tracking-CClsWN0I.js";
import { D as t, T as n, l as r, n as i } from "./loom-BsucpYd_.js";
//#region src/async/index.ts
function a(a, o) {
	let s = n(void 0, o), c = n(!0, o), l = n(!1, o), u = n(void 0, o), d = n(0, o), f = r(() => {
		d();
		let t = !0, n = new AbortController();
		c(!0);
		let r = e(() => s()), o;
		try {
			o = a(r, n.signal);
		} catch (e) {
			o = Promise.reject(e);
		}
		return o.then((e) => {
			t && i(() => {
				s(e), u(void 0), c(!1), l(!0);
			});
		}, (e) => {
			t && i(() => {
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
