import { createElement, render, Component } from 'avery';
import { useState, useEffect } from 'avery/hooks';
import 'avery/debug';
import { act } from 'avery/test-utils';
import { setupScratch, teardown } from '../../../test/_util/helpers';
import { vi } from 'vitest';

/** @jsx createElement */

describe('debug with hooks', () => {
	let scratch;
	let errors = [];
	let warnings = [];

	beforeEach(() => {
		errors = [];
		warnings = [];
		scratch = setupScratch();
		vi.spyOn(console, 'error').mockImplementation(e => errors.push(e));
		vi.spyOn(console, 'warn').mockImplementation(w => warnings.push(w));
	});

	afterEach(() => {
		console.error.mockRestore();
		console.warn.mockRestore();
		teardown(scratch);
	});

	it('should throw an error when using a hook outside a render', () => {
		class Foo extends Component {
			componentWillMount() {
				useState();
			}

			render() {
				return this.props.children;
			}
		}

		class App extends Component {
			render() {
				return <p>test</p>;
			}
		}
		const fn = () =>
			act(() =>
				render(
					<Foo>
						<App />
					</Foo>,
					scratch
				)
			);
		expect(fn).to.throw(/Hook can only be invoked from render/);
	});

	it('should throw an error when invoked outside of a component', () => {
		function foo() {
			useEffect(() => {}); // Pretend to use a hook
			return <p>test</p>;
		}

		const fn = () =>
			act(() => {
				render(foo(), scratch);
			});
		expect(fn).to.throw(/Hook can only be invoked from render/);
	});

	it('should throw an error when invoked outside of a component before render', () => {
		function Foo(props) {
			useEffect(() => {}); // Pretend to use a hook
			return props.children;
		}

		const fn = () =>
			act(() => {
				useState();
				render(<Foo>Hello!</Foo>, scratch);
			});
		expect(fn).to.throw(/Hook can only be invoked from render/);
	});

	it('should throw an error when invoked outside of a component after render', () => {
		function Foo(props) {
			useEffect(() => {}); // Pretend to use a hook
			return props.children;
		}

		const fn = () =>
			act(() => {
				render(<Foo>Hello!</Foo>, scratch);
				useState();
			});
		expect(fn).to.throw(/Hook can only be invoked from render/);
	});

	it('should throw an error when invoked inside an effect callback', () => {
		function Foo(props) {
			useEffect(() => {
				useState();
			});
			return props.children;
		}

		const fn = () =>
			act(() => {
				render(<Foo>Hello!</Foo>, scratch);
			});
		expect(fn).to.throw(/Hook can only be invoked from render/);
	});
});
