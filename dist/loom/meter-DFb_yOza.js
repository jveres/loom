import { C as e, D as t, E as n, O as r, S as i, T as a, b as o, f as s, k as c, w as l, x as u } from "./loom-BE6Qi7th.js";
//#region src/core/meter.ts
var d = 1 << 20, f = 5;
function p(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > d) throw RangeError(`Channel capacity must be an integer in [0, ${d}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function m(e, t, r) {
	let i = p(t);
	if (r.length > f) throw RangeError(`A channel records up to ${f} fields; "${e}" declares ${r.length}.`);
	return n(e, i, r);
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
r.record = g;
var _ = [];
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
	let n = o.get(e);
	if (n === void 0) n = m(e, t?.capacity ?? 0, t?.fields ?? []), o.set(e, n);
	else if (t !== void 0 && (p(t.capacity ?? 0) !== n.cap || !b(t.fields ?? [], n.fields))) throw Error(`Channel "${e}" already declared with different options.`);
	return v(n);
}
function b(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function x(e, t = "count") {
	let n = t === "samples", r = [];
	for (let t of e) {
		let e = o.get(t.name);
		e !== void 0 && r.push({
			node: e,
			cursor: e.seq
		});
	}
	let i = !1, a = () => {
		if (!i) {
			i = !0;
			for (let e of r) e.node.meters++, n && (e.node.samples++, h(e.node)), e.cursor = e.node.seq;
		}
	}, c = () => {
		if (i) {
			i = !1;
			for (let e of r) e.node.meters--, n && e.node.samples--;
		}
	};
	return a(), s({
		pause: c,
		resume: a,
		stop: c
	}), {
		read() {
			let e = {};
			for (let t of r) {
				let r = t.node, i = r.seq, a = i - t.cursor, o = 0, s = _;
				if (n && r.cap !== 0 && a > 0) {
					let e = a < r.cap ? a : r.cap;
					o = a - e;
					let { fields: t, mask: n, head: i, cap: c } = r, l = r.cols ?? [], u = [];
					for (let r = 0; r < e; r++) {
						let a = i + c - e + r & n, o = {};
						for (let e = 0; e < t.length; e++) o[t[e]] = l[e]?.[a];
						u.push(o);
					}
					s = u;
				}
				t.cursor = i, e[r.name] = {
					count: a,
					dropped: o,
					samples: s
				};
			}
			return e;
		},
		stop: c
	};
}
var S = {
	read: /* @__PURE__ */ v(t),
	write: /* @__PURE__ */ v(c),
	compute: /* @__PURE__ */ v(u),
	effect: /* @__PURE__ */ v(l),
	flush: /* @__PURE__ */ v(a),
	create: /* @__PURE__ */ v(i),
	dispose: /* @__PURE__ */ v(e)
};
function C(e) {
	return e;
}
//#endregion
export { C as i, S as n, x as r, y as t };
