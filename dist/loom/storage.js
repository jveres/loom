import { n as e } from "./tracking-CClsWN0I.js";
import { A as t, o as n } from "./loom-BsucpYd_.js";
import { n as r, t as i } from "./lifetime-KneSZTc9.js";
//#region src/storage.ts
function a(e, t) {
	let n = t.storage ?? c(), r = t.serialize ?? JSON.stringify, i = t.parse;
	return {
		load() {
			if (n) try {
				let r = n.getItem(e);
				if (r === null) return;
				let a = i(r);
				return t.validate?.(a) === !1 ? void 0 : a;
			} catch {
				return;
			}
		},
		store(t) {
			if (!n) return !1;
			try {
				let i = r(t);
				return typeof i == "string" && (n.setItem(e, i), !0);
			} catch {
				return !1;
			}
		},
		clear() {
			try {
				n?.removeItem(e);
			} catch {}
		}
	};
}
function o(e) {
	return {
		serialize: (e) => e,
		parse: (e) => e,
		validate: (t) => e === void 0 || e.includes(t)
	};
}
var s = {
	json: (e) => ({
		serialize: JSON.stringify,
		parse(t) {
			let n = JSON.parse(t);
			if (!e(n)) throw TypeError("Invalid stored JSON value.");
			return n;
		}
	}),
	boolean: {
		serialize: (e) => e ? "1" : "0",
		parse: (e) => {
			if (e !== "0" && e !== "1") throw TypeError("Invalid stored boolean.");
			return e === "1";
		},
		validate: (e) => typeof e == "boolean"
	},
	number: (e = {}) => ({
		serialize: String,
		parse: (e) => {
			if (e.trim() === "") throw TypeError("Invalid stored number.");
			return Number(e);
		},
		validate: (t) => Number.isFinite(t) && (e.min === void 0 || t >= e.min) && (e.max === void 0 || t <= e.max)
	}),
	string: o
};
function c() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function l(a, o, s = {}) {
	let c = s.delayMs ?? 0;
	if (!Number.isFinite(c) || c < 0) throw RangeError("Storage delay must be finite and non-negative.");
	let l = r(s.signal), u = !1, d, f, p = () => {
		f !== void 0 && clearTimeout(f), f = void 0;
	}, m = () => !l.active || !u || (p(), u = !1, e(() => o.store(d)));
	if (l.add(() => {
		u = !1, p();
	}), l.active) try {
		n(() => {
			let e = o.load();
			e !== void 0 && l.active && a(e), l.active && l.add(t(() => a(), (e) => {
				l.active && (d = e, u = !0, p(), c === 0 ? m() : f = setTimeout(m, c));
			}));
		});
	} catch (e) {
		i(l, e);
	}
	return {
		flush: m,
		stop: l.stop
	};
}
//#endregion
export { l as bindStorage, s as codecs, a as storageSlot };
