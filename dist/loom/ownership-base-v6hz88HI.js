//#region src/dom/ownership-base.ts
var e, t;
function n(t) {
	e = t;
}
var r = Symbol("loom.registered-stop"), i = Symbol("loom.owned");
function a(e, t, n) {
	let r = [e];
	for (let e = 0; e < r.length; e++) {
		let t = r[e];
		for (let e = t.lastChild; e; e = e.previousSibling) r.push(e);
	}
	let a;
	for (let e = r.length - 1; e >= 0; e--) {
		let o = r[e], c = o[i];
		if (c) if (n && (o[i] = void 0), Array.isArray(c)) {
			for (let e of c) if (!(s(e) && !e.active)) try {
				t(e);
			} catch (e) {
				a === void 0 ? a = [e] : a.push(e);
			}
		} else {
			let e = c;
			if (s(e) && !e.active) continue;
			try {
				t(e);
			} catch (e) {
				a === void 0 ? a = [e] : a.push(e);
			}
		}
	}
	if (a?.length === 1) throw a[0];
	if (a && a.length > 1) throw AggregateError(a, "Multiple Loom DOM disposers failed.");
}
function o(e, n) {
	let r = e, a = r[i];
	a ? Array.isArray(a) ? a.push(n) : r[i] = [a, n] : r[i] = n;
	let o = t;
	o !== void 0 && o.push({
		owner: e,
		resource: n,
		index: o.length
	});
}
function s(e) {
	return typeof e != "function" && r in e;
}
function c(e, t) {
	let n = e, r = n[i];
	if (!r) return;
	if (!Array.isArray(r)) {
		r === t && (n[i] = void 0);
		return;
	}
	let a = r.indexOf(t);
	if (a < 0) return;
	let o = r.pop();
	a < r.length && (r[a] = o), r.length === 1 ? n[i] = r[0] : r.length === 0 && (n[i] = void 0);
}
function l(e, n) {
	if (t !== void 0) {
		h(e, n);
		return;
	}
	let r = e, a = r[i];
	a ? Array.isArray(a) ? a.push(n) : r[i] = [a, n] : r[i] = n;
}
function u(e, t) {
	o(e, t);
}
function d(e) {
	if (t !== void 0) throw TypeError("resourceGroup() cannot be nested; use one flat group per replaceable region.");
	if (Object.prototype.toString.call(e) === "[object AsyncFunction]") throw TypeError("resourceGroup() callbacks must be synchronous.");
	let n = [];
	t = n;
	let r;
	try {
		if (r = e(), f(r)) throw Promise.resolve(r).catch(() => void 0), TypeError("resourceGroup() callbacks must be synchronous.");
	} catch (e) {
		t = void 0;
		try {
			m(n);
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
			i && (i = !1, m(n));
		}
	};
}
function f(e) {
	return (typeof e == "object" || typeof e == "function") && e !== null && "then" in e && typeof e.then == "function";
}
function p(e, t) {
	if (e.owner === t.owner) return e.index - t.index;
	if (e.owner.contains(t.owner)) return 1;
	if (t.owner.contains(e.owner)) return -1;
	let n = e.owner.compareDocumentPosition(t.owner);
	return (n & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 ? (n & Node.DOCUMENT_POSITION_FOLLOWING) === 0 ? 1 : -1 : e.index - t.index;
}
function m(t) {
	let n, r = e, i = [], a = (e) => {
		try {
			if (typeof e == "function") e();
			else if (s(e)) e.dispose();
			else if (r !== void 0) r.stop(e);
			else throw Error("No Loom DOM resource driver is installed.");
		} catch (e) {
			n === void 0 ? n = [e] : n.push(e);
		}
	};
	for (let e of t) {
		let t = e.resource;
		s(t) || typeof t != "function" && r?.requiresOrderedStop(t) === !0 ? i.push(e) : a(t);
	}
	i.sort(p);
	for (let e of i) a(e.resource);
	if (t.length = 0, n?.length === 1) throw n[0];
	if (n && n.length > 1) throw AggregateError(n, "Multiple Loom DOM resources failed.");
}
function h(e, t) {
	let n = {
		[r]: !0,
		active: !0,
		owner: e,
		stop: t,
		dispose: () => void 0
	};
	return n.dispose = () => {
		if (!n.active) return;
		n.active = !1;
		let e = n.owner, t = n.stop;
		n.owner = void 0, n.stop = void 0, e !== void 0 && c(e, n), t?.();
	}, o(e, n), n.dispose;
}
function g(t, n) {
	a(t, (t) => {
		if (!(typeof t == "function" || s(t))) {
			if (e === void 0) throw Error("No Loom DOM resource driver is installed.");
			n(e, t);
		}
	}, !1);
}
function _(e) {
	g(e, (e, t) => e.pause(t));
}
function v(e) {
	g(e, (e, t) => e.resume(t));
}
function y(t) {
	a(t, (t) => {
		if (typeof t == "function") t();
		else if (s(t)) t.dispose();
		else if (e !== void 0) e.stop(t);
		else throw Error("No Loom DOM resource driver is installed.");
	}, !0);
}
function b(e) {
	let t = !1, n;
	try {
		y(e);
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
export { u as a, d as c, l as i, v as l, n, _ as o, h as r, b as s, y as t };
