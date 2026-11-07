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
			e && (e = !1, --this.owners === 0 && (this.channel?.close(), this.channel = void 0, typeof window < "u" && (window.removeEventListener("pageshow", this.resume), window.removeEventListener("focus", this.resume), document.removeEventListener("visibilitychange", this.visible)), this.listeners.clear(), c.delete(this.name)));
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
	disable() {
		try {
			this.channel?.close();
		} catch {}
		this.channel = void 0, l(() => this.mode("manual"));
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
function _(e, n, r, i, a, o) {
	return new Promise((s, c) => {
		let l, u = m(n);
		try {
			l = e.transaction(u, r);
		} catch (e) {
			o(), c(e);
			return;
		}
		let d = !1, f = !1, _ = !1, v, y, b = /* @__PURE__ */ new Set(), x = (e) => {
			if (_ || (_ = !0, v = e), !d) try {
				l.abort();
			} catch {}
		}, S = () => {
			if (d || f || _) throw new DOMException("Transaction callback is no longer active", "TransactionInactiveError");
		}, C = (e) => {
			try {
				return S(), e();
			} catch (e) {
				throw x(e), e;
			}
		}, w = (e) => (e.catch(() => void 0), e), T = (e, t) => w(new Promise((n, r) => {
			try {
				let i = C(e);
				t !== void 0 && b.add(t), i.onsuccess = () => n(i.result), i.onerror = (e) => {
					e.preventDefault();
					let t = i.error ?? new DOMException("Request failed", "UnknownError");
					x(t), r(t);
				};
			} catch (e) {
				r(e);
			}
		})), E = (e) => {
			let t = (t, n) => w(new Promise((r, i) => {
				try {
					let a = C(() => g(t)), o = C(() => e.openCursor(a.range, a.direction)), s = [];
					o.onerror = (e) => {
						e.preventDefault();
						let t = o.error;
						x(t), i(t);
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
							x(e), i(e);
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
		}, D = { store(e) {
			return C(() => {
				if (!u.includes(e)) throw new DOMException("Store is outside the transaction scope", "NotFoundError");
				let t = l.objectStore(e);
				if (t.keyPath !== null || t.autoIncrement) throw new DOMException("Stores require explicit out-of-line keys", "InvalidAccessError");
				return {
					...E(t),
					get: (e) => T(() => t.get(h(e))),
					index: (e) => C(() => E(t.index(e))),
					...r === "readwrite" ? {
						put: (n, r) => w(T(() => t.put(r, h(n)), e).then(() => void 0)),
						delete: (n) => T(() => t.delete(h(n)), e),
						clear: () => T(() => t.clear(), e)
					} : {}
				};
			});
		} };
		l.onabort = () => {
			d = !0, o(), c(_ ? v : l.error ?? new DOMException("Transaction aborted", "AbortError"));
		}, l.oncomplete = () => {
			d = !0;
			try {
				if (b.size) try {
					a([...b]);
				} catch {}
				f ? _ ? c(v) : s(y) : c(new p("Callback outlived the native transaction; await only its requests", !0));
			} finally {
				o();
			}
		};
		try {
			let e = i(D);
			t(e) ? Promise.resolve(e).then((e) => {
				y = e, f = !0;
			}, (e) => {
				f = !0, x(e);
			}) : (y = e, f = !0);
		} catch (e) {
			f = !0, x(e);
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
	let y = (e, n, r) => {
		if (!u) return Promise.reject(v());
		let i;
		try {
			i = m(e);
		} catch (e) {
			return Promise.reject(e);
		}
		let a = c.retain();
		return _(t, i, n, r, (e) => c.commit(t.version, e), a);
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
				l = e(() => n() === "open" ? (a(), y(o, "readonly", i).then((e) => {
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
