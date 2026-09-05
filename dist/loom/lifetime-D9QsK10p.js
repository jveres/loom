import { t as e } from "./errors-CCHQSfa8.js";
//#region src/core/lifetime.ts
function t(t) {
	let n = !t?.aborted, r = [], i = () => {
		if (!n) return;
		n = !1, t?.removeEventListener("abort", i);
		let a = [];
		for (let e of r.splice(0)) try {
			e();
		} catch (e) {
			a.push(e);
		}
		e(a, "Multiple Loom resource cleanups failed.");
	};
	return n && t?.addEventListener("abort", i, { once: !0 }), {
		get active() {
			return n;
		},
		stop: i,
		add(e) {
			n ? r.push(e) : e();
		}
	};
}
function n(e, t) {
	try {
		e.stop();
	} catch (e) {
		throw AggregateError([t, e], "Loom setup and cleanup both failed.");
	}
	throw t;
}
//#endregion
export { t as n, n as t };
