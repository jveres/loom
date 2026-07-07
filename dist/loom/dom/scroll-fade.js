//#region src/dom/scroll-fade.ts
var e = 4;
function t(t, n = {}) {
	let r = n.size ?? 14, i = n.axis === "x", a = i ? "to right" : "to bottom", o = -1, s = -1, c = () => {
		let n = i ? t.scrollLeft : t.scrollTop, c = i ? t.scrollWidth - t.clientWidth : t.scrollHeight - t.clientHeight, l = n > e ? r : 0, u = c - n > e ? r : 0;
		if (l === o && u === s) return;
		o = l, s = u;
		let d = o === 0 && s === 0 ? "linear-gradient(#000 0 0)" : `linear-gradient(${a}, transparent 0, #000 ${o}px, #000 calc(100% - ${s}px), transparent 100%)`;
		t.style.maskImage = d, t.style.webkitMaskImage = d;
	};
	t.addEventListener("scroll", c, { passive: !0 });
	let l = new ResizeObserver(c);
	l.observe(t);
	for (let e of t.children) l.observe(e);
	let u = new MutationObserver(() => {
		l.disconnect(), l.observe(t);
		for (let e of t.children) l.observe(e);
		c();
	});
	return u.observe(t, { childList: !0 }), c(), () => {
		t.removeEventListener("scroll", c), l.disconnect(), u.disconnect(), t.style.maskImage = "", t.style.webkitMaskImage = "";
	};
}
//#endregion
export { t as scrollFade };
