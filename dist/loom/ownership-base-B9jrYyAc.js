//#region src/dom/ownership-base.ts
var e, t, n;
function r(t) {
	e = t;
}
var i = Symbol("loom.registered-stop"), a = Symbol("loom.owned");
function o(e, t, n) {
	let r = [e];
	for (let e = 0; e < r.length; e++) {
		let t = r[e];
		for (let e = t.lastChild; e; e = e.previousSibling) r.push(e);
	}
	let i;
	for (let e = r.length - 1; e >= 0; e--) {
		let o = r[e], s = o[a];
		if (s) {
			if (n && (o[a] = void 0), Array.isArray(s)) {
				for (let e of s) if (!(c(e) && !e.active)) try {
					t(e);
				} catch (e) {
					i === void 0 ? i = [e] : i.push(e);
				}
			} else {
				let e = s;
				if (c(e) && !e.active) continue;
				try {
					t(e);
				} catch (e) {
					i === void 0 ? i = [e] : i.push(e);
				}
			}
		}
	}
	if (i?.length === 1) throw i[0];
	if (i && i.length > 1) throw AggregateError(i, "Multiple Loom DOM disposers failed.");
}
function s(e, r) {
	let i = e, o = i[a];
	o ? Array.isArray(o) ? o.push(r) : i[a] = [o, r] : i[a] = r;
	let s = t;
	s !== void 0 && s.push({
		owner: e,
		resource: r,
		index: s.length
	});
	let c = n;
	c !== void 0 && c.push({
		owner: e,
		resource: r,
		index: c.length
	});
}
function c(e) {
	return typeof e != "function" && i in e;
}
function l(e, t) {
	let n = e, r = n[a];
	if (!r) return;
	if (!Array.isArray(r)) {
		r === t && (n[a] = void 0);
		return;
	}
	let i = r.indexOf(t);
	if (i < 0) return;
	let o = r.pop();
	i < r.length && (r[i] = o), r.length === 1 ? n[a] = r[0] : r.length === 0 && (n[a] = void 0);
}
function u(e, r) {
	if (t !== void 0 || n !== void 0) {
		v(e, r);
		return;
	}
	let i = e, o = i[a];
	o ? Array.isArray(o) ? o.push(r) : i[a] = [o, r] : i[a] = r;
}
function d(e, t) {
	s(e, t);
}
function f(e) {
	let t = n, r = t ?? [], i = r.length;
	n = r;
	try {
		return e();
	} catch (e) {
		n = t;
		try {
			_(r.splice(i));
		} catch (t) {
			throw AggregateError([e, t], "Loom DOM construction and cleanup both failed.");
		}
		throw e;
	} finally {
		n = t;
	}
}
function p(e, t = []) {
	for (let n of e) try {
		C(n);
	} catch (e) {
		t.push(e);
	}
	if (t.length === 1) throw t[0];
	if (t.length > 1) throw AggregateError(t, "Multiple Loom DOM operations failed.");
}
function m(e) {
	if (t !== void 0) throw TypeError("resourceGroup() cannot be nested; use one flat group per replaceable region.");
	if (Object.prototype.toString.call(e) === "[object AsyncFunction]") throw TypeError("resourceGroup() callbacks must be synchronous.");
	let n = [];
	t = n;
	let r;
	try {
		if (r = e(), h(r)) throw Promise.resolve(r).catch(() => void 0), TypeError("resourceGroup() callbacks must be synchronous.");
	} catch (e) {
		t = void 0;
		try {
			_(n);
		} catch (t) {
			throw AggregateError([e, t], "Loom resource group creation and cleanup both failed.");
		}
		throw e;
	} finally {
		t = void 0;
	}
	let i = !0;
	return {
		value: r,
		dispose: () => {
			i && (i = !1, _(n));
		}
	};
}
function h(e) {
	return (typeof e == "object" || typeof e == "function") && e !== null && "then" in e && typeof e.then == "function";
}
function g(e, t) {
	if (e.owner === t.owner) return e.index - t.index;
	if (e.owner.contains(t.owner)) return 1;
	if (t.owner.contains(e.owner)) return -1;
	let n = e.owner.compareDocumentPosition(t.owner);
	return (n & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 ? (n & Node.DOCUMENT_POSITION_FOLLOWING) === 0 ? 1 : -1 : e.index - t.index;
}
function _(t) {
	let n, r = e, i = [], a = (e) => {
		try {
			if (typeof e == "function") e();
			else if (c(e)) e.dispose();
			else if (r !== void 0) r.stop(e);
			else throw Error("No Loom DOM resource driver is installed.");
		} catch (e) {
			n === void 0 ? n = [e] : n.push(e);
		}
	};
	for (let e of t) {
		let t = e.resource;
		c(t) || typeof t != "function" && r?.requiresOrderedStop(t) === !0 ? i.push(e) : a(t);
	}
	i.sort(g);
	for (let e of i) a(e.resource);
	if (t.length = 0, n?.length === 1) throw n[0];
	if (n && n.length > 1) throw AggregateError(n, "Multiple Loom DOM resources failed.");
}
function v(e, t) {
	let n = {
		[i]: !0,
		active: !0,
		owner: e,
		stop: t,
		dispose: () => void 0
	};
	return n.dispose = () => {
		if (!n.active) return;
		n.active = !1;
		let e = n.owner, t = n.stop;
		n.owner = void 0, n.stop = void 0, e !== void 0 && l(e, n), t?.();
	}, s(e, n), n.dispose;
}
function y(t, n) {
	o(t, (t) => {
		if (!(typeof t == "function" || c(t))) {
			if (e === void 0) throw Error("No Loom DOM resource driver is installed.");
			n(e, t);
		}
	}, !1);
}
function b(e) {
	y(e, (e, t) => e.pause(t));
}
function x(e) {
	y(e, (e, t) => e.resume(t));
}
function S(t) {
	o(t, (t) => {
		if (typeof t == "function") t();
		else if (c(t)) t.dispose();
		else if (e !== void 0) e.stop(t);
		else throw Error("No Loom DOM resource driver is installed.");
	}, !0);
}
function C(e) {
	let t = !1, n;
	try {
		S(e);
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
export { d as a, p as c, f as d, u as i, m as l, r as n, b as o, v as r, C as s, S as t, x as u };
