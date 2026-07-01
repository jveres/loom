//#region src/dom/virtual-list.ts
function e(e) {
	let t = e.rowHeight, n = e.overscan ?? 6, r = document.createElement("div");
	r.style.position = "relative";
	let i = document.createElement("div");
	i.style.cssText = "width:1px;pointer-events:none", r.append(i);
	let a = [], o = /* @__PURE__ */ new Map(), s = null, c = 0, l = () => {
		let i = s;
		if (!i) return;
		let c = i.clientHeight;
		if (c === 0) return;
		let l = i.getBoundingClientRect().top - r.getBoundingClientRect().top, u = a.length, d = Math.floor(l / t) - n;
		d < 0 && (d = 0);
		let f = Math.ceil((l + c) / t) + n;
		f > u && (f = u);
		let p = /* @__PURE__ */ new Set();
		for (let n = d; n < f; n++) {
			let i = a.at(n);
			if (i === void 0) continue;
			let s = e.key(i);
			p.add(s);
			let c = o.get(s) ?? null, l = e.render(i, c);
			l.style.transform = `translateY(${n * t}px)`, c === null ? (r.append(l), o.set(s, l)) : l !== c && (c.replaceWith(l), o.set(s, l));
		}
		for (let [e, t] of o) p.has(e) || (t.remove(), o.delete(e));
	}, u = () => {
		c ||= requestAnimationFrame(() => {
			c = 0, l();
		});
	}, d = () => {
		if (s) return;
		let e = r.parentElement;
		e && (s = e, e.addEventListener("scroll", u, { passive: !0 }));
	};
	return {
		el: r,
		setItems(e) {
			a = e, i.style.height = `${a.length * t}px`, d(), l();
		},
		refresh() {
			d(), l();
		},
		scrollToEnd() {
			s && (s.scrollTop = s.scrollHeight);
		},
		scrollToIndex(e) {
			s && (s.scrollTop = Math.max(0, e * t - (s.clientHeight - t) / 2), l());
		},
		destroy() {
			c && cancelAnimationFrame(c), s?.removeEventListener("scroll", u), s = null, o.clear(), r.replaceChildren();
		}
	};
}
//#endregion
export { e as virtualList };
