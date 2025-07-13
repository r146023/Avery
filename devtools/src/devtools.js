import { Component, Fragment, options } from 'avery';

export function initDevTools() {
	const globalVar =
		typeof globalThis !== 'undefined'
			? globalThis
			: typeof window !== 'undefined'
				? window
				: undefined;

	if (
		globalVar !== null &&
		globalVar !== undefined &&
		globalVar.__AVERY_DEVTOOLS__
	) {
		globalVar.__AVERY_DEVTOOLS__.attachAvery('10.26.8', options, {
			Fragment,
			Component
		});
	}
}
