//#region src/core/errors.ts
function e(e, t) {
	if (e?.length === 1) throw e[0];
	if (e && e.length > 1) throw AggregateError(e, t);
}
//#endregion
//#region src/dom/ownership-base.ts
var t, n, r;
function i(e) {
	t = e;
}
var a = Symbol("loom.registered-stop"), o = Symbol("loom.owned");
function s(t, n, r) {
	let i = [t];
	for (let e = 0; e < i.length; e++) {
		let t = i[e];
		for (let e = t.lastChild; e; e = e.previousSibling) i.push(e);
	}
	let a;
	for (let e = i.length - 1; e >= 0; e--) {
		let t = i[e], s = t[o];
		if (s) {
			if (r && (t[o] = void 0), Array.isArray(s)) {
				for (let e of s) if (!(l(e) && !e.active)) try {
					n(e);
				} catch (e) {
					a === void 0 ? a = [e] : a.push(e);
				}
			} else {
				let e = s;
				if (l(e) && !e.active) continue;
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
function c(e, i) {
	let a = e, s = a[o];
	s ? Array.isArray(s) ? s.push(i) : a[o] = [s, i] : a[o] = i;
	let c = n;
	if (c !== void 0) {
		let n = {
			owner: e,
			resource: i,
			index: c.nextIndex++,
			slot: c.entries.length
		};
		c.entries.push(n);
		let r = () => {
			let e = n.slot;
			if (e < 0 || (n.slot = -1, c.stopping)) return;
			let t = c.entries.pop();
			t !== n && (c.entries[e] = t, t.slot = e);
		};
		l(i) ? i.release = r : typeof i != "function" && t?.onStop(i, r);
	}
	let u = r;
	u !== void 0 && u.push({
		owner: e,
		resource: i,
		index: u.length
	});
}
function l(e) {
	return typeof e != "function" && a in e;
}
function u(e, t) {
	let n = e, r = n[o];
	if (!r) return;
	if (!Array.isArray(r)) {
		r === t && (n[o] = void 0);
		return;
	}
	let i = r.indexOf(t);
	if (i < 0) return;
	let a = r.pop();
	i < r.length && (r[i] = a), r.length === 1 ? n[o] = r[0] : r.length === 0 && (n[o] = void 0);
}
function d(e, t) {
	if (n !== void 0 || r !== void 0) {
		y(e, t);
		return;
	}
	let i = e, a = i[o];
	a ? Array.isArray(a) ? a.push(t) : i[o] = [a, t] : i[o] = t;
}
function f(e, t) {
	c(e, t);
}
function p(e) {
	let t = r, n = t ?? [], i = n.length;
	r = n;
	try {
		return e();
	} catch (e) {
		r = t;
		try {
			v(n.splice(i));
		} catch (t) {
			throw AggregateError([e, t], "Loom DOM construction and cleanup both failed.");
		}
		throw e;
	} finally {
		r = t;
	}
}
function m(t, n = []) {
	for (let e of t) try {
		w(e);
	} catch (e) {
		n.push(e);
	}
	e(n, "Multiple Loom DOM operations failed.");
}
function h(e) {
	if (n !== void 0) throw TypeError("resourceGroup() cannot be nested; use one flat group per replaceable region.");
	if (Object.prototype.toString.call(e) === "[object AsyncFunction]") throw TypeError("resourceGroup() callbacks must be synchronous.");
	let t = {
		entries: [],
		nextIndex: 0,
		stopping: !1
	}, r = () => {
		t.stopping = !0, v(t.entries);
	};
	n = t;
	let i;
	try {
		if (i = e(), g(i)) throw Promise.resolve(i).catch(() => void 0), TypeError("resourceGroup() callbacks must be synchronous.");
	} catch (e) {
		n = void 0;
		try {
			r();
		} catch (t) {
			throw AggregateError([e, t], "Loom resource group creation and cleanup both failed.");
		}
		throw e;
	} finally {
		n = void 0;
	}
	let a = !0;
	return {
		value: i,
		dispose: () => {
			a && (a = !1, r());
		}
	};
}
function g(e) {
	return (typeof e == "object" || typeof e == "function") && e !== null && "then" in e && typeof e.then == "function";
}
function _(e, t) {
	if (e.owner === t.owner) return e.index - t.index;
	if (e.owner.contains(t.owner)) return 1;
	if (t.owner.contains(e.owner)) return -1;
	let n = e.owner.compareDocumentPosition(t.owner);
	return (n & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 ? (n & Node.DOCUMENT_POSITION_FOLLOWING) === 0 ? 1 : -1 : e.index - t.index;
}
function v(n) {
	let r, i = t, a = [], o = (e) => {
		try {
			if (typeof e == "function") e();
			else if (l(e)) e.dispose();
			else if (i !== void 0) i.stop(e);
			else throw Error("No Loom DOM resource driver is installed.");
		} catch (e) {
			r === void 0 ? r = [e] : r.push(e);
		}
	};
	for (let e of n) {
		let t = e.resource;
		l(t) || typeof t != "function" && i?.requiresOrderedStop(t) === !0 ? a.push(e) : o(t);
	}
	a.sort(_);
	for (let e of a) o(e.resource);
	n.length = 0, e(r, "Multiple Loom DOM resources failed.");
}
function y(e, t) {
	let n = {
		[a]: !0,
		active: !0,
		owner: e,
		stop: t,
		dispose: () => void 0
	};
	return n.dispose = () => {
		if (!n.active) return;
		n.active = !1;
		let e = n.owner, t = n.stop;
		n.owner = void 0, n.stop = void 0;
		let r = n.release;
		n.release = void 0, r?.(), e !== void 0 && u(e, n), t?.();
	}, c(e, n), n.dispose;
}
function b(e, n) {
	s(e, (e) => {
		if (!(typeof e == "function" || l(e))) {
			if (t === void 0) throw Error("No Loom DOM resource driver is installed.");
			n(t, e);
		}
	}, !1);
}
function x(e) {
	b(e, (e, t) => e.pause(t));
}
function S(e) {
	b(e, (e, t) => e.resume(t));
}
function C(e) {
	s(e, (e) => {
		if (typeof e == "function") e();
		else if (l(e)) e.dispose();
		else if (t !== void 0) t.stop(e);
		else throw Error("No Loom DOM resource driver is installed.");
	}, !0);
}
function w(e) {
	let t = !1, n;
	try {
		C(e);
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
export { f as a, m as c, p as d, e as f, d as i, h as l, i as n, x as o, y as r, w as s, C as t, S as u };
