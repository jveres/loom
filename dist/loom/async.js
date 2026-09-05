import { S as e, T as t, c as n, n as r, w as i } from "./loom-Rpf9L-jU.js";
//#region src/async/index.ts
function a(a, o) {
	let s = e(void 0, o), c = e(!0, o), l = e(!1, o), u = e(void 0, o), d = e(0, o), f = n(() => {
		d();
		let e = !0, n = new AbortController();
		c(!0);
		let i = t(() => s()), o;
		try {
			o = a(i, n.signal);
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
			e = !1, n.abort();
		};
	}, o);
	return Object.assign(() => s(), {
		loading: () => c(),
		ready: () => l(),
		error: () => u(),
		refresh: () => {
			i(d);
		},
		stop: f
	});
}
function o(...e) {
	return () => e.some((e) => e.loading());
}
//#endregion
export { o as pending, a as resource };
