import { E as e, O as t, S as n, T as r, n as i } from "./loom-Rpf9L-jU.js";
//#region src/keyed-states.ts
function a(e = {}) {
	let t = /* @__PURE__ */ new Map();
	return {
		cell(r, i) {
			let a = t.get(r);
			return a || (a = typeof i == "function" ? i() : n(i, {
				...e.label ? { label: `${e.label}.${r}` } : {},
				...e.internal ? { internal: !0 } : {}
			}), t.set(r, a)), a;
		},
		prune(e) {
			let n = typeof e == "string" ? (t) => t.includes(e) : e, r = 0;
			for (let e of t.keys()) n(e) && (t.delete(e), r += 1);
			return r;
		},
		has: (e) => t.has(e)
	};
}
//#endregion
//#region src/lens.ts
function o(e, n) {
	return t(() => e()[n], (t) => {
		let i = r(() => e());
		if (Object.is(i[n], t)) return;
		let a = Array.isArray(i) ? i.slice() : { ...i };
		a[n] = t, e(a);
	});
}
//#endregion
//#region src/revisions.ts
function s(t = {}) {
	let r = t.separator ?? ".", a = /* @__PURE__ */ new Map(), o = (e) => {
		let r = a.get(e);
		return r || (r = n(0, {
			...t.label ? { label: `${t.label}.${e || "root"}` } : {},
			...t.internal ? { internal: !0 } : {}
		}), a.set(e, r)), r;
	}, s = (e, t) => {
		let n = e;
		for (;;) {
			if (t.add(n), n === "") return;
			let e = n.lastIndexOf(r);
			n = e === -1 ? "" : n.slice(0, e);
		}
	};
	return {
		read: (e) => o(e)(),
		invalidate(...t) {
			let n = /* @__PURE__ */ new Set();
			for (let e of t) s(e, n);
			i(() => {
				for (let t of n) {
					let n = a.get(t);
					n && e(n, (e) => e + 1);
				}
			});
		}
	};
}
//#endregion
//#region src/runtime-slot.ts
function c(e, t) {
	let n = Symbol.for(`loom.runtimeSlot:${e}`), r = globalThis, i = r[n];
	if (i !== void 0) return i;
	let a = t();
	return r[n] = a, a;
}
//#endregion
//#region src/weak-memo.ts
function l(e, t) {
	let n = /* @__PURE__ */ new WeakMap(), i, a = !1;
	return (o) => {
		if (t) {
			let e = r(t);
			(!a || e !== i) && (a = !0, i = e, n = /* @__PURE__ */ new WeakMap());
		}
		if (n.has(o)) return n.get(o);
		let s = e(o);
		return n.set(o, s), s;
	};
}
//#endregion
export { a, o as i, c as n, s as r, l as t };
