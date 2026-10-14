//#region src/jsx-props.ts
function e(e) {
	if (!e) return {};
	if (!Object.hasOwn(e, "key")) return e;
	let t = {};
	for (let n in e) Object.hasOwn(e, n) && n !== "key" && (t[n] = e[n]);
	return t;
}
function t(e) {
	return e.startsWith("--") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function n(e) {
	return e.startsWith("aria-");
}
//#endregion
export { n, e as r, t };
