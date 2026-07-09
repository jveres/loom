import { S as e, b as t, n, s as r, x as i } from "./loom-Doq0e1ZU.js";
//#region src/async/index.ts
function a(a, o) {
	let s = t(void 0, o), c = t(!0, o), l = t(void 0, o), u = t(0, o), d = r(() => {
		u();
		let t = !0, r = new AbortController();
		c(!0);
		let i = e(() => s()), o;
		try {
			o = a(i, r.signal);
		} catch (e) {
			o = Promise.reject(e);
		}
		return o.then((e) => {
			t && n(() => {
				s(e), l(void 0), c(!1);
			});
		}, (e) => {
			t && n(() => {
				l(e), c(!1);
			});
		}), () => {
			t = !1, r.abort();
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
