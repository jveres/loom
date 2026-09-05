import { n as e } from "./tracking-DRP3LNHN.js";
import { t } from "./errors-CCHQSfa8.js";
//#region src/dom/ownership-base.ts
var n, r, i;
function a(e) {
	n = e;
}
var o = Symbol("loom.registered-stop"), s = Symbol("loom.owned");
function c(e, n, r) {
	let i = [e];
	for (let e = 0; e < i.length; e++) {
		let t = i[e];
		for (let e = t.lastChild; e; e = e.previousSibling) i.push(e);
	}
	let a;
	for (let e = i.length - 1; e >= 0; e--) {
		let t = i[e], o = t[s];
		if (o) {
			if (r && (t[s] = void 0), Array.isArray(o)) {
				for (let e of r ? o : [...o]) if (!(u(e) && !e.active)) try {
					n(e);
				} catch (e) {
					a === void 0 ? a = [e] : a.push(e);
				}
			} else {
				let e = o;
				if (u(e) && !e.active) continue;
				try {
					n(e);
				} catch (e) {
					a === void 0 ? a = [e] : a.push(e);
				}
			}
		}
	}
	t(a, "Multiple Loom DOM disposers failed.");
}
function l(e, t) {
	let a = e, o = a[s];
	o ? Array.isArray(o) ? o.push(t) : a[s] = [o, t] : a[s] = t;
	let c = r;
	if (c !== void 0) {
		let r = {
			owner: e,
			resource: t,
			index: c.nextIndex++,
			slot: c.entries.length
		};
		c.entries.push(r);
		let i = () => {
			let e = r.slot;
			if (e < 0 || (r.slot = -1, c.stopping)) return;
			let t = c.entries.pop();
			t !== r && (c.entries[e] = t, t.slot = e);
		};
		u(t) ? t.release = i : typeof t != "function" && n?.onStop(t, i);
	}
	let l = i;
	l !== void 0 && l.push({
		owner: e,
		resource: t,
		index: l.length
	});
}
function u(e) {
	return typeof e != "function" && o in e;
}
function d(e, t) {
	let n = e, r = n[s];
	if (!r) return;
	if (!Array.isArray(r)) {
		r === t && (n[s] = void 0);
		return;
	}
	let i = r.indexOf(t);
	if (i < 0) return;
	let a = r.pop();
	i < r.length && (r[i] = a), r.length === 1 ? n[s] = r[0] : r.length === 0 && (n[s] = void 0);
}
function f(e, t) {
	if (r !== void 0 || i !== void 0) {
		x(e, t);
		return;
	}
	let n = e, a = n[s];
	a ? Array.isArray(a) ? a.push(t) : n[s] = [a, t] : n[s] = t;
}
function p(e, t) {
	l(e, t);
}
function m(e, t, r) {
	let i = n, a = e, o = t, s = () => {
		let e = o;
		e !== void 0 && i.stop(e);
	};
	return l(e, t), i.onStop(t, () => {
		r?.removeEventListener("abort", s), a !== void 0 && o !== void 0 && d(a, o), a = void 0, o = void 0;
	}), r?.aborted ? s() : o !== void 0 && r?.addEventListener("abort", s, { once: !0 }), s;
}
function h(e) {
	let t = i, n = t ?? [], r = n.length;
	i = n;
	try {
		return e();
	} catch (e) {
		i = t;
		try {
			b(n.splice(r));
		} catch (t) {
			throw AggregateError([e, t], "Loom DOM construction and cleanup both failed.");
		}
		throw e;
	} finally {
		i = t;
	}
}
function g(e, n = []) {
	for (let t of e) try {
		E(t);
	} catch (e) {
		n.push(e);
	}
	t(n, "Multiple Loom DOM operations failed.");
}
function _(e) {
	if (r !== void 0) throw TypeError("resourceGroup() cannot be nested; use one flat group per replaceable region.");
	if (Object.prototype.toString.call(e) === "[object AsyncFunction]") throw TypeError("resourceGroup() callbacks must be synchronous.");
	let t = {
		entries: [],
		nextIndex: 0,
		stopping: !1
	}, n = () => {
		t.stopping = !0, b(t.entries);
	};
	r = t;
	let i;
	try {
		if (i = e(), v(i)) throw Promise.resolve(i).catch(() => void 0), TypeError("resourceGroup() callbacks must be synchronous.");
	} catch (e) {
		r = void 0;
		try {
			n();
		} catch (t) {
			throw AggregateError([e, t], "Loom resource group creation and cleanup both failed.");
		}
		throw e;
	} finally {
		r = void 0;
	}
	let a = !0;
	return {
		value: i,
		dispose: () => {
			a && (a = !1, n());
		}
	};
}
function v(e) {
	return (typeof e == "object" || typeof e == "function") && e !== null && "then" in e && typeof e.then == "function";
}
function y(e, t) {
	if (e.owner === t.owner) return e.index - t.index;
	if (e.owner.contains(t.owner)) return 1;
	if (t.owner.contains(e.owner)) return -1;
	let n = e.owner.compareDocumentPosition(t.owner);
	return (n & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 ? (n & Node.DOCUMENT_POSITION_FOLLOWING) === 0 ? 1 : -1 : e.index - t.index;
}
function b(e) {
	let r, i = n, a = [], o = (e) => {
		try {
			if (typeof e == "function") e();
			else if (u(e)) e.dispose();
			else if (i !== void 0) i.stop(e);
			else throw Error("No Loom DOM resource driver is installed.");
		} catch (e) {
			r === void 0 ? r = [e] : r.push(e);
		}
	};
	for (let t of e) {
		let e = t.resource;
		u(e) || typeof e != "function" && i?.requiresOrderedStop(e) === !0 ? a.push(t) : o(e);
	}
	a.sort(y);
	for (let e of a) o(e.resource);
	e.length = 0, t(r, "Multiple Loom DOM resources failed.");
}
function x(t, n) {
	let r = {
		[o]: !0,
		active: !0,
		owner: t,
		stop: n,
		dispose: () => void 0
	};
	return r.dispose = () => {
		if (!r.active) return;
		r.active = !1;
		let t = r.owner, n = r.stop;
		r.owner = void 0, r.stop = void 0;
		let i = r.release;
		r.release = void 0, i?.(), t !== void 0 && d(t, r), n && e(n);
	}, l(t, r), r.dispose;
}
function S(e, t) {
	c(e, (e) => {
		if (!(typeof e == "function" || u(e))) {
			if (n === void 0) throw Error("No Loom DOM resource driver is installed.");
			t(n, e);
		}
	}, !1);
}
function C(e) {
	S(e, (e, t) => e.pause(t));
}
function w(e) {
	S(e, (e, t) => e.resume(t));
}
function T(t) {
	c(t, (t) => {
		if (typeof t == "function") e(t);
		else if (u(t)) t.dispose();
		else if (n !== void 0) n.stop(t);
		else throw Error("No Loom DOM resource driver is installed.");
	}, !0);
}
function E(e) {
	let t = !1, n;
	try {
		T(e);
	} catch (e) {
		t = !0, n = e;
	}
	let r = !1, i;
	try {
		e.parentNode?.removeChild(e);
	} catch (e) {
		r = !0, i = e;
	}
	if (t && r) throw AggregateError([n, i], "Loom DOM disposal and removal both failed.");
	if (t) throw n;
	if (r) throw i;
}
//#endregion
export { p as a, E as c, w as d, h as f, f as i, g as l, a as n, m as o, x as r, C as s, T as t, _ as u };
