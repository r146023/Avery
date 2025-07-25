import {
	createElement,
	render as averyRender,
	cloneElement as averyCloneElement,
	createRef,
	Component,
	createContext,
	Fragment
} from 'avery';
import {
	useState,
	useId,
	useReducer,
	useEffect,
	useLayoutEffect,
	useRef,
	useImperativeHandle,
	useMemo,
	useCallback,
	useContext,
	useDebugValue
} from 'avery/hooks';
import {
	useInsertionEffect,
	startTransition,
	useDeferredValue,
	useSyncExternalStore,
	useTransition
} from './hooks';
import { PureComponent } from './PureComponent';
import { memo } from './memo';
import { forwardRef } from './forwardRef';
import { Children } from './Children';
import { Suspense, lazy } from './suspense';
import { createPortal } from './portals';
import {
	hydrate,
	render,
	REACT_ELEMENT_TYPE,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
} from './render';

const version = '18.3.1'; // trick libraries to think we are react

/**
 * Legacy version of createElement.
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor
 */
function createFactory(type) {
	return createElement.bind(null, type);
}

/**
 * Check if the passed element is a valid (p)react node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isValidElement(element) {
	return !!element && element.$$typeof === REACT_ELEMENT_TYPE;
}

/**
 * Check if the passed element is a Fragment node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isFragment(element) {
	return isValidElement(element) && element.type === Fragment;
}

/**
 * Check if the passed element is a Memo node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isMemo(element) {
	return (
		!!element &&
		!!element.displayName &&
		(typeof element.displayName === 'string' ||
			element.displayName instanceof String) &&
		element.displayName.startsWith('Memo(')
	);
}

/**
 * Wrap `cloneElement` to abort if the passed element is not a valid element and apply
 * all vnode normalizations.
 * @param {import('./internal').VNode} element The vnode to clone
 * @param {object} props Props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} rest Optional component children
 */
function cloneElement(element) {
	if (!isValidElement(element)) return element;
	return averyCloneElement.apply(null, arguments);
}

/**
 * Remove a component tree from the DOM, including state and event handlers.
 * @param {import('./internal').AveryElement} container
 * @returns {boolean}
 */
function unmountComponentAtNode(container) {
	if (container._children) {
		averyRender(null, container);
		return true;
	}
	return false;
}

/**
 * Get the matching DOM node for a component
 * @param {import('./internal').Component} component
 * @returns {import('./internal').AveryElement | null}
 */
function findDOMNode(component) {
	return (
		(component &&
			((component._vnode && component._vnode._dom) ||
				(component.nodeType === 1 && component))) ||
		null
	);
}

/**
 * In React, `flushSync` flushes the entire tree and forces a rerender. It's
 * implmented here as a no-op.
 * @template Arg
 * @template Result
 * @param {(arg: Arg) => Result} callback function that runs before the flush
 * @param {Arg} [arg] Optional argument that can be passed to the callback
 * @returns
 */
const flushSync = (callback, arg) => callback(arg);

/**
 * Strict Mode is not implemented in Avery, so we provide a stand-in for it
 * that just renders its children without imposing any restrictions.
 */
const StrictMode = Fragment;

// compat to react-is
export const isElement = isValidElement;

export * from 'avery/hooks';
export {
	version,
	Children,
	render,
	hydrate,
	unmountComponentAtNode,
	createPortal,
	createElement,
	createContext,
	createFactory,
	cloneElement,
	createRef,
	Fragment,
	isValidElement,
	isFragment,
	isMemo,
	findDOMNode,
	Component,
	PureComponent,
	memo,
	forwardRef,
	flushSync,
	useInsertionEffect,
	startTransition,
	useDeferredValue,
	useSyncExternalStore,
	useTransition,
	StrictMode,
	Suspense,
	lazy,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
};

// React copies the named exports to the default one.
export default {
	useState,
	useId,
	useReducer,
	useEffect,
	useLayoutEffect,
	useInsertionEffect,
	useTransition,
	useDeferredValue,
	useSyncExternalStore,
	startTransition,
	useRef,
	useImperativeHandle,
	useMemo,
	useCallback,
	useContext,
	useDebugValue,
	version,
	Children,
	render,
	hydrate,
	unmountComponentAtNode,
	createPortal,
	createElement,
	createContext,
	createFactory,
	cloneElement,
	createRef,
	Fragment,
	isValidElement,
	isElement,
	isFragment,
	isMemo,
	findDOMNode,
	Component,
	PureComponent,
	memo,
	forwardRef,
	flushSync,
	StrictMode,
	Suspense,
	lazy,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
};
