//#region src/core/errors.ts
function e(e, t) {
	if (e?.length === 1) throw e[0];
	if (e && e.length > 1) throw AggregateError(e, t);
}
//#endregion
export { e as t };
