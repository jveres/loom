import { b as e, n as t, o as n, x as r, y as i } from "./loom-9N47RZAW.js";
//#region src/async/index.ts
function a(a, o) {
	let s = i(void 0, o), c = i(!0, o), l = i(void 0, o), u = i(0, o), d = n(() => {
		u();
		let e = !0, n = new AbortController();
		return c(!0), a(r(() => s()), n.signal).then((n) => {
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
			e(u);
		},
		stop: d
	});
}
//#endregion
export { a as resource };
