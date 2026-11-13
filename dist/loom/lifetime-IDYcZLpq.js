import { a as e, o as t } from "./tracking-HwerCAqq.js";
// src/core/lifetime.ts
function n(e) {
	let n = !e?.aborted, r = [], i = () => {
		if (!n) return;
		n = !1, e?.removeEventListener("abort", i);
		let a;
		for (let e of r.splice(0)) try {
			e();
		} catch (e) {
			a ??= [], a.push(e);
		}
		t(a, "Multiple Loom resource cleanups failed.");
	};
	return n && e?.addEventListener("abort", i, { once: !0 }), {
		get active() {
			return n;
		},
		stop: i,
		add(e) {
			n ? r.push(e) : e();
		}
	};
}
function r(t, n) {
	return e(t.stop, n, "Loom setup and cleanup both failed.");
}
export { n, r as t };
