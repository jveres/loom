import { S as e, T as t, c as n, n as r, w as i } from "./loom-CopJ8Xrb.js";
//#region src/async/index.ts
function a(a, o) {
	let s = e(void 0, o), c = e(!0, o), l = e(void 0, o), u = e(0, o), d = n(() => {
		u();
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
				s(t), l(void 0), c(!1);
			});
		}, (t) => {
			e && r(() => {
				l(t), c(!1);
			});
		}), () => {
			e = !1, n.abort();
		};
	}, o);
	return Object.assign(() => s(), {
		loading: () => c(),
		error: () => l(),
		refresh: () => {
			i(u);
		},
		stop: d
	});
}
//#endregion
export { a as resource };
