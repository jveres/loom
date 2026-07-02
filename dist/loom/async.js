import { _ as e, a as t, g as n, h as r, n as i } from "./loom-IKcvaxMB.js";
//#region src/async/index.ts
function a(a, o) {
	let s = r(void 0, o), c = r(!0, o), l = r(void 0, o), u = r(0, o), d = t(() => {
		u();
		let t = !0, n = new AbortController();
		return c(!0), a(e(() => s()), n.signal).then((e) => {
			t && i(() => {
				s(e), l(void 0), c(!1);
			});
		}, (e) => {
			t && i(() => {
				l(e), c(!1);
			});
		}), () => {
			t = !1, n.abort();
		};
	}, o);
	return Object.assign(() => s(), {
		loading: () => c(),
		error: () => l(),
		refresh: () => {
			n(u);
		},
		stop: d
	});
}
//#endregion
export { a as resource };
