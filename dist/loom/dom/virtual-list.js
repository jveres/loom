import { a as e, t } from "../ownership-base-DfUs28hK.js";
//#region src/dom/virtual-list.ts
function n(n) {
	let r = n.rowHeight, i = n.overscan ?? 6, a = document.createElement("div");
	a.style.position = "relative";
	let o = document.createElement("div");
	o.style.cssText = "width:1px;pointer-events:none", a.append(o);
	let s = [], c = /* @__PURE__ */ new Map(), l = null, u = 0, d = 0, f = (e) => {
		if (e.length === 1) throw e[0];
		if (e.length > 1) throw AggregateError(e, "Multiple virtual-list rows failed to dispose.");
	}, p = () => {
		let t = l;
		if (!t) return;
		let o = t.clientHeight;
		if (o === 0) return;
		let u = t.getBoundingClientRect().top - a.getBoundingClientRect().top, p = s.length, m = Math.floor(u / r) - i;
		m < 0 && (m = 0);
		let h = Math.ceil((u + o) / r) + i;
		h > p && (h = p);
		let g = /* @__PURE__ */ new Set(), _ = [];
		for (let t = m; t < h; t++) {
			let i = s.at(t);
			if (i === void 0) continue;
			let o = n.key(i);
			g.add(o);
			let l = c.get(o);
			if (l !== void 0 && l.revision === d && l.index === t) continue;
			let u = l?.row ?? null, f = n.render(i, u);
			if (f.style.transform = `translateY(${t * r}px)`, l === void 0) a.append(f);
			else if (f !== l.row) {
				l.row.before(f), c.set(o, {
					row: f,
					revision: d,
					index: t
				});
				try {
					e(l.row);
				} catch (e) {
					_.push(e);
				}
				continue;
			}
			c.set(o, {
				row: f,
				revision: d,
				index: t
			});
		}
		for (let [t, n] of c) if (!g.has(t)) {
			c.delete(t);
			try {
				e(n.row);
			} catch (e) {
				_.push(e);
			}
		}
		f(_);
	}, m = () => {
		u ||= requestAnimationFrame(() => {
			u = 0, p();
		});
	}, h = () => {
		if (l) return;
		let e = a.parentElement;
		e && (l = e, e.addEventListener("scroll", m, { passive: !0 }));
	};
	return {
		el: a,
		setItems(e) {
			s = e, d++, o.style.height = `${s.length * r}px`, h(), p();
		},
		refresh() {
			h(), p();
		},
		scrollToEnd() {
			l && (l.scrollTop = l.scrollHeight);
		},
		scrollToIndex(e) {
			l && (l.scrollTop = Math.max(0, e * r - (l.clientHeight - r) / 2), p());
		},
		destroy() {
			u && cancelAnimationFrame(u), l?.removeEventListener("scroll", m), l = null;
			let e = !1, n;
			try {
				t(a);
			} catch (t) {
				e = !0, n = t;
			}
			if (c.clear(), a.replaceChildren(), e) throw n;
		}
	};
}
//#endregion
export { n as virtualList };
