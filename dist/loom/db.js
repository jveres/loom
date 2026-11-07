import { resource as e } from "./async.js";
import { i as t, r as n } from "./tracking-wsSu4LCy.js";
import { C as r, D as i, c as a, w as o, x as s } from "./loom-Bchrc-TP.js";
// src/db/notifications.ts
var c = /* @__PURE__ */ new Map();
function l(e) {
	try {
		e();
	} catch {}
}
var u = class {
	name;
	mode = o("manual");
	channel;
	owners = 0;
	listeners = /* @__PURE__ */ new Set();
	pending = /* @__PURE__ */ new Set();
	all = !1;
	queued = !1;
	sender = `${Date.now()}:${Math.random()}`;
	resume = () => this.invalidate();
	visible = () => {
		document.visibilityState === "visible" && this.invalidate();
	};
	constructor(e) {
		this.name = e;
		try {
			this.channel = new BroadcastChannel(`loom/db:${e}`), this.mode("broadcast"), this.channel.onmessageerror = () => this.disable(), this.channel.onmessage = (t) => {
				let n = t.data;
				if (!n || typeof n != "object") return;
				let r = n;
				r.protocol === 1 && r.database === e && r.sender !== this.sender && typeof r.sender == "string" && typeof r.version == "number" && Array.isArray(r.stores) && r.stores.every((e) => typeof e == "string") && this.invalidate(r.stores);
			};
		} catch {
			this.disable();
		}
		typeof window < "u" && (window.addEventListener("pageshow", this.resume), window.addEventListener("focus", this.resume), document.addEventListener("visibilitychange", this.visible));
	}
	retain() {
		this.owners++;
		let e = !0;
		return () => {
			e && (e = !1, --this.owners === 0 && (this.closeChannel(), typeof window < "u" && (window.removeEventListener("pageshow", this.resume), window.removeEventListener("focus", this.resume), document.removeEventListener("visibilitychange", this.visible)), this.listeners.clear(), c.delete(this.name)));
		};
	}
	subscribe(e, t) {
		let n = {
			stores: e,
			notify: t
		};
		return this.listeners.add(n), () => {
			this.listeners.delete(n);
		};
	}
	invalidate(e) {
		if (e === void 0) this.all = !0;
		else for (let t of e) this.pending.add(t);
		this.queued || (this.queued = !0, queueMicrotask(() => {
			this.queued = !1;
			let e = this.all, t = this.pending;
			this.all = !1, this.pending = /* @__PURE__ */ new Set();
			for (let n of [...this.listeners]) this.listeners.has(n) && (e || [...n.stores].some((e) => t.has(e))) && l(n.notify);
		}));
	}
	commit(e, t) {
		this.invalidate(t);
		try {
			this.channel?.postMessage({
				protocol: 1,
				database: this.name,
				version: e,
				sender: this.sender,
				stores: t
			});
		} catch {
			this.disable();
		}
	}
	closeChannel() {
		try {
			this.channel?.close();
		} catch {}
		this.channel = void 0;
	}
	disable() {
		this.closeChannel(), l(() => this.mode("manual"));
	}
};
function d(e) {
	let t = c.get(e);
	return t || (t = new u(e), c.set(e, t)), t;
}
function f(e) {
	return () => e.mode();
}
// src/db/transaction.ts
var p = class extends Error {
	committed;
	constructor(e, t, n) {
		super(e, n), this.name = "TransactionContractError", this.committed = t;
	}
};
function m(e) {
	if (!Array.isArray(e) || e.length === 0 || e.some((e) => typeof e != "string")) throw TypeError("Declare a nonempty array of store names");
	return [...new Set(e)];
}
function h(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "string" || typeof e == "number" && Number.isFinite(e)) return e;
	if (!Array.isArray(e) || t.has(e)) throw TypeError("Expected a finite number, string, or compound key");
	t.add(e);
	let n = Array.from(e, (e) => h(e, t));
	return t.delete(e), n;
}
function g(e) {
	if (!e || !Number.isSafeInteger(e.limit) || e.limit < 1) throw RangeError("Scan limit must be a positive safe integer");
	let t = e.direction ?? "next";
	if (t !== "next" && t !== "prev") throw TypeError("Scan direction must be next or prev");
	let n = e.range;
	if (n === void 0) return {
		range: void 0,
		direction: t,
		limit: e.limit
	};
	if (!n || typeof n != "object") throw TypeError("Invalid key range");
	let r;
	if ("only" in n) {
		if ([
			"lower",
			"upper",
			"lowerOpen",
			"upperOpen"
		].some((e) => e in n)) throw TypeError("Exact and bounded ranges cannot be combined");
		r = IDBKeyRange.only(h(n.only));
	} else {
		let { lower: e, upper: t, lowerOpen: i, upperOpen: a } = n;
		if (i !== void 0 && (typeof i != "boolean" || e === void 0) || a !== void 0 && (typeof a != "boolean" || t === void 0)) throw TypeError("Open flags require their bound");
		e !== void 0 && t !== void 0 ? r = IDBKeyRange.bound(h(e), h(t), i, a) : e === void 0 ? t !== void 0 && (r = IDBKeyRange.upperBound(h(t), a)) : r = IDBKeyRange.lowerBound(h(e), i);
	}
	return {
		range: r,
		direction: t,
		limit: e.limit
	};
}
function _(e, n, r, i, a, o, s) {
	return new Promise((c, l) => {
		let u;
		try {
			s?.throwIfAborted(), u = e.transaction(n, r);
		} catch (e) {
			o(), l(e);
			return;
		}
		let d = !1, f = !1, m = !1, _, v, y = /* @__PURE__ */ new Set(), b = (e) => {
			if (m || (m = !0, _ = e), !d) try {
				u.abort();
			} catch {}
		}, x = () => b(s?.reason);
		s?.addEventListener("abort", x, { once: !0 });
		let S = () => {
			d = !0, s?.removeEventListener("abort", x), o();
		}, C = () => {
			if (d || f || m) throw new DOMException("Transaction callback is no longer active", "TransactionInactiveError");
		}, w = (e) => {
			try {
				return C(), e();
			} catch (e) {
				throw b(e), e;
			}
		}, T = (e) => (e.catch(() => void 0), e), E = (e, t) => T(new Promise((n, r) => {
			try {
				let i = w(e);
				t !== void 0 && y.add(t), i.onsuccess = () => n(i.result), i.onerror = (e) => {
					e.preventDefault();
					let t = i.error ?? new DOMException("Request failed", "UnknownError");
					b(t), r(t);
				};
			} catch (e) {
				r(e);
			}
		})), D = (e) => {
			let t = (t, n) => T(new Promise((r, i) => {
				try {
					let a = w(() => g(t)), o = w(() => e.openCursor(a.range, a.direction)), s = [];
					o.onerror = (e) => {
						e.preventDefault();
						let t = o.error;
						b(t), i(t);
					}, o.onsuccess = () => {
						try {
							let e = o.result;
							if (!e) {
								r(s);
								return;
							}
							s.push(n ? {
								key: e.primaryKey,
								value: e.value
							} : e.value), s.length === a.limit ? r(s) : e.continue();
						} catch (e) {
							b(e), i(e);
						}
					};
				} catch (e) {
					i(e);
				}
			}));
			return {
				scan: (e) => t(e, !1),
				entries: (e) => t(e, !0)
			};
		}, O = { store(e) {
			return w(() => {
				if (!n.includes(e)) throw new DOMException("Store is outside the transaction scope", "NotFoundError");
				let t = u.objectStore(e);
				if (t.keyPath !== null || t.autoIncrement) throw new DOMException("Stores require explicit out-of-line keys", "InvalidAccessError");
				return {
					...D(t),
					get: (e) => E(() => t.get(h(e))),
					index: (e) => w(() => D(t.index(e))),
					...r === "readwrite" ? {
						put: (n, r) => T(E(() => t.put(r, h(n)), e).then(() => void 0)),
						delete: (n) => E(() => t.delete(h(n)), e),
						clear: () => E(() => t.clear(), e)
					} : {}
				};
			});
		} };
		u.onabort = () => {
			S(), l(m ? _ : u.error ?? new DOMException("Transaction aborted", "AbortError"));
		}, u.oncomplete = () => {
			d = !0;
			try {
				if (y.size) try {
					a([...y]);
				} catch {}
				f ? m ? l(new p("Callback failed after the native transaction committed", !0, { cause: _ })) : c(v) : l(new p("Callback outlived the native transaction; await only its requests", !0));
			} finally {
				S();
			}
		};
		try {
			let e = i(O);
			t(e) ? Promise.resolve(e).then((e) => {
				v = e, f = !0;
			}, (e) => {
				f = !0, b(e);
			}) : (v = e, f = !0);
		} catch (e) {
			f = !0, b(e);
		}
	});
}
// src/db/index.ts
function v() {
	return new DOMException("Database connection is closed", "InvalidStateError");
}
function y(t) {
	let n = o("open"), c = d(t.name), l = c.retain(), u = !0, p = v(), h = /* @__PURE__ */ new Set(), g = (e) => {
		if (u) {
			u = !1, t.close(), t.onversionchange = null, t.onclose = null;
			for (let e of h) e();
			h.clear(), l();
			try {
				n(e);
			} catch {}
		}
	};
	t.onversionchange = () => g("versionchange"), t.onclose = () => g("terminated");
	let y = (e, n, r, i) => {
		if (!u) return Promise.reject(v());
		let a;
		try {
			a = m(e);
		} catch (e) {
			return Promise.reject(e);
		}
		let o = c.retain();
		return _(t, a, n, r, (e) => c.commit(t.version, e), o, i);
	};
	return {
		connection: () => n(),
		crossTab: f(c),
		read: (e, t) => i(() => y(e, "readonly", t)),
		write: (e, t) => i(() => y(e, "readwrite", t)),
		query(t, i) {
			let o = m(t), l, d = s(() => {
				let t = 0, a = r((e) => {
					if (e(++t), !u) return () => {};
					let n = c.subscribe(new Set(o), () => e(++t)), r = () => {
						n(), h.delete(r);
					};
					return h.add(r), r;
				}, 0);
				l = e((e, t) => n() === "open" ? (a(), y(o, "readonly", i, t).then((e) => {
					if (!u) throw v();
					return e;
				})) : Promise.reject(v()));
			}, { internal: !0 }), f = a(() => () => d.stop(), { internal: !0 });
			return Object.assign(() => l(), {
				loading: () => n() === "open" && l.loading(),
				ready: l.ready,
				error: () => n() === "open" ? l.error() : p,
				refresh: l.refresh,
				stop: () => {
					f(), d.stop();
				}
			});
		},
		refresh() {
			u && c.invalidate();
		},
		close: () => g("closed")
	};
}
function b(e) {
	return new Promise((r, a) => {
		if (!e || typeof e.name != "string" || !Number.isSafeInteger(e.version) || e.version < 1) {
			a(/* @__PURE__ */ TypeError("Database name and positive safe integer version are required"));
			return;
		}
		let { signal: o } = e;
		if (o?.aborted) {
			a(o.reason);
			return;
		}
		let s;
		try {
			if (typeof indexedDB > "u") throw new DOMException("IndexedDB is unavailable", "NotSupportedError");
			s = indexedDB.open(e.name, e.version);
		} catch (e) {
			a(e);
			return;
		}
		let c = !1, l = () => o?.removeEventListener("abort", d), u = (e) => {
			if (!c) {
				c = !0, l();
				try {
					s.transaction?.abort();
				} catch {}
				a(e);
			}
		}, d = () => u(o?.reason);
		o?.addEventListener("abort", d, { once: !0 }), s.onerror = () => {
			l(), a(s.error);
		}, s.onblocked = (r) => {
			if (!c) try {
				let a = i(() => e.onBlocked?.(r.oldVersion, e.version));
				if (t(a)) throw n(a), TypeError("Blocked observers must be synchronous");
			} catch (e) {
				u(e);
			}
		}, s.onupgradeneeded = (r) => {
			if (c) s.transaction?.abort();
			else try {
				let a = s.transaction;
				if (!a) throw new DOMException("Upgrade transaction is missing", "InvalidStateError");
				let o = i(() => e.upgrade?.(s.result, r.oldVersion, e.version, a));
				if (t(o)) throw n(o), TypeError("Upgrade callbacks must be synchronous");
			} catch (e) {
				u(e);
			}
		}, s.onsuccess = () => {
			if (l(), c || o?.aborted) s.result.close(), c || a(o?.reason);
			else try {
				r(y(s.result));
			} catch (e) {
				s.result.close(), a(e);
			}
		};
	});
}
export { p as TransactionContractError, b as openDatabase };
