import {
	Component as AveryComponent,
	VNode as AveryVNode,
	FunctionComponent as AveryFunctionComponent,
	AveryElement
} from '../../src/internal';
import { SuspenseProps } from './suspense';

export { ComponentChildren } from '../..';

export { AveryElement };

export interface Component<P = {}, S = {}> extends AveryComponent<P, S> {
	isReactComponent?: object;
	isPureReactComponent?: true;
	_patchedLifecycles?: true;

	// Suspense internal properties
	_childDidSuspend?(error: Promise<void>, suspendingVNode: VNode): void;
	_suspended: (vnode: VNode) => (unsuspend: () => void) => void;
	_onResolve?(): void;

	// Portal internal properties
	_temp: any;
	_container: AveryElement;
}

export interface FunctionComponent<P = {}> extends AveryFunctionComponent<P> {
	shouldComponentUpdate?(nextProps: Readonly<P>): boolean;
	_patchedLifecycles?: true;
}

export interface VNode<T = any> extends AveryVNode<T> {
	$$typeof?: symbol;
	averyCompatNormalized?: boolean;
}

export interface SuspenseState {
	_suspended?: null | VNode<any>;
}

export interface SuspenseComponent
	extends AveryComponent<SuspenseProps, SuspenseState> {
	_pendingSuspensionCount: number;
	_suspenders: Component[];
	_detachOnNextRender: null | VNode<any>;
}
