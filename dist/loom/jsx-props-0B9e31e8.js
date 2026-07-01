//#region src/jsx-props.ts
function e(e) {
	let t = {};
	if (e) for (let n in e) !Object.hasOwn(e, n) || n === "key" || (t[n] = e[n]);
	return t;
}
//#endregion
export { e as t };
