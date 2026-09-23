import { n as e } from "./tracking-CClsWN0I.js";
import { E as t, c as n } from "./loom-BsucpYd_.js";
import { a as r } from "./ownership-base-BZEik61k.js";
import { t as i } from "./lifetime-KneSZTc9.js";
import { t as a } from "./lifetime-CmayFDbD.js";
import { n as o, r as s, t as c } from "./scroll-extent-C1gAubf3.js";
//#region src/dom/css-completion.ts
var l = (e, t) => {
	let n = e.split(",");
	return (n[t % n.length] ?? "").trim();
}, u = (e, t) => {
	let n = l(e, t), r = Number.parseFloat(n) || 0;
	return n.endsWith("ms") ? r : r * 1e3;
};
function d(t, n, r, o) {
	let s = a(t, o.signal);
	if (!s.active) return s.stop;
	try {
		let i = t.ownerDocument.defaultView ?? globalThis, a = i.getComputedStyle(t), c = /* @__PURE__ */ new Map(), d = 0;
		if (r === "animation") {
			let e = o.name, t = a.animationName.split(",").map((e) => e.trim());
			for (let n = 0; n < t.length; n++) {
				let r = t[n];
				if (!r || r === "none" || e !== void 0 && e !== r) continue;
				let i = l(a.animationIterationCount, n), o = i === "infinite" ? Infinity : Math.max(0, Number(i || "1")), s = u(a.animationDuration, n), f = o === Infinity ? Infinity : Math.max(0, s * o + u(a.animationDelay, n));
				f !== 0 && (c.set(r, (c.get(r) ?? 0) + 1), d = Math.max(d, f));
			}
		} else {
			let e = o.property, t = a.transitionProperty.split(",").map((e) => e.trim()), n = -1;
			t.forEach((t, r) => {
				(t === e || t === "all") && (n = r);
			}), n >= 0 && (d = Math.max(0, u(a.transitionDuration, n) + u(a.transitionDelay, n))), d > 0 && c.set(e, 1);
		}
		let f = () => {
			s.active && (s.stop(), e(n));
		}, p = (e) => {
			if (!s.active || e.target !== t) return;
			let n = r === "animation" ? e.animationName : e.propertyName, i = c.get(n);
			i !== void 0 && (i > 1 ? c.set(n, i - 1) : c.delete(n), c.size === 0 && f());
		};
		if (t.addEventListener(`${r}end`, p), t.addEventListener(`${r}cancel`, p), s.add(() => {
			t.removeEventListener(`${r}end`, p), t.removeEventListener(`${r}cancel`, p);
		}), c.size === 0) queueMicrotask(f);
		else if (Number.isFinite(d)) {
			let e = i.setTimeout(f, d + 50);
			s.add(() => i.clearTimeout(e));
		}
	} catch (e) {
		i(s, e);
	}
	return s.stop;
}
function f(e, t, n = {}) {
	return d(e, t, "animation", n);
}
function p(e, t, n) {
	return d(e, t, "transition", n);
}
//#endregion
//#region src/dom/height-fold.ts
function m(t, n = {}) {
	let r = a(t, n.signal), i = t.style.height, o = t.style.getPropertyPriority("height"), s = t.hidden, c, l, u, d = 0, f = (e) => {
		t.style.height = e, c = t.style.height;
	}, m = (e) => {
		t.hidden = e, l = e;
	};
	return r.add(() => {
		d++, u?.(), c !== void 0 && t.style.height === c && t.style.getPropertyPriority("height") === "" && (i ? t.style.setProperty("height", i, o) : t.style.removeProperty("height")), l !== void 0 && t.hidden === l && (t.hidden = s);
	}), {
		stop: r.stop,
		set(i) {
			if (!r.active) return;
			let a = ++d, o = u !== void 0;
			if (u?.(), u = void 0, e(() => n.onStart?.(i)), !(!r.active || d !== a)) {
				if (i) {
					m(!1);
					let e = o ? t.offsetHeight : 0;
					f("");
					let n = t.offsetHeight;
					f(`${e}px`), t.offsetHeight, f(`${n}px`);
				} else f(`${t.offsetHeight}px`), t.offsetHeight, f("0px");
				u = p(t, () => {
					!r.active || d !== a || (u = void 0, i ? f("") : m(!0), e(() => n.onSettle?.(i)));
				}, { property: "height" });
			}
		}
	};
}
//#endregion
//#region src/dom/scroll-fade.ts
var h = "(prefers-reduced-motion: reduce)", g = "--loom-scroll-fade-start", _ = "--loom-scroll-fade-end", v = /* @__PURE__ */ new WeakSet();
function y(e) {
	let t = e.CSS;
	if (!t || typeof t.registerProperty != "function") return !1;
	if (v.has(t)) return !0;
	for (let e of [g, _]) try {
		t.registerProperty({
			name: e,
			syntax: "<length>",
			inherits: !1,
			initialValue: "0px"
		});
	} catch {}
	return v.add(t), !0;
}
function b(l, u = {}) {
	let d = a(l, u.signal);
	if (!d.active) return d.stop;
	let f = l.style, p = [
		"maskImage",
		"maskRepeat",
		"maskSize",
		"maskComposite",
		"webkitMaskImage",
		"webkitMaskRepeat",
		"webkitMaskSize",
		"webkitMaskComposite"
	], m = (e) => `${e.startsWith("webkit") ? "-" : ""}${e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)}`, v = new Map(p.map((e) => [e, {
		value: f[e] ?? "",
		priority: l.style.getPropertyPriority(m(e))
	}])), b = /* @__PURE__ */ new Map(), x = [g, _], S = new Map(x.map((e) => [e, {
		value: l.style.getPropertyValue(e),
		priority: l.style.getPropertyPriority(e)
	}])), C = /* @__PURE__ */ new Map();
	d.add(() => {
		for (let e of p) {
			if (f[e] !== b.get(e) || l.style.getPropertyPriority(m(e)) !== "") continue;
			let t = v.get(e);
			t && (t.priority ? l.style.setProperty(m(e), t.value, t.priority) : f[e] = t.value);
		}
		for (let e of x) {
			if (l.style.getPropertyValue(e) !== C.get(e) || l.style.getPropertyPriority(e) !== "") continue;
			let t = S.get(e);
			t && (t.value ? l.style.setProperty(e, t.value, t.priority) : l.style.removeProperty(e));
		}
	});
	try {
		let i = u.size ?? 14, a = u.axis === "x", m = a ? "to right" : "to bottom", v = "var(--scroll-fade-inset, 0px)", x = "var(--scroll-fade-inset-end, 0px)", S = `var(${g}, 0px)`, w = `var(${_}, 0px)`, T = u.transition ?? 0, E = Number.isFinite(T) ? Math.max(0, T) : 0, D = l.ownerDocument.defaultView, O = E > 0 && D !== null && typeof l.animate == "function" && y(D), k = O ? s(h, { window: D ?? globalThis }) : null, A = k ? n(() => {
			k();
		}, "dom.scrollFade", l) : null;
		A && (r(l, A), d.add(() => t(A)));
		let j = -1, M = -1, N, P;
		d.add(() => N?.cancel()), d.add(() => P?.cancel());
		let F = "var(--scroll-fade-gutter, 0px)", I = `${`linear-gradient(${m}, transparent 0, transparent ${v}, #000 ${v}, transparent calc(${v} + ${S}), transparent calc(100% - ${x} - ${w}), #000 calc(100% - ${x}), transparent calc(100% - ${x}), transparent 100%)`}, linear-gradient(#000, #000)`, L = a ? `100% calc(100% - ${F}), 100% 100%` : `calc(100% - ${F}) 100%, 100% 100%`;
		f.maskImage = I, f.maskRepeat = "no-repeat", f.maskSize = L, f.maskComposite = "exclude", f.webkitMaskImage = I, f.webkitMaskRepeat = "no-repeat", f.webkitMaskSize = L, f.webkitMaskComposite = "xor";
		for (let e of p) b.set(e, f[e] ?? "");
		let R = (e, t, n, r) => {
			let i = `${t}px`;
			if (!O || k?.() || D === null || n < 0) {
				r?.cancel(), l.style.setProperty(e, i), C.set(e, l.style.getPropertyValue(e));
				return;
			}
			let a = D.getComputedStyle(l).getPropertyValue(e).trim() || `${n}px`;
			if (r?.cancel(), l.style.setProperty(e, i), C.set(e, l.style.getPropertyValue(e)), a !== i) return l.animate([{ [e]: a }, { [e]: i }], {
				duration: E,
				easing: "ease-out"
			});
		}, z = () => {
			if (!d.active) return;
			let e = c(l, a, 4), t = e.start ? i : 0, n = e.end ? i : 0;
			(t !== j || n !== M) && (t !== j && (N = R(g, t, j, N)), n !== M && (P = R(_, n, M, P)), j = t, M = n);
		};
		return d.add(o(l, z)), e(z), d.stop;
	} catch (e) {
		return i(d, e);
	}
}
//#endregion
export { p as i, m as n, f as r, b as t };
