import { s as e, t } from "../ownership-base-Ch2ZRyJM.js";
//#region src/dom/virtual-list.ts
function n(n) {
	let r = n.rowHeight, i = n.overscan ?? 6, a = document.createElement("div");
	a.style.position = "relative";
	let o = document.createElement("div");
	o.style.cssText = "width:1px;pointer-events:none", a.append(o);
	let s = [], c = /* @__PURE__ */ new Map(), l = null, u = 0, d = 0, f = -1, p = -1, m = -1, h = (e) => {
		if (e.length === 1) throw e[0];
		if (e.length > 1) throw AggregateError(e, "Multiple virtual-list rows failed to dispose.");
	}, g = (t = !0) => {
		let o = l;
		if (!o) return;
		let u = o.clientHeight;
		if (u === 0) return;
		let g = o.getBoundingClientRect().top - a.getBoundingClientRect().top, _ = s.length, v = Math.floor(g / r) - i;
		v < 0 && (v = 0);
		let y = Math.ceil((g + u) / r) + i;
		if (y > _ && (y = _), !t && v === f && y === p && d === m) return;
		m = -1;
		let b = /* @__PURE__ */ new Set(), x = [];
		for (let t = v; t < y; t++) {
			let i = s.at(t);
			if (i === void 0) continue;
			let o = n.key(i);
			b.add(o);
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
					x.push(e);
				}
				continue;
			}
			c.set(o, {
				row: f,
				revision: d,
				index: t
			});
		}
		for (let [t, n] of c) if (!b.has(t)) {
			c.delete(t);
			try {
				e(n.row);
			} catch (e) {
				x.push(e);
			}
		}
		h(x), f = v, p = y, m = d;
	}, _ = () => {
		u ||= requestAnimationFrame(() => {
			u = 0, g(!1);
		});
	}, v = () => {
		if (l) return;
		let e = a.parentElement;
		e && (l = e, e.addEventListener("scroll", _, { passive: !0 }));
	};
	return {
		el: a,
		setItems(e) {
			s = e, d++, o.style.height = `${s.length * r}px`, v(), g();
		},
		refresh() {
			v(), g();
		},
		scrollToEnd() {
			l && (l.scrollTop = l.scrollHeight);
		},
		scrollToIndex(e) {
			l && (l.scrollTop = Math.max(0, e * r - (l.clientHeight - r) / 2), g());
		},
		destroy() {
			u && cancelAnimationFrame(u), l?.removeEventListener("scroll", _), l = null;
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
