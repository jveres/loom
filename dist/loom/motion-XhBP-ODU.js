import { E as e, c as t } from "./loom-B6598vHo.js";
import { n } from "./tracking-DRP3LNHN.js";
import { a as r } from "./ownership-base-hl0GKMLF.js";
import { t as i } from "./lifetime-D9QsK10p.js";
import { t as a } from "./lifetime-Bc5XQUWH.js";
import { t as o } from "./media-read-CrqVRflM.js";
//#region src/dom/css-completion.ts
var s = (e, t) => {
	let n = e.split(",");
	return (n[t % n.length] ?? "").trim();
}, c = (e, t) => {
	let n = s(e, t), r = Number.parseFloat(n) || 0;
	return n.endsWith("ms") ? r : r * 1e3;
};
function l(e, t, r, o) {
	let l = a(e, o.signal);
	if (!l.active) return l.stop;
	try {
		let i = e.ownerDocument.defaultView ?? globalThis, a = i.getComputedStyle(e), u = /* @__PURE__ */ new Map(), d = 0;
		if (r === "animation") {
			let e = o.name, t = a.animationName.split(",").map((e) => e.trim());
			for (let n = 0; n < t.length; n++) {
				let r = t[n];
				if (!r || r === "none" || e !== void 0 && e !== r) continue;
				let i = s(a.animationIterationCount, n), o = i === "infinite" ? Infinity : Math.max(0, Number(i || "1")), l = c(a.animationDuration, n), f = o === Infinity ? Infinity : Math.max(0, l * o + c(a.animationDelay, n));
				f !== 0 && (u.set(r, (u.get(r) ?? 0) + 1), d = Math.max(d, f));
			}
		} else {
			let e = o.property, t = a.transitionProperty.split(",").map((e) => e.trim()), n = -1;
			t.forEach((t, r) => {
				(t === e || t === "all") && (n = r);
			}), n >= 0 && (d = Math.max(0, c(a.transitionDuration, n) + c(a.transitionDelay, n))), d > 0 && u.set(e, 1);
		}
		let f = () => {
			l.active && (l.stop(), n(t));
		}, p = (t) => {
			if (!l.active || t.target !== e) return;
			let n = r === "animation" ? t.animationName : t.propertyName, i = u.get(n);
			i !== void 0 && (i > 1 ? u.set(n, i - 1) : u.delete(n), u.size === 0 && f());
		};
		if (e.addEventListener(`${r}end`, p), e.addEventListener(`${r}cancel`, p), l.add(() => {
			e.removeEventListener(`${r}end`, p), e.removeEventListener(`${r}cancel`, p);
		}), u.size === 0) queueMicrotask(f);
		else if (Number.isFinite(d)) {
			let e = i.setTimeout(f, d + 50);
			l.add(() => i.clearTimeout(e));
		}
	} catch (e) {
		i(l, e);
	}
	return l.stop;
}
function u(e, t, n = {}) {
	return l(e, t, "animation", n);
}
function d(e, t, n) {
	return l(e, t, "transition", n);
}
//#endregion
//#region src/dom/height-fold.ts
function f(e, t = {}) {
	let r = a(e, t.signal), i = e.style.height, o = e.style.getPropertyPriority("height"), s = e.hidden, c, l, u, f = 0, p = (t) => {
		e.style.height = t, c = e.style.height;
	}, m = (t) => {
		e.hidden = t, l = t;
	};
	return r.add(() => {
		f++, u?.(), c !== void 0 && e.style.height === c && e.style.getPropertyPriority("height") === "" && (i ? e.style.setProperty("height", i, o) : e.style.removeProperty("height")), l !== void 0 && e.hidden === l && (e.hidden = s);
	}), {
		stop: r.stop,
		set(i) {
			if (!r.active) return;
			let a = ++f, o = u !== void 0;
			if (u?.(), u = void 0, n(() => t.onStart?.(i)), !(!r.active || f !== a)) {
				if (i) {
					m(!1);
					let t = o ? e.offsetHeight : 0;
					p("");
					let n = e.offsetHeight;
					p(`${t}px`), e.offsetHeight, p(`${n}px`);
				} else p(`${e.offsetHeight}px`), e.offsetHeight, p("0px");
				u = d(e, () => {
					!r.active || f !== a || (u = void 0, i ? p("") : m(!0), n(() => t.onSettle?.(i)));
				}, { property: "height" });
			}
		}
	};
}
//#endregion
//#region src/dom/scroll-fade.ts
var p = 4, m = "(prefers-reduced-motion: reduce)", h = "--loom-scroll-fade-start", g = "--loom-scroll-fade-end", _ = /* @__PURE__ */ new WeakSet();
function v(e) {
	let t = e.CSS;
	if (!t || typeof t.registerProperty != "function") return !1;
	if (_.has(t)) return !0;
	for (let e of [h, g]) try {
		t.registerProperty({
			name: e,
			syntax: "<length>",
			inherits: !1,
			initialValue: "0px"
		});
	} catch {}
	return _.add(t), !0;
}
function y(s, c = {}) {
	let l = a(s, c.signal);
	if (!l.active) return l.stop;
	let u = s.style, d = [
		"maskImage",
		"maskRepeat",
		"maskSize",
		"maskComposite",
		"webkitMaskImage",
		"webkitMaskRepeat",
		"webkitMaskSize",
		"webkitMaskComposite"
	], f = (e) => `${e.startsWith("webkit") ? "-" : ""}${e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)}`, _ = new Map(d.map((e) => [e, {
		value: u[e] ?? "",
		priority: s.style.getPropertyPriority(f(e))
	}])), y = /* @__PURE__ */ new Map(), b = [h, g], x = new Map(b.map((e) => [e, {
		value: s.style.getPropertyValue(e),
		priority: s.style.getPropertyPriority(e)
	}])), S = /* @__PURE__ */ new Map();
	l.add(() => {
		for (let e of d) {
			if (u[e] !== y.get(e) || s.style.getPropertyPriority(f(e)) !== "") continue;
			let t = _.get(e);
			t && (t.priority ? s.style.setProperty(f(e), t.value, t.priority) : u[e] = t.value);
		}
		for (let e of b) {
			if (s.style.getPropertyValue(e) !== S.get(e) || s.style.getPropertyPriority(e) !== "") continue;
			let t = x.get(e);
			t && (t.value ? s.style.setProperty(e, t.value, t.priority) : s.style.removeProperty(e));
		}
	});
	try {
		let i = c.size ?? 14, a = c.axis === "x", f = a ? "to right" : "to bottom", _ = "var(--scroll-fade-inset, 0px)", b = "var(--scroll-fade-inset-end, 0px)", x = `var(${h}, 0px)`, C = `var(${g}, 0px)`, w = c.transition ?? 0, T = Number.isFinite(w) ? Math.max(0, w) : 0, E = s.ownerDocument.defaultView, D = T > 0 && E !== null && typeof s.animate == "function" && v(E), O = D ? o(m, { window: E ?? globalThis }) : null, k = O ? t(() => {
			O();
		}, "dom.scrollFade", s) : null;
		k && (r(s, k), l.add(() => e(k)));
		let A = -1, j = -1, M, N;
		l.add(() => M?.cancel()), l.add(() => N?.cancel());
		let P = "var(--scroll-fade-gutter, 0px)", F = `${`linear-gradient(${f}, transparent 0, transparent ${_}, #000 ${_}, transparent calc(${_} + ${x}), transparent calc(100% - ${b} - ${C}), #000 calc(100% - ${b}), transparent calc(100% - ${b}), transparent 100%)`}, linear-gradient(#000, #000)`, I = a ? `100% calc(100% - ${P}), 100% 100%` : `calc(100% - ${P}) 100%, 100% 100%`;
		u.maskImage = F, u.maskRepeat = "no-repeat", u.maskSize = I, u.maskComposite = "exclude", u.webkitMaskImage = F, u.webkitMaskRepeat = "no-repeat", u.webkitMaskSize = I, u.webkitMaskComposite = "xor";
		for (let e of d) y.set(e, u[e] ?? "");
		let L = (e, t, n, r) => {
			let i = `${t}px`;
			if (!D || O?.() || E === null || n < 0) {
				r?.cancel(), s.style.setProperty(e, i), S.set(e, s.style.getPropertyValue(e));
				return;
			}
			let a = E.getComputedStyle(s).getPropertyValue(e).trim() || `${n}px`;
			if (r?.cancel(), s.style.setProperty(e, i), S.set(e, s.style.getPropertyValue(e)), a !== i) return s.animate([{ [e]: a }, { [e]: i }], {
				duration: T,
				easing: "ease-out"
			});
		}, R = () => {
			if (!l.active) return;
			let e = a ? s.scrollLeft : s.scrollTop, t = a ? s.scrollWidth - s.clientWidth : s.scrollHeight - s.clientHeight, n = e > p ? i : 0, r = t - e > p ? i : 0;
			(n !== A || r !== j) && (n !== A && (M = L(h, n, A, M)), r !== j && (N = L(g, r, j, N)), A = n, j = r);
		};
		s.addEventListener("scroll", R, { passive: !0 }), l.add(() => s.removeEventListener("scroll", R));
		let z = E ?? globalThis, B = new z.ResizeObserver(() => n(R));
		l.add(() => B.disconnect()), B.observe(s);
		for (let e of s.children) B.observe(e);
		let V = new z.MutationObserver((e) => {
			for (let t of e) {
				for (let e of t.removedNodes) e.nodeType === 1 && B.unobserve(e);
				for (let e of t.addedNodes) e.nodeType === 1 && B.observe(e);
			}
			n(R);
		});
		return l.add(() => V.disconnect()), V.observe(s, { childList: !0 }), n(R), l.stop;
	} catch (e) {
		return i(l, e);
	}
}
//#endregion
export { d as i, f as n, u as r, y as t };
