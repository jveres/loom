import { C as e, D as t, E as n, O as r, S as i, T as a, b as o, p as s, w as c, x as l } from "./loom-v9Dpu4UJ.js";
//#region src/core/meter.ts
var u = 1 << 20, d = 5;
function f(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > u) throw RangeError(`Channel capacity must be an integer in [0, ${u}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function p(e, t, n) {
	let r = f(t);
	if (n.length > d) throw RangeError(`A channel records up to ${d} fields; "${e}" declares ${n.length}.`);
	return {
		name: e,
		cap: r,
		mask: r > 0 ? r - 1 : 0,
		fields: n,
		cols: void 0,
		meters: 0,
		samples: 0,
		seq: 0,
		head: 0
	};
}
function m(e) {
	if (e.cap !== 0 && e.cols === void 0) {
		let t = [];
		for (let n = 0; n < e.fields.length; n++) t.push(Array(e.cap));
		e.cols = t;
	}
}
function h(e, t, n, r, i, a) {
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
t.record = h;
var g = [];
function _(e) {
	return {
		name: e.name,
		get active() {
			return e.meters !== 0;
		},
		emit(t, n, r, i, a) {
			e.meters !== 0 && h(e, t, n, r, i, a);
		}
	};
}
function v(e, t) {
	if (e.startsWith("loom:")) throw Error(`Channel name "${e}" uses the reserved "loom:" prefix (built-in runtime channels).`);
	let n = o.get(e);
	if (n === void 0) n = p(e, t?.capacity ?? 0, t?.fields ?? []), o.set(e, n);
	else if (t !== void 0 && (f(t.capacity ?? 0) !== n.cap || !y(t.fields ?? [], n.fields))) throw Error(`Channel "${e}" already declared with different options.`);
	return _(n);
}
function y(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function b(e, t = "count") {
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
			for (let e of r) e.node.meters++, n && (e.node.samples++, m(e.node)), e.cursor = e.node.seq;
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
				let r = t.node, i = r.seq, a = i - t.cursor, o = 0, s = g;
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
var x = {
	read: /* @__PURE__ */ _(n),
	write: /* @__PURE__ */ _(r),
	compute: /* @__PURE__ */ _(l),
	effect: /* @__PURE__ */ _(c),
	flush: /* @__PURE__ */ _(a),
	create: /* @__PURE__ */ _(i),
	dispose: /* @__PURE__ */ _(e)
};
function S(e) {
	return e;
}
//#endregion
export { S as i, x as n, b as r, v as t };
