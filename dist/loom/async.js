import { _ as e, n as t, o as n, v as r, y as i } from "./loom-3uFiAQXi.js";
//#region src/async/index.ts
function a(a, o) {
	let s = e(void 0, o), c = e(!0, o), l = e(void 0, o), u = e(0, o), d = n(() => {
		u();
		let e = !0, n = new AbortController();
		return c(!0), a(i(() => s()), n.signal).then((n) => {
			e && t(() => {
				s(n), l(void 0), c(!1);
			});
		}, (n) => {
			e && t(() => {
				l(n), c(!1);
			});
		}), () => {
			e = !1, n.abort();
		};
	}, o);
	return Object.assign(() => s(), {
		loading: () => c(),
		error: () => l(),
		refresh: () => {
			r(u);
		},
		stop: d
	});
}
//#endregion
export { a as resource };
