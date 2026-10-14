import { n as e } from "./tracking-CaYucQ42.js";
import { D as t, T as n, s as r } from "./loom-WRYGQLBj.js";
import { t as i } from "./jsx-props-CBvsxEaL.js";
import { a } from "./ownership-base-1B2CbISn.js";
import { t as o } from "./lifetime-CYx3KLZ0.js";
import { t as s } from "./lifetime-D_7_tsmv.js";
import { n as c, r as l, t as u } from "./scroll-extent-C66uLz7p.js";
//#region src/dom/css-completion.ts
var d = (e, t) => {
	let n = e.split(",");
	return (n[t % n.length] ?? "").trim();
}, f = (e, t) => {
	let n = d(e, t), r = Number.parseFloat(n) || 0;
	return n.endsWith("ms") ? r : r * 1e3;
};
function p(t, n, r, i) {
	let a = s(t, i.signal);
	if (!a.active) return a.stop;
	try {
		let o = t.ownerDocument.defaultView ?? globalThis, s = o.getComputedStyle(t), c = /* @__PURE__ */ new Map(), l = 0;
		if (r === "animation") {
			let e = i.name, t = s.animationName.split(",").map((e) => e.trim());
			for (let n = 0; n < t.length; n++) {
				let r = t[n];
				if (!r || r === "none" || e !== void 0 && e !== r) continue;
				let i = d(s.animationIterationCount, n), a = i === "infinite" ? Infinity : Math.max(0, Number(i || "1")), o = f(s.animationDuration, n), u = a === Infinity ? Infinity : Math.max(0, o * a + f(s.animationDelay, n));
				u !== 0 && (c.set(r, (c.get(r) ?? 0) + 1), l = Math.max(l, u));
			}
		} else {
			let e = i.property, t = s.transitionProperty.split(",").map((e) => e.trim()), n = -1;
			t.forEach((t, r) => {
				(t === e || t === "all") && (n = r);
			}), n >= 0 && (l = Math.max(0, f(s.transitionDuration, n) + f(s.transitionDelay, n))), l > 0 && c.set(e, 1);
		}
		let u = () => {
			a.active && (a.stop(), e(n));
		}, p = (e) => {
			if (!a.active || e.target !== t) return;
			let n = r === "animation" ? e.animationName : e.propertyName, i = c.get(n);
			i !== void 0 && (i > 1 ? c.set(n, i - 1) : c.delete(n), c.size === 0 && u());
		};
		if (t.addEventListener(`${r}end`, p), t.addEventListener(`${r}cancel`, p), a.add(() => {
			t.removeEventListener(`${r}end`, p), t.removeEventListener(`${r}cancel`, p);
		}), c.size === 0) queueMicrotask(u);
		else if (Number.isFinite(l)) {
			let e = o.setTimeout(u, l + 50);
			a.add(() => o.clearTimeout(e));
		}
	} catch (e) {
		o(a, e);
	}
	return a.stop;
}
function m(e, t, n = {}) {
	return p(e, t, "animation", n);
}
function h(e, t, n) {
	return p(e, t, "transition", n);
}
//#endregion
//#region src/dom/height-fold.ts
function g(t, n = {}) {
	let r = s(t, n.signal), i = t.style.height, a = t.style.getPropertyPriority("height"), o = t.hidden, c, l, u, d = 0, f = (e) => {
		t.style.height = e, c = t.style.height;
	}, p = (e) => {
		t.hidden = e, l = e;
	};
	return r.add(() => {
		d++, u?.(), c !== void 0 && t.style.height === c && t.style.getPropertyPriority("height") === "" && (i ? t.style.setProperty("height", i, a) : t.style.removeProperty("height")), l !== void 0 && t.hidden === l && (t.hidden = o);
	}), {
		stop: r.stop,
		set(i) {
			if (!r.active) return;
			let a = ++d, o = u !== void 0;
			if (u?.(), u = void 0, e(() => n.onStart?.(i)), r.active && d === a) {
				if (i) {
					p(!1);
					let e = o ? t.offsetHeight : 0;
					f("");
					let n = t.offsetHeight;
					f(`${e}px`), t.offsetHeight, f(`${n}px`);
				} else f(`${t.offsetHeight}px`), t.offsetHeight, f("0px");
				u = h(t, () => {
					r.active && d === a && (u = void 0, i ? f("") : p(!0), e(() => n.onSettle?.(i)));
				}, { property: "height" });
			}
		}
	};
}
//#endregion
//#region src/dom/scroll-fade.ts
var _ = "(prefers-reduced-motion: reduce)", v = "--loom-scroll-fade-start", y = "--loom-scroll-fade-end", b = /* @__PURE__ */ new WeakSet();
function x(e) {
	let t = e.CSS;
	if (!t || typeof t.registerProperty != "function") return !1;
	if (b.has(t)) return !0;
	for (let e of [v, y]) try {
		t.registerProperty({
			name: e,
			syntax: "<length>",
			inherits: !1,
			initialValue: "0px"
		});
	} catch {}
	return b.add(t), !0;
}
function S(e, d = {}) {
	let f = s(e, d.signal);
	if (!f.active) return f.stop;
	let p = e.style, m = [
		"maskImage",
		"maskRepeat",
		"maskSize",
		"maskComposite",
		"webkitMaskImage",
		"webkitMaskRepeat",
		"webkitMaskSize",
		"webkitMaskComposite"
	], h = new Map(m.map((t) => [t, {
		value: p[t] ?? "",
		priority: e.style.getPropertyPriority(i(t))
	}])), g = /* @__PURE__ */ new Map(), b = [v, y], S = new Map(b.map((t) => [t, {
		value: e.style.getPropertyValue(t),
		priority: e.style.getPropertyPriority(t)
	}])), C = /* @__PURE__ */ new Map();
	f.add(() => {
		for (let t of m) {
			let n = i(t);
			if (p[t] !== g.get(t) || e.style.getPropertyPriority(n) !== "") continue;
			let r = h.get(t);
			r.priority ? e.style.setProperty(n, r.value, r.priority) : p[t] = r.value;
		}
		for (let t of b) {
			if (e.style.getPropertyValue(t) !== C.get(t) || e.style.getPropertyPriority(t) !== "") continue;
			let n = S.get(t);
			n.value ? e.style.setProperty(t, n.value, n.priority) : e.style.removeProperty(t);
		}
	});
	try {
		let i = d.size ?? 14, o = d.axis === "x", s = o ? "to right" : "to bottom", h = "var(--scroll-fade-inset, 0px)", b = "var(--scroll-fade-inset-end, 0px)", S = `var(${v}, 0px)`, w = `var(${y}, 0px)`, T = d.transition ?? 0, E = Number.isFinite(T) ? Math.max(0, T) : 0, D = e.ownerDocument.defaultView, O = E > 0 && D !== null && typeof e.animate == "function" && x(D), k = O ? l(_, { window: D }) : null, A = k ? r(() => {
			k();
		}, "dom.scrollFade", e) : null;
		A && (a(e, A), f.add(() => n(A)));
		let j = -1, M = -1, N, P;
		f.add(() => N?.cancel()), f.add(() => P?.cancel());
		let F = "var(--scroll-fade-gutter, 0px)", I = `${`linear-gradient(${s}, transparent 0, transparent ${h}, #000 ${h}, transparent calc(${h} + ${S}), transparent calc(100% - ${b} - ${w}), #000 calc(100% - ${b}), transparent calc(100% - ${b}), transparent 100%)`}, linear-gradient(#000, #000)`, L = o ? `100% calc(100% - ${F}), 100% 100%` : `calc(100% - ${F}) 100%, 100% 100%`;
		p.maskImage = I, p.maskRepeat = "no-repeat", p.maskSize = L, p.maskComposite = "exclude", p.webkitMaskImage = I, p.webkitMaskRepeat = "no-repeat", p.webkitMaskSize = L, p.webkitMaskComposite = "xor";
		for (let e of m) g.set(e, p[e] ?? "");
		let R = (t, n, r, i) => {
			let a = `${n}px`;
			if (!O || k?.() || r < 0) {
				i?.cancel(), e.style.setProperty(t, a), C.set(t, e.style.getPropertyValue(t));
				return;
			}
			let o = D.getComputedStyle(e).getPropertyValue(t).trim() || `${r}px`;
			if (i?.cancel(), e.style.setProperty(t, a), C.set(t, e.style.getPropertyValue(t)), o !== a) return e.animate([{ [t]: o }, { [t]: a }], {
				duration: E,
				easing: "ease-out"
			});
		}, z = () => {
			if (!f.active) return;
			let t = u(e, o, 4), n = t.start ? i : 0, r = t.end ? i : 0;
			(n !== j || r !== M) && (n !== j && (N = R(v, n, j, N)), r !== M && (P = R(y, r, M, P)), j = n, M = r);
		};
		return f.add(c(e, z)), t(z), f.stop;
	} catch (e) {
		return o(f, e);
	}
}
//#endregion
export { h as i, g as n, m as r, S as t };
