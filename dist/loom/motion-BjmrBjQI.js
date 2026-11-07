import { t as e } from "./lifetime-BJiN2AyE.js";
import { n as t } from "./tracking-wsSu4LCy.js";
import { t as n } from "./lifetime-CuwHoBWD.js";
import { t as r } from "./jsx-props-DuIVfWzo.js";
import { D as i, T as a, s as o } from "./loom-Bchrc-TP.js";
import { n as s, r as c, t as l } from "./scroll-extent-D8-ZBWQ9.js";
import { a as u } from "./ownership-base-SRCUIJtL.js";
// src/dom/css-completion.ts
var d = (e, t) => {
	let n = e.split(",");
	return (n[t % n.length] ?? "").trim();
}, f = (e, t) => {
	let n = d(e, t), r = Number.parseFloat(n) || 0;
	return n.endsWith("ms") ? r : r * 1e3;
};
function p(r, i, a, o) {
	let s = n(r, o.signal);
	if (!s.active) return s.stop;
	try {
		let e = r.ownerDocument.defaultView ?? globalThis, n = e.getComputedStyle(r), c = /* @__PURE__ */ new Map(), l = 0;
		if (a === "animation") {
			let e = o.name, t = n.animationName.split(",").map((e) => e.trim());
			for (let r = 0; r < t.length; r++) {
				let i = t[r];
				if (!i || i === "none" || e !== void 0 && e !== i) continue;
				let a = d(n.animationIterationCount, r), o = a === "infinite" ? Infinity : Math.max(0, Number(a || "1")), s = f(n.animationDuration, r), u = o === Infinity ? Infinity : Math.max(0, s * o + f(n.animationDelay, r));
				u !== 0 && (c.set(i, (c.get(i) ?? 0) + 1), l = Math.max(l, u));
			}
		} else {
			let e = o.property, t = n.transitionProperty.split(",").map((e) => e.trim()), r = -1;
			t.forEach((t, n) => {
				(t === e || t === "all") && (r = n);
			}), r >= 0 && (l = Math.max(0, f(n.transitionDuration, r) + f(n.transitionDelay, r))), l > 0 && c.set(e, 1);
		}
		let u = () => {
			s.active && (s.stop(), t(i));
		}, p = (e) => {
			if (!s.active || e.target !== r) return;
			let t = a === "animation" ? e.animationName : e.propertyName, n = c.get(t);
			n !== void 0 && (n > 1 ? c.set(t, n - 1) : c.delete(t), c.size === 0 && u());
		};
		if (r.addEventListener(`${a}end`, p), r.addEventListener(`${a}cancel`, p), s.add(() => {
			r.removeEventListener(`${a}end`, p), r.removeEventListener(`${a}cancel`, p);
		}), c.size === 0) queueMicrotask(u);
		else if (Number.isFinite(l)) {
			let t = e.setTimeout(u, l + 50);
			s.add(() => e.clearTimeout(t));
		}
	} catch (t) {
		e(s, t);
	}
	return s.stop;
}
function m(e, t, n = {}) {
	return p(e, t, "animation", n);
}
function h(e, t, n) {
	return p(e, t, "transition", n);
}
// src/dom/height-fold.ts
function g(e, r = {}) {
	let i = n(e, r.signal), a = e.style.height, o = e.style.getPropertyPriority("height"), s = e.hidden, c, l, u, d = 0, f = (t) => {
		e.style.height = t, c = e.style.height;
	}, p = (t) => {
		e.hidden = t, l = t;
	};
	return i.add(() => {
		d++, u?.(), c !== void 0 && e.style.height === c && e.style.getPropertyPriority("height") === "" && (a ? e.style.setProperty("height", a, o) : e.style.removeProperty("height")), l !== void 0 && e.hidden === l && (e.hidden = s);
	}), {
		stop: i.stop,
		set(n) {
			if (!i.active) return;
			let a = ++d, o = u !== void 0;
			if (u?.(), u = void 0, t(() => r.onStart?.(n)), i.active && d === a) {
				if (n) {
					p(!1);
					let t = o ? e.offsetHeight : 0;
					f("");
					let n = e.offsetHeight;
					f(`${t}px`), e.offsetHeight, f(`${n}px`);
				} else f(`${e.offsetHeight}px`), e.offsetHeight, f("0px");
				u = h(e, () => {
					i.active && d === a && (u = void 0, n ? f("") : p(!0), t(() => r.onSettle?.(n)));
				}, { property: "height" });
			}
		}
	};
}
// src/dom/scroll-fade.ts
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
function S(t, d = {}) {
	let f = n(t, d.signal);
	if (!f.active) return f.stop;
	let p = t.style, m = [
		"maskImage",
		"maskRepeat",
		"maskSize",
		"maskComposite",
		"webkitMaskImage",
		"webkitMaskRepeat",
		"webkitMaskSize",
		"webkitMaskComposite"
	], h = new Map(m.map((e) => [e, {
		value: p[e] ?? "",
		priority: t.style.getPropertyPriority(r(e))
	}])), g = /* @__PURE__ */ new Map(), b = [v, y], S = new Map(b.map((e) => [e, {
		value: t.style.getPropertyValue(e),
		priority: t.style.getPropertyPriority(e)
	}])), C = /* @__PURE__ */ new Map();
	f.add(() => {
		for (let e of m) {
			let n = r(e);
			if (p[e] !== g.get(e) || t.style.getPropertyPriority(n) !== "") continue;
			let i = h.get(e);
			i.priority ? t.style.setProperty(n, i.value, i.priority) : p[e] = i.value;
		}
		for (let e of b) {
			if (t.style.getPropertyValue(e) !== C.get(e) || t.style.getPropertyPriority(e) !== "") continue;
			let n = S.get(e);
			n.value ? t.style.setProperty(e, n.value, n.priority) : t.style.removeProperty(e);
		}
	});
	try {
		let e = d.size ?? 14, n = d.axis === "x", r = n ? "to right" : "to bottom", h = "var(--scroll-fade-inset, 0px)", b = "var(--scroll-fade-inset-end, 0px)", S = `var(${v}, 0px)`, w = `var(${y}, 0px)`, T = d.transition ?? 0, E = Number.isFinite(T) ? Math.max(0, T) : 0, D = t.ownerDocument.defaultView, O = E > 0 && D !== null && typeof t.animate == "function" && x(D), k = O ? c(_, { window: D }) : null, A = k ? o(() => {
			k();
		}, "dom.scrollFade", t) : null;
		A && (u(t, A), f.add(() => a(A)));
		let j = -1, M = -1, N, P;
		f.add(() => N?.cancel()), f.add(() => P?.cancel());
		let F = "var(--scroll-fade-gutter, 0px)", I = `${`linear-gradient(${r}, transparent 0, transparent ${h}, #000 ${h}, transparent calc(${h} + ${S}), transparent calc(100% - ${b} - ${w}), #000 calc(100% - ${b}), transparent calc(100% - ${b}), transparent 100%)`}, linear-gradient(#000, #000)`, L = n ? `100% calc(100% - ${F}), 100% 100%` : `calc(100% - ${F}) 100%, 100% 100%`;
		p.maskImage = I, p.maskRepeat = "no-repeat", p.maskSize = L, p.maskComposite = "exclude", p.webkitMaskImage = I, p.webkitMaskRepeat = "no-repeat", p.webkitMaskSize = L, p.webkitMaskComposite = "xor";
		for (let e of m) g.set(e, p[e] ?? "");
		let R = (e, n, r, i) => {
			let a = `${n}px`;
			if (!O || k?.() || r < 0) {
				i?.cancel(), t.style.setProperty(e, a), C.set(e, t.style.getPropertyValue(e));
				return;
			}
			let o = D.getComputedStyle(t).getPropertyValue(e).trim() || `${r}px`;
			if (i?.cancel(), t.style.setProperty(e, a), C.set(e, t.style.getPropertyValue(e)), o !== a) return t.animate([{ [e]: o }, { [e]: a }], {
				duration: E,
				easing: "ease-out"
			});
		}, z = () => {
			if (!f.active) return;
			let r = l(t, n, 4), i = r.start ? e : 0, a = r.end ? e : 0;
			(i !== j || a !== M) && (i !== j && (N = R(v, i, j, N)), a !== M && (P = R(y, a, M, P)), j = i, M = a);
		};
		return f.add(s(t, z)), i(z), f.stop;
	} catch (t) {
		return e(f, t);
	}
}
export { h as i, g as n, m as r, S as t };
