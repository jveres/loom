// src/core/errors.ts
function e(e) {
	return e != null && typeof e.then == "function";
}
function t(e) {
	e.then(void 0, () => void 0);
}
function n(e, t) {
	if (e?.length === 1) throw e[0];
	if (e && e.length > 1) throw AggregateError(e, t);
}
function r(e, t, n) {
	try {
		e();
	} catch (e) {
		throw AggregateError([t, e], n);
	}
	throw t;
}
// src/core/tracking.ts
var i = (e) => e();
function a(e) {
	i = e;
}
function o(e) {
	return i(e);
}
export { r as a, e as i, o as n, n as o, t as r, a as t };
