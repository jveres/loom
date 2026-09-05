import { f as e, s as t, t as n } from "../ownership-base-qruZ0LYF.js";
//#region src/dom/virtual-list.ts
function r(r) {
	let i = r.rowHeight, a = r.overscan ?? 6, o = document.createElement("div");
	o.style.position = "relative";
	let s = document.createElement("div");
	s.style.cssText = "width:1px;pointer-events:none", o.append(s);
	let c = [], l = /* @__PURE__ */ new Map(), u = null, d = 0, f = 0, p = -1, m = -1, h = -1, g = (n = !0) => {
		let s = u;
		if (!s) return;
		let d = s.clientHeight;
		if (d === 0) return;
		let g = s.getBoundingClientRect().top - o.getBoundingClientRect().top, _ = c.length, v = Math.floor(g / i) - a;
		v < 0 && (v = 0);
		let y = Math.ceil((g + d) / i) + a;
		if (y > _ && (y = _), !n && v === p && y === m && f === h) return;
		h = -1;
		let b = /* @__PURE__ */ new Set(), x = [];
		for (let e = v; e < y; e++) {
			let n = c.at(e);
			if (n === void 0) continue;
			let a = r.key(n);
			b.add(a);
			let s = l.get(a);
			if (s !== void 0 && s.revision === f && s.index === e) continue;
			let u = s?.row ?? null, d = r.render(n, u);
			if (d.style.transform = `translateY(${e * i}px)`, s === void 0) o.append(d);
			else if (d !== s.row) {
				s.row.before(d), l.set(a, {
					row: d,
					revision: f,
					index: e
				});
				try {
					t(s.row);
				} catch (e) {
					x.push(e);
				}
				continue;
			}
			l.set(a, {
				row: d,
				revision: f,
				index: e
			});
		}
		for (let [e, n] of l) if (!b.has(e)) {
			l.delete(e);
			try {
				t(n.row);
			} catch (e) {
				x.push(e);
			}
		}
		e(x, "Multiple virtual-list rows failed to dispose."), p = v, m = y, h = f;
	}, _ = () => {
		d ||= requestAnimationFrame(() => {
			d = 0, g(!1);
		});
	}, v = () => {
		if (u) return;
		let e = o.parentElement;
		e && (u = e, e.addEventListener("scroll", _, { passive: !0 }));
	};
	return {
		el: o,
		setItems(e) {
			c = e, f++, s.style.height = `${c.length * i}px`, v(), g();
		},
		refresh() {
			v(), g();
		},
		scrollToEnd() {
			u && (u.scrollTop = u.scrollHeight);
		},
		scrollToIndex(e) {
			u && (u.scrollTop = Math.max(0, e * i - (u.clientHeight - i) / 2), g());
		},
		destroy() {
			d && cancelAnimationFrame(d), u?.removeEventListener("scroll", _), u = null;
			let e = !1, t;
			try {
				n(o);
			} catch (n) {
				e = !0, t = n;
			}
			if (l.clear(), o.replaceChildren(), e) throw t;
		}
	};
}
//#endregion
export { r as virtualList };
