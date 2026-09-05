import { n as e } from "./tracking-DRP3LNHN.js";
import { t } from "./errors-CCHQSfa8.js";
import { c as n, r, t as i } from "./ownership-base-hl0GKMLF.js";
//#region src/dom/virtual-list.ts
function a(a) {
	let o = a.rowHeight, s = a.overscan ?? 6;
	if (!Number.isFinite(o) || o <= 0 || !Number.isInteger(s) || s < 0) throw RangeError("Virtual row height must be positive and overscan a non-negative integer.");
	let c = a.document ?? document, l = c.createElement("div"), u = c.defaultView ?? globalThis, d = a.signal?.aborted ?? !1;
	l.style.position = "relative";
	let f = c.createElement("div");
	f.style.cssText = "width:1px;pointer-events:none", l.append(f);
	let p = [], m = /* @__PURE__ */ new Map(), h = null, g = 0, _ = 0, v = -1, y = -1, b = -1, x = (r = !0) => {
		if (d) return;
		let i = h;
		if (!i) return;
		let c = i.clientHeight;
		if (c === 0) return;
		let u = i.getBoundingClientRect().top - l.getBoundingClientRect().top, f = p.length, g = Math.floor(u / o) - s;
		g < 0 && (g = 0);
		let x = Math.ceil((u + c) / o) + s;
		if (x > f && (x = f), !r && g === v && x === y && _ === b) return;
		b = -1;
		let S = /* @__PURE__ */ new Set(), C = [];
		for (let t = g; t < x; t++) {
			let r = p.at(t);
			if (r === void 0) continue;
			let i = a.key(r);
			S.add(i);
			let s = m.get(i);
			if (s !== void 0 && s.revision === _ && s.index === t) continue;
			let c = s?.row ?? null, u = e(() => a.render(r, c));
			if (u.style.transform = `translateY(${t * o}px)`, s === void 0) l.append(u);
			else if (u !== s.row) {
				s.row.before(u), m.set(i, {
					row: u,
					revision: _,
					index: t
				});
				try {
					n(s.row);
				} catch (e) {
					C.push(e);
				}
				continue;
			}
			m.set(i, {
				row: u,
				revision: _,
				index: t
			});
		}
		for (let [e, t] of m) if (!S.has(e)) {
			m.delete(e);
			try {
				n(t.row);
			} catch (e) {
				C.push(e);
			}
		}
		t(C, "Multiple virtual-list rows failed to dispose."), v = g, y = x, b = _;
	}, S = () => {
		g || d || (g = u.requestAnimationFrame(() => {
			g = 0, x(!1);
		}));
	}, C = () => {
		if (h || d) return;
		let e = l.parentElement;
		e && (h = e, e.addEventListener("scroll", S, { passive: !0 }));
	}, w = () => {}, T = () => {
		if (d) return;
		d = !0, a.signal?.removeEventListener("abort", T), w(), g && u.cancelAnimationFrame(g), h?.removeEventListener("scroll", S), h = null;
		let e = !1, t;
		try {
			i(l);
		} catch (n) {
			e = !0, t = n;
		}
		if (m.clear(), l.replaceChildren(), e) throw t;
	};
	return d || (w = r(l, T), a.signal?.addEventListener("abort", T, { once: !0 })), {
		el: l,
		setItems(e) {
			d || (p = e, _++, f.style.height = `${p.length * o}px`, C(), x());
		},
		refresh() {
			C(), x();
		},
		scrollToEnd() {
			!d && h && (h.scrollTop = h.scrollHeight);
		},
		scrollToIndex(e) {
			d || !h || (h.scrollTop = Math.max(0, e * o - (h.clientHeight - o) / 2), x());
		},
		stop: T
	};
}
//#endregion
export { a as virtualList };
