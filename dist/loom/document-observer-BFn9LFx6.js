//#region src/dom/document-observer.ts
function e(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function t(e, t) {
	let n = new ((e.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(t);
	return n.observe(e.documentElement ?? e, {
		childList: !0,
		subtree: !0
	}), n;
}
//#endregion
export { t as n, e as t };
