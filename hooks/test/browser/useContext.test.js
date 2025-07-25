import { createElement, render, createContext, Component } from 'avery';
import { act } from 'avery/test-utils';
import { setupScratch, teardown } from '../../../test/_util/helpers';
import { useContext, useEffect, useState } from 'avery/hooks';
import { vi } from 'vitest';

/** @jsx createElement */

describe('useContext', () => {
	/** @type {HTMLDivElement} */
	let scratch;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('gets values from context', () => {
		const values = [];
		const Context = createContext(13);

		function Comp() {
			const value = useContext(Context);
			values.push(value);
			return null;
		}

		render(<Comp />, scratch);
		render(
			<Context.Provider value={42}>
				<Comp />
			</Context.Provider>,
			scratch
		);
		render(
			<Context.Provider value={69}>
				<Comp />
			</Context.Provider>,
			scratch
		);

		expect(values).to.deep.equal([13, 42, 69]);
	});

	it('should use default value', () => {
		const Foo = createContext(42);
		const spy = vi.fn();

		function App() {
			spy(useContext(Foo));
			return <div />;
		}

		render(<App />, scratch);
		expect(spy).toHaveBeenCalledWith(42);
	});

	it('should update when value changes with nonUpdating Component on top', async () => {
		const spy = vi.fn();
		const Ctx = createContext(0);

		class NoUpdate extends Component {
			shouldComponentUpdate() {
				return false;
			}
			render() {
				return this.props.children;
			}
		}

		function App(props) {
			return (
				<Ctx.Provider value={props.value}>
					<NoUpdate>
						<Comp />
					</NoUpdate>
				</Ctx.Provider>
			);
		}

		function Comp() {
			const value = useContext(Ctx);
			spy(value);
			return <h1>{value}</h1>;
		}

		render(<App value={0} />, scratch);
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(0);
		render(<App value={1} />, scratch);

		return new Promise(resolve => {
			// Wait for enqueued hook update
			setTimeout(() => {
				// Should not be called a third time
				expect(spy).toHaveBeenCalledTimes(2);
				expect(spy).toHaveBeenCalledWith(1);
				resolve();
			}, 0);
		});
	});

	it('should only update when value has changed', async () => {
		const spy = vi.fn();
		const Ctx = createContext(0);

		function App(props) {
			return (
				<Ctx.Provider value={props.value}>
					<Comp />
				</Ctx.Provider>
			);
		}

		function Comp() {
			const value = useContext(Ctx);
			spy(value);
			return <h1>{value}</h1>;
		}

		render(<App value={0} />, scratch);
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(0);
		render(<App value={1} />, scratch);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenCalledWith(1);

		return new Promise(resolve => {
			// Wait for enqueued hook update
			setTimeout(() => {
				// Should not be called a third time
				expect(spy).toHaveBeenCalledTimes(2);
				resolve();
			}, 0);
		});
	});

	it('should allow multiple context hooks at the same time', () => {
		const Foo = createContext(0);
		const Bar = createContext(10);
		const spy = vi.fn();
		const unmountspy = vi.fn();

		function Comp() {
			const foo = useContext(Foo);
			const bar = useContext(Bar);
			spy(foo, bar);
			useEffect(() => () => unmountspy());

			return <div />;
		}

		render(
			<Foo.Provider value={0}>
				<Bar.Provider value={10}>
					<Comp />
				</Bar.Provider>
			</Foo.Provider>,
			scratch
		);

		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(0, 10);

		render(
			<Foo.Provider value={11}>
				<Bar.Provider value={42}>
					<Comp />
				</Bar.Provider>
			</Foo.Provider>,
			scratch
		);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(unmountspy).not.toHaveBeenCalled();
	});

	it('should only subscribe a component once', () => {
		const values = [];
		const Context = createContext(13);
		let provider, subSpy;

		function Comp() {
			provider = this._vnode._parent._component;
			const value = useContext(Context);
			values.push(value);
			return null;
		}

		render(<Comp />, scratch);

		render(
			<Context.Provider value={42}>
				<Comp />
			</Context.Provider>,
			scratch
		);
		subSpy = vi.spyOn(provider, 'sub');

		render(
			<Context.Provider value={69}>
				<Comp />
			</Context.Provider>,
			scratch
		);
		expect(subSpy).not.toHaveBeenCalled();

		expect(values).to.deep.equal([13, 42, 69]);
	});

	it('should only subscribe a component once (non-provider)', () => {
		const values = [];
		const Context = createContext(13);
		let provider, subSpy;

		function Comp() {
			provider = this._vnode._parent._component;
			const value = useContext(Context);
			values.push(value);
			return null;
		}

		render(<Comp />, scratch);

		render(
			<Context value={42}>
				<Comp />
			</Context>,
			scratch
		);
		subSpy = vi.spyOn(provider, 'sub');

		render(
			<Context value={69}>
				<Comp />
			</Context>,
			scratch
		);
		expect(subSpy).not.toHaveBeenCalled();

		expect(values).to.deep.equal([13, 42, 69]);
	});

	it('should maintain context', async () => {
		const context = createContext(null);
		const { Provider } = context;
		const first = { name: 'first' };
		const second = { name: 'second' };

		const Input = () => {
			const config = useContext(context);

			// Avoid eslint complaining about unused first value
			const state = useState('initial');
			const set = state[1];

			useEffect(() => {
				// Schedule the update on the next frame
				requestAnimationFrame(() => {
					set('irrelevant');
				});
			}, [config]);

			return <div>{config.name}</div>;
		};

		const App = props => {
			const [config, setConfig] = useState({});

			useEffect(() => {
				setConfig(props.config);
			}, [props.config]);

			return (
				<Provider value={config}>
					<Input />
				</Provider>
			);
		};

		act(() => {
			render(<App config={first} />, scratch);

			// Create a new div to append the `second` case
			const div = scratch.appendChild(document.createElement('div'));
			render(<App config={second} />, div);
		});

		return new Promise(resolve => {
			// Push the expect into the next frame
			requestAnimationFrame(() => {
				expect(scratch.innerHTML).equal(
					'<div>first</div><div><div>second</div></div>'
				);
				resolve();
			});
		});
	});

	it('should not rerender consumers that have been unmounted', () => {
		const context = createContext(0);
		const Provider = context.Provider;

		const Inner = vi.fn(() => {
			const value = useContext(context);
			return <div>{value}</div>;
		});

		let toggleConsumer;
		let changeValue;
		class App extends Component {
			constructor() {
				super();

				this.state = { value: 0, show: true };
				changeValue = value => this.setState({ value });
				toggleConsumer = () => this.setState(({ show }) => ({ show: !show }));
			}
			render(props, state) {
				return (
					<Provider value={state.value}>
						<div>{state.show ? <Inner /> : null}</div>
					</Provider>
				);
			}
		}

		render(<App />, scratch);
		expect(scratch.innerHTML).to.equal('<div><div>0</div></div>');
		expect(Inner).toHaveBeenCalledOnce();

		act(() => changeValue(1));
		expect(scratch.innerHTML).to.equal('<div><div>1</div></div>');
		expect(Inner).toHaveBeenCalledTimes(2);

		act(() => toggleConsumer());
		expect(scratch.innerHTML).to.equal('<div></div>');
		expect(Inner).toHaveBeenCalledTimes(2);

		act(() => changeValue(2));
		expect(scratch.innerHTML).to.equal('<div></div>');
		expect(Inner).toHaveBeenCalledTimes(2);
	});

	it('should rerender when reset to defaultValue', () => {
		const defaultValue = { state: 'hi' };
		const context = createContext(defaultValue);
		let set;

		const Consumer = () => {
			const ctx = useContext(context);
			return <p>{ctx.state}</p>;
		};

		class NoUpdate extends Component {
			shouldComponentUpdate() {
				return false;
			}

			render() {
				return <Consumer />;
			}
		}

		const Provider = () => {
			const [state, setState] = useState(defaultValue);
			set = setState;
			return (
				<context.Provider value={state}>
					<NoUpdate />
				</context.Provider>
			);
		};

		render(<Provider />, scratch);
		expect(scratch.innerHTML).to.equal('<p>hi</p>');

		act(() => {
			set({ state: 'bye' });
		});
		expect(scratch.innerHTML).to.equal('<p>bye</p>');

		act(() => {
			set(defaultValue);
		});
		expect(scratch.innerHTML).to.equal('<p>hi</p>');
	});
});
