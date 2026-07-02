import { a as e, g as t, n, v as r } from "./loom-v9Dpu4UJ.js";
//#region src/async/index.ts
function i(i, a) {
	let o = t(void 0, a), s = t(!0, a), c = t(void 0, a), l = t(0, a), u = e(() => {
		l();
		let e = !0;
		return s(!0), i(r(o)).then((t) => {
			e && n(() => {
				o(t), c(void 0), s(!1);
			});
		}, (t) => {
			e && n(() => {
				c(t), s(!1);
			});
		}), () => {
			e = !1;
		};
	}, a);
	return Object.assign(() => o(), {
		loading: () => s(),
		error: () => c(),
		refresh: () => {
			l(r(() => l()) + 1);
		},
		stop: u
	});
}
//#endregion
export { i as resource };
