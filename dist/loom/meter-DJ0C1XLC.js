import { A as e, D as t, E as n, F as r, M as i, N as a, O as o, P as s, g as c, j as l, k as u } from "./loom-btAeTSbc.js";
//#region src/core/meter.ts
var d = 1 << 20, f = 5;
function p(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > d) throw RangeError(`Channel capacity must be an integer in [0, ${d}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function m(e, t, n) {
	let r = p(t);
	if (n.length > f) throw RangeError(`A channel records up to ${f} fields; "${e}" declares ${n.length}.`);
	return i(e, r, n);
}
function h(e) {
	if (e.cap !== 0 && e.cols === void 0) {
		let t = [];
		for (let n = 0; n < e.fields.length; n++) t.push(Array(e.cap));
		e.cols = t;
	}
}
function g(e, t, n, r, i, a) {
	let o = e.cols;
	if (o !== void 0) {
		let s = e.head, c = o[0];
		c !== void 0 && (c[s] = t);
		let l = o[1];
		l !== void 0 && (l[s] = n);
		let u = o[2];
		u !== void 0 && (u[s] = r);
		let d = o[3];
		d !== void 0 && (d[s] = i);
		let f = o[4];
		f !== void 0 && (f[s] = a), e.head = s + 1 & e.mask;
	}
	e.seq++;
}
s.record = g;
var _ = Object.freeze([]);
function v(e) {
	return {
		name: e.name,
		get active() {
			return e.meters !== 0;
		},
		emit(t, n, r, i, a) {
			e.meters !== 0 && g(e, t, n, r, i, a);
		}
	};
}
function y(e, t) {
	if (e.startsWith("loom:")) throw Error(`Channel name "${e}" uses the reserved "loom:" prefix (built-in runtime channels).`);
	let r = n.get(e);
	if (r === void 0) r = m(e, t?.capacity ?? 0, t?.fields ?? []), n.set(e, r);
	else if (t !== void 0 && (p(t.capacity ?? 0) !== r.cap || !b(t.fields ?? [], r.fields))) throw Error(`Channel "${e}" already declared with different options.`);
	return v(r);
}
function b(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function x(e, t = "count") {
	let r = t === "samples", i = [];
	for (let t of e) {
		let e = n.get(t.name);
		e !== void 0 && i.push({
			node: e,
			cursor: e.seq
		});
	}
	let a = !1, o = () => {
		if (!a) {
			a = !0;
			for (let e of i) e.node.meters++, r && (e.node.samples++, h(e.node)), e.cursor = e.node.seq;
		}
	}, s = () => {
		if (a) {
			a = !1;
			for (let e of i) e.node.meters--, r && (e.node.samples--, e.node.samples === 0 && (e.node.cols = void 0, e.node.head = 0));
		}
	};
	return o(), {
		read() {
			let e = Object.create(null);
			for (let t of i) {
				let n = t.node, i = n.seq, a = i - t.cursor, o = 0, s = _;
				if (r && n.cap !== 0 && a > 0) {
					let e = a < n.cap ? a : n.cap;
					o = a - e;
					let { fields: t, mask: r, head: i, cap: c } = n, l = n.cols ?? [], u = [];
					for (let n = 0; n < e; n++) {
						let a = i + c - e + n & r, o = Object.create(null);
						for (let e = 0; e < t.length; e++) o[t[e]] = l[e]?.[a];
						u.push(o);
					}
					s = u;
				}
				t.cursor = i, e[n.name] = {
					count: a,
					dropped: o,
					samples: s
				};
			}
			return e;
		},
		stop: c({
			pause: s,
			resume: o,
			stop: s
		})
	};
}
var S = {
	read: /* @__PURE__ */ v(a),
	write: /* @__PURE__ */ v(r),
	compute: /* @__PURE__ */ v(t),
	effect: /* @__PURE__ */ v(e),
	flush: /* @__PURE__ */ v(l),
	create: /* @__PURE__ */ v(o),
	dispose: /* @__PURE__ */ v(u)
};
function C(e) {
	return e;
}
//#endregion
export { C as i, S as n, x as r, y as t };
