//#region src/core/errors.ts
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
//#endregion
//#region src/core/tracking.ts
var r = (e) => e();
function i(e) {
	r = e;
}
function a(e) {
	return r(e);
}
//#endregion
export { n as a, e as i, a as n, t as r, i as t };
