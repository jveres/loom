import { a as e, i as t, n, r } from "./tracking-CaYucQ42.js";
//#region src/dom/ownership-base.ts
var i, a, o;
function s(e) {
	i = e;
}
var c = Symbol("loom.registered-stop"), l = Symbol("loom.owned");
function u(t, n, r) {
	let i = [t];
	for (let e = 0; e < i.length; e++) {
		let t = i[e];
		for (let e = t.lastChild; e; e = e.previousSibling) i.push(e);
	}
	let a;
	for (let e = i.length - 1; e >= 0; e--) {
		let t = i[e], o = t[l];
		if (o) {
			if (r && (t[l] = void 0), Array.isArray(o)) {
				for (let e of r ? o : [...o]) if (!p(e) || e.active) try {
					n(e);
				} catch (e) {
					a === void 0 ? a = [e] : a.push(e);
				}
			} else {
				let e = o;
				if (p(e) && !e.active) continue;
				try {
					n(e);
				} catch (e) {
					a === void 0 ? a = [e] : a.push(e);
				}
			}
		}
	}
	e(a, "Multiple Loom DOM disposers failed.");
}
function d(e, t) {
	let n = e, r = n[l];
	r ? Array.isArray(r) ? r.push(t) : n[l] = [r, t] : n[l] = t;
}
function f(e, t) {
	d(e, t);
	let n = a;
	if (n !== void 0) {
		let r = {
			owner: e,
			resource: t,
			index: n.nextIndex++,
			slot: n.entries.length
		};
		n.entries.push(r);
		let a = () => {
			let e = r.slot;
			if (e < 0 || (r.slot = -1, n.stopping)) return;
			let t = n.entries.pop();
			t !== r && (n.entries[e] = t, t.slot = e);
		};
		p(t) ? t.release = a : i?.onStop(t, a);
	}
	let r = o;
	r !== void 0 && r.push({
		owner: e,
		resource: t,
		index: r.length
	});
}
function p(e) {
	return typeof e != "function" && c in e;
}
function m(e, t) {
	let n = e, r = n[l];
	if (!r) return;
	if (!Array.isArray(r)) {
		r === t && (n[l] = void 0);
		return;
	}
	let i = r.indexOf(t);
	if (i < 0) return;
	let a = r.pop();
	i < r.length && (r[i] = a), r.length === 1 ? n[l] = r[0] : r.length === 0 && (n[l] = void 0);
}
function h(e, t) {
	a !== void 0 || o !== void 0 ? C(e, t) : d(e, t);
}
function g(e, t) {
	f(e, t);
}
function _(e, t, n) {
	let r = i, a = e, o = t, s = () => {
		let e = o;
		e !== void 0 && r.stop(e);
	};
	return f(e, t), r.onStop(t, () => {
		n?.removeEventListener("abort", s), a !== void 0 && o !== void 0 && m(a, o), a = void 0, o = void 0;
	}), n?.aborted ? s() : o !== void 0 && n?.addEventListener("abort", s, { once: !0 }), s;
}
function v(e) {
	let t = o, n = t ?? [], r = n.length;
	o = n;
	try {
		return e();
	} catch (e) {
		o = t;
		try {
			S(n.splice(r));
		} catch (t) {
			throw AggregateError([e, t], "Loom DOM construction and cleanup both failed.");
		}
		throw e;
	} finally {
		o = t;
	}
}
function y(t, n = []) {
	for (let e of t) try {
		O(e);
	} catch (e) {
		n.push(e);
	}
	e(n, "Multiple Loom DOM operations failed.");
}
function b(e) {
	if (a !== void 0) throw TypeError("resourceGroup() cannot be nested; use one flat group per replaceable region.");
	if (Object.prototype.toString.call(e) === "[object AsyncFunction]") throw TypeError("resourceGroup() callbacks must be synchronous.");
	let n = {
		entries: [],
		nextIndex: 0,
		stopping: !1
	}, i = () => {
		n.stopping = !0, S(n.entries);
	};
	a = n;
	let o;
	try {
		if (o = e(), t(o)) throw r(o), TypeError("resourceGroup() callbacks must be synchronous.");
	} catch (e) {
		a = void 0;
		try {
			i();
		} catch (t) {
			throw AggregateError([e, t], "Loom resource group creation and cleanup both failed.");
		}
		throw e;
	} finally {
		a = void 0;
	}
	let s = !0;
	return {
		value: o,
		dispose: () => {
			s && (s = !1, i());
		}
	};
}
function x(e, t) {
	if (e.owner === t.owner) return e.index - t.index;
	let n = e.owner.compareDocumentPosition(t.owner);
	return (n & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 ? (n & Node.DOCUMENT_POSITION_CONTAINED_BY) === 0 ? (n & Node.DOCUMENT_POSITION_CONTAINS) === 0 && (n & Node.DOCUMENT_POSITION_FOLLOWING) === 0 ? 1 : -1 : 1 : e.index - t.index;
}
function S(t) {
	let n, r = i, a = [], o = (e) => {
		try {
			if (p(e)) e.dispose();
			else if (r !== void 0) r.stop(e);
			else throw Error("No Loom DOM resource driver is installed.");
		} catch (e) {
			n === void 0 ? n = [e] : n.push(e);
		}
	};
	for (let e of t) {
		let t = e.resource;
		p(t) || r?.requiresOrderedStop(t) === !0 ? a.push(e) : o(t);
	}
	a.sort(x);
	for (let e of a) o(e.resource);
	t.length = 0, e(n, "Multiple Loom DOM resources failed.");
}
function C(e, t) {
	let r = {
		[c]: !0,
		active: !0,
		owner: e,
		stop: t,
		dispose: () => void 0
	};
	return r.dispose = () => {
		if (!r.active) return;
		r.active = !1;
		let e = r.owner, t = r.stop;
		r.owner = void 0, r.stop = void 0;
		let i = r.release;
		r.release = void 0, i?.(), e !== void 0 && m(e, r), t && n(t);
	}, f(e, r), r.dispose;
}
function w(e, t) {
	u(e, (e) => {
		if (!(typeof e == "function" || p(e))) {
			if (i === void 0) throw Error("No Loom DOM resource driver is installed.");
			t(i, e);
		}
	}, !1);
}
function T(e) {
	w(e, (e, t) => e.pause(t));
}
function E(e) {
	w(e, (e, t) => e.resume(t));
}
function D(e) {
	u(e, (e) => {
		if (typeof e == "function") n(e);
		else if (p(e)) e.dispose();
		else if (i !== void 0) i.stop(e);
		else throw Error("No Loom DOM resource driver is installed.");
	}, !0);
}
function O(t) {
	let n;
	try {
		D(t);
	} catch (e) {
		n = [e];
	}
	try {
		t.parentNode?.removeChild(t);
	} catch (e) {
		if (n === void 0) throw e;
		n.push(e);
	}
	e(n, "Loom DOM disposal and removal both failed.");
}
//#endregion
export { g as a, O as c, E as d, v as f, h as i, y as l, s as n, _ as o, C as r, T as s, D as t, b as u };
