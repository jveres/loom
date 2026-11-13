// src/jsx-props.ts
function e(e) {
	if (!e) return {};
	if (!Object.hasOwn(e, "key")) return e;
	let { key: t, ...n } = e;
	return n;
}
function t(e) {
	return e.startsWith("--") || !/[A-Z]/.test(e) ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function n(e) {
	return e.startsWith("aria-");
}
export { n, e as r, t };
