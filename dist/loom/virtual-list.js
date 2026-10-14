import { a as e, n as t } from "./tracking-CaYucQ42.js";
import { c as n, r, t as i } from "./ownership-base-1B2CbISn.js";
//#region src/dom/virtual-list.ts
function a(a) {
	let o = a.rowHeight, s = a.overscan ?? 6;
	if (!Number.isFinite(o) || o <= 0 || !Number.isInteger(s) || s < 0) throw RangeError("Virtual row height must be positive and overscan a non-negative integer.");
	let c = a.document ?? document, l = c.createElement("div"), u = c.defaultView ?? globalThis, d = a.signal?.aborted ?? !1;
	l.style.position = "relative";
	let f = c.createElement("div");
	f.style.cssText = "width:1px;pointer-events:none", l.append(f);
	let p = [], m = /* @__PURE__ */ new Map(), h = null, g = 0, _ = 0, v = 0, y = -1, b = -1, x = -1, S = (r = !0) => {
		if (d) return;
		let i = h;
		if (!i) return;
		let c = i.clientHeight;
		if (c === 0) return;
		let u = i.getBoundingClientRect().top - l.getBoundingClientRect().top, f = p.length, g = Math.floor(u / o) - s;
		g < 0 && (g = 0);
		let S = Math.ceil((u + c) / o) + s;
		if (S > f && (S = f), !r && g === y && S === b && _ === x) return;
		x = -1;
		let C = ++v, w = [];
		for (let e = g; e < S; e++) {
			let r = p.at(e);
			if (r === void 0) continue;
			let i = a.key(r), s = m.get(i);
			if (s !== void 0 && (s.pass = C, s.revision === _ && s.index === e)) continue;
			let c = s?.row ?? null, u = t(() => a.render(r, c));
			if (u.style.transform = `translateY(${e * o}px)`, s === void 0) l.append(u), m.set(i, {
				row: u,
				revision: _,
				index: e,
				pass: C
			});
			else {
				let t = s.row;
				if (s.revision = _, s.index = e, u !== t) {
					t.before(u), s.row = u;
					try {
						n(t);
					} catch (e) {
						w.push(e);
					}
				}
			}
		}
		for (let [e, t] of m) if (t.pass !== C) {
			m.delete(e);
			try {
				n(t.row);
			} catch (e) {
				w.push(e);
			}
		}
		e(w, "Multiple virtual-list rows failed to dispose."), y = g, b = S, x = _;
	}, C = () => {
		g || d || (g = u.requestAnimationFrame(() => {
			g = 0, S(!1);
		}));
	}, w = () => {
		if (h || d) return;
		let e = l.parentElement;
		e && (h = e, e.addEventListener("scroll", C, { passive: !0 }));
	}, T = () => {}, E = () => {
		if (!d) {
			d = !0, a.signal?.removeEventListener("abort", E), T(), g && u.cancelAnimationFrame(g), h?.removeEventListener("scroll", C), h = null;
			try {
				i(l);
			} finally {
				m.clear(), l.replaceChildren();
			}
		}
	};
	return d || (T = r(l, E), a.signal?.addEventListener("abort", E, { once: !0 })), {
		el: l,
		setItems(e) {
			d || (p = e, _++, f.style.height = `${p.length * o}px`, w(), S());
		},
		refresh() {
			w(), S();
		},
		scrollToEnd() {
			!d && h && (h.scrollTop = h.scrollHeight, S());
		},
		scrollToIndex(e) {
			!d && h && (h.scrollTop = Math.max(0, e * o - (h.clientHeight - o) / 2), S());
		},
		stop: E
	};
}
//#endregion
export { a as virtualList };
