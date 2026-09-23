//#region src/core/errors.ts
function e(e, t) {
	if (e?.length === 1) throw e[0];
	if (e && e.length > 1) throw AggregateError(e, t);
}
//#endregion
//#region src/core/tracking.ts
var t = (e) => e();
function n(e) {
	t = e;
}
function r(e) {
	return t(e);
}
//#endregion
export { r as n, e as r, n as t };
