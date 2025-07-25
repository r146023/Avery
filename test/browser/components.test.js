import { createElement, render, Component, Fragment } from 'avery';
import { setupRerender } from 'avery/test-utils';
import {
	setupScratch,
	teardown,
	getMixedArray,
	mixedArrayHTML,
	serializeHtml,
	sortAttributes
} from '../_util/helpers';
import { vi } from 'vitest';

/** @jsx createElement */
const h = createElement;

function getAttributes(node) {
	let attrs = {};
	if (node.attributes) {
		for (let i = node.attributes.length; i--; ) {
			attrs[node.attributes[i].name] = node.attributes[i].value;
		}
	}
	return attrs;
}

describe('Components', () => {
	/** @type {HTMLDivElement} */
	let scratch;

	/** @type {() => void} */
	let rerender;

	beforeEach(() => {
		scratch = setupScratch();
		rerender = setupRerender();
	});

	afterEach(() => {
		teardown(scratch);
	});

	describe('Component construction', () => {
		/** @type {object} */
		let instance;
		let PROPS;
		let STATE;

		beforeEach(() => {
			instance = null;
			PROPS = { foo: 'bar', onBaz: () => {} };
			STATE = { text: 'Hello' };
		});

		it('should render components', () => {
			class C1 extends Component {
				render() {
					return <div>C1</div>;
				}
			}
			vi.spyOn(C1.prototype, 'render');
			render(<C1 />, scratch);

			expect(C1.prototype.render).toHaveBeenCalledTimes(1);
			expect(C1.prototype.render).toHaveBeenCalledWith({}, {}, {});
			expect(C1.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div' })
			);

			expect(scratch.innerHTML).to.equal('<div>C1</div>');
		});

		it('should render functional components', () => {
			const C3 = vi.fn(props => <div {...props} />);

			render(<C3 {...PROPS} />, scratch);

			expect(C3).toHaveBeenCalledOnce().toHaveBeenCalledWith(PROPS, {});
			// .toHaveReturnedWith({
			// 	type: 'div',
			// 	props: PROPS
			// });

			expect(scratch.innerHTML).to.equal('<div foo="bar"></div>');
		});

		it('should render components with props', () => {
			let constructorProps;

			class C2 extends Component {
				constructor(props) {
					super(props);
					constructorProps = props;
				}
				render(props) {
					return <div {...props} />;
				}
			}
			vi.spyOn(C2.prototype, 'render');

			render(<C2 {...PROPS} />, scratch);

			expect(constructorProps).to.deep.equal(PROPS);

			expect(C2.prototype.render).toHaveBeenCalledTimes(1);
			expect(C2.prototype.render).toHaveBeenCalledWith(PROPS, {}, {});
			expect(C2.prototype.render).toHaveReturned(
				expect.objectContaining({
					type: 'div',
					props: PROPS
				})
			);

			expect(scratch.innerHTML).to.equal('<div foo="bar"></div>');
		});

		it('should not crash when setting state in constructor', () => {
			class Foo extends Component {
				constructor(props) {
					super(props);
					// the following line made `this._nextState !== this.state` be truthy prior to the fix for averyjs/avery#2638
					this.state = {};
					this.setState({ avery: 'awesome' });
				}
			}

			expect(() => render(<Foo foo="bar" />, scratch)).not.to.throw();
			rerender();
		});

		it('should not crash when setting state with cb in constructor', () => {
			let spy = vi.fn();
			class Foo extends Component {
				constructor(props) {
					super(props);
					this.setState({ avery: 'awesome' }, spy);
				}
			}

			expect(() => render(<Foo foo="bar" />, scratch)).not.to.throw();
			rerender();
			expect(spy).not.toHaveBeenCalled();
		});

		it('should not crash when calling forceUpdate with cb in constructor', () => {
			let spy = vi.fn();
			class Foo extends Component {
				constructor(props) {
					super(props);
					this.forceUpdate(spy);
				}
			}

			expect(() => render(<Foo foo="bar" />, scratch)).not.to.throw();
			rerender();
			expect(spy).not.toHaveBeenCalled();
		});

		it('should accurately call nested setState callbacks', () => {
			let states = [];
			let finalState;
			class Foo extends Component {
				constructor(props) {
					super(props);
					this.state = { a: 'b' };
				}

				componentDidMount() {
					states.push(this.state);
					expect(scratch.innerHTML).to.equal('<p>b</p>');

					// eslint-disable-next-line
					this.setState({ a: 'a' }, () => {
						states.push(this.state);
						expect(scratch.innerHTML).to.equal('<p>a</p>');

						this.setState({ a: 'c' }, () => {
							expect(scratch.innerHTML).to.equal('<p>c</p>');
							states.push(this.state);
						});
					});
				}

				render() {
					finalState = this.state;
					return <p>{this.state.a}</p>;
				}
			}

			render(<Foo />, scratch);
			rerender(); // First setState
			rerender(); // Second setState

			let [firstState, secondState, thirdState] = states;
			expect(finalState).to.deep.equal({ a: 'c' });
			expect(firstState).to.deep.equal({ a: 'b' });
			expect(secondState).to.deep.equal({ a: 'a' });
			expect(thirdState).to.deep.equal({ a: 'c' });
		});

		it('should initialize props & context but not state in Component constructor', () => {
			// Not initializing state matches React behavior: https://codesandbox.io/s/rml19v8o2q
			class Foo extends Component {
				constructor(props, context) {
					super(props, context);
					expect(this.props).to.equal(props);
					expect(this.state).to.deep.equal(undefined);
					expect(this.context).to.equal(context);

					instance = this;
				}
				render(props) {
					return <div {...props}>Hello</div>;
				}
			}

			vi.spyOn(Foo.prototype, 'render');

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, {}, {});
			expect(Foo.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal({});
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it("should render Component classes that don't pass args into the Component constructor", () => {
			function Foo() {
				Component.call(this);
				instance = this;
				this.state = STATE;
			}
			Foo.prototype.render = vi.fn((props, state) => (
				<div {...props}>{state.text}</div>
			));

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, STATE, {});
			expect(Foo.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal(STATE);
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it('should also update the current dom', () => {
			let trigger;

			class A extends Component {
				constructor(props) {
					super(props);
					this.state = { show: false };
					trigger = this.set = this.set.bind(this);
				}

				set() {
					this.setState({ show: true });
				}

				render() {
					return this.state.show ? <div>A</div> : null;
				}
			}

			const B = () => <p>B</p>;

			render(
				<div>
					<A />
					<B />
				</div>,
				scratch
			);
			expect(scratch.innerHTML).to.equal('<div><p>B</p></div>');

			trigger();
			rerender();
			expect(scratch.innerHTML).to.equal('<div><div>A</div><p>B</p></div>');
		});

		it('should not orphan children', () => {
			let triggerC, triggerA;
			const B = () => <p>B</p>;

			// Component with state which swaps its returned element type
			class C extends Component {
				constructor(props) {
					super(props);
					this.state = { show: false };
					triggerC = this.set = this.set.bind(this);
				}

				set() {
					this.setState({ show: true });
				}

				render() {
					return this.state.show ? <div>data</div> : <p>Loading</p>;
				}
			}

			const WrapC = () => <C />;

			class A extends Component {
				constructor(props) {
					super(props);
					this.state = { show: false };
					triggerA = this.set = this.set.bind(this);
				}

				set() {
					this.setState({ show: true });
				}

				render() {
					return this.state.show ? <B /> : <WrapC />;
				}
			}

			render(<A />, scratch);
			expect(scratch.innerHTML).to.equal('<p>Loading</p>');

			triggerC();
			rerender();
			expect(scratch.innerHTML).to.equal('<div>data</div>');

			triggerA();
			rerender();
			expect(scratch.innerHTML).to.equal('<p>B</p>');
		});

		it('should update children props correctly in subsequent renders', () => {
			let update, update2;
			class Counter extends Component {
				constructor(props) {
					super(props);
					this.state = { counter: 0 };
					update2 = () => {
						this.setState({ counter: this.state.counter + 1 });
					};
				}

				render({ counter }) {
					if (!counter) return null;
					return (
						<p>
							{counter}-{this.state.counter}
						</p>
					);
				}
			}
			class App extends Component {
				constructor(props) {
					super(props);
					this.state = { counter: 0 };
					update = () => {
						this.setState({ counter: this.state.counter + 1 });
					};
				}

				render() {
					return <Counter counter={this.state.counter} />;
				}
			}

			render(<App />, scratch);
			expect(scratch.innerHTML).to.equal('');

			update2();
			rerender();
			update();
			rerender();
			expect(scratch.innerHTML).to.equal('<p>1-1</p>');
		});

		it("should render components that don't pass args into the Component constructor (unistore pattern)", () => {
			// Pattern unistore uses for connect: https://github.com/developit/unistore/blob/1df7cf60ac6fa1a70859d745fbaea7ea3f1b8d30/src/integrations/avery.js#L23
			function Wrapper() {
				instance = this;
				this.state = STATE;
				this.render = vi.fn((props, state) => (
					<div {...props}>{state.text}</div>
				));
			}
			(Wrapper.prototype = new Component()).constructor = Wrapper;

			render(<Wrapper {...PROPS} />, scratch);

			expect(instance.render).toHaveBeenCalledTimes(1);
			expect(instance.render).toHaveBeenCalledWith(PROPS, STATE, {});
			expect(instance.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal(STATE);
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it("should render components that don't call Component constructor", () => {
			function Foo() {
				instance = this;
				this.state = STATE;
			}
			Foo.prototype = Object.create(Component);
			Foo.prototype.render = vi.fn((props, state) => (
				<div {...props}>{state.text}</div>
			));

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, STATE, {});
			expect(Foo.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal(STATE);
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it("should render components that don't call Component constructor and don't initialize state", () => {
			function Foo() {
				instance = this;
			}
			Foo.prototype.render = vi.fn(props => <div {...props}>Hello</div>);

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, {}, {});
			expect(Foo.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal({});
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it("should render components that don't inherit from Component", () => {
			class Foo {
				constructor() {
					instance = this;
					this.state = STATE;
				}
				render(props, state) {
					return <div {...props}>{state.text}</div>;
				}
			}
			vi.spyOn(Foo.prototype, 'render');

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, STATE, {});
			expect(Foo.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal(STATE);
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it("should render components that don't inherit from Component (unistore pattern)", () => {
			// Pattern unistore uses for Provider: https://github.com/developit/unistore/blob/1df7cf60ac6fa1a70859d745fbaea7ea3f1b8d30/src/integrations/avery.js#L59
			function Provider() {
				instance = this;
				this.state = STATE;
			}
			Provider.prototype.render = vi.fn((props, state) => (
				<div {...PROPS}>{state.text}</div>
			));

			render(<Provider {...PROPS} />, scratch);

			expect(Provider.prototype.render).toHaveBeenCalledTimes(1);
			expect(Provider.prototype.render).toHaveBeenCalledWith(PROPS, STATE, {});
			expect(Provider.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal(STATE);
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it("should render components that don't inherit from Component and don't initialize state", () => {
			class Foo {
				constructor() {
					instance = this;
				}
				render(props, state) {
					return <div {...props}>Hello</div>;
				}
			}
			vi.spyOn(Foo.prototype, 'render');

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, {}, {});
			expect(Foo.prototype.render).toHaveReturned(
				expect.objectContaining({ type: 'div', props: PROPS })
			);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal({});
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('<div foo="bar">Hello</div>');
		});

		it('should render class components that inherit from Component without a render method', () => {
			class Foo extends Component {
				constructor(props, context) {
					super(props, context);
					instance = this;
				}
			}

			vi.spyOn(Foo.prototype, 'render');

			render(<Foo {...PROPS} />, scratch);

			expect(Foo.prototype.render).toHaveBeenCalledTimes(1);
			expect(Foo.prototype.render).toHaveBeenCalledWith(PROPS, {}, {});
			expect(Foo.prototype.render).toHaveReturned(undefined);
			expect(instance.props).to.deep.equal(PROPS);
			expect(instance.state).to.deep.equal({});
			expect(instance.context).to.deep.equal({});

			expect(scratch.innerHTML).to.equal('');
		});
	});

	it('should render string', () => {
		class StringComponent extends Component {
			render() {
				return 'Hi there';
			}
		}

		render(<StringComponent />, scratch);
		expect(scratch.innerHTML).to.equal('Hi there');
	});

	it('should render number as string', () => {
		class NumberComponent extends Component {
			render() {
				return 42;
			}
		}

		render(<NumberComponent />, scratch);
		expect(scratch.innerHTML).to.equal('42');
	});

	it('should render a new String()', () => {
		class ConstructedStringComponent extends Component {
			render() {
				/* eslint-disable no-new-wrappers */
				return new String('Hi from a constructed string!');
			}
		}

		render(<ConstructedStringComponent />, scratch);
		expect(scratch.innerHTML).to.equal('Hi from a constructed string!');
	});

	it('should render null as empty string', () => {
		class NullComponent extends Component {
			render() {
				return null;
			}
		}

		render(<NullComponent />, scratch);
		expect(scratch.innerHTML).to.equal('');
	});

	// Test for Issue #73
	it('should remove orphaned elements replaced by Components', () => {
		class Comp extends Component {
			render() {
				return <span>span in a component</span>;
			}
		}

		let root;
		function test(content) {
			root = render(content, scratch, root);
		}

		test(<Comp />);
		test(<div>just a div</div>);
		test(<Comp />);

		expect(scratch.innerHTML).to.equal('<span>span in a component</span>');
	});

	// Test for Issue averyjs/avery#176
	it('should remove children when root changes to text node', () => {
		/** @type {import('avery').Component} */
		let comp;

		class Comp extends Component {
			constructor() {
				super();
				comp = this;
			}
			render(_, { alt }) {
				return alt ? 'asdf' : <div>test</div>;
			}
		}

		render(<Comp />, scratch);

		comp.setState({ alt: true });
		comp.forceUpdate();
		rerender();
		expect(scratch.innerHTML, 'switching to textnode').to.equal('asdf');

		comp.setState({ alt: false });
		comp.forceUpdate();
		rerender();
		expect(scratch.innerHTML, 'switching to element').to.equal(
			'<div>test</div>'
		);

		comp.setState({ alt: true });
		comp.forceUpdate();
		rerender();
		expect(scratch.innerHTML, 'switching to textnode 2').to.equal('asdf');
	});

	// Test for Issue averyjs/avery#1616
	it('should maintain order when setting state (that inserts dom-elements)', () => {
		let add, addTwice, reset;
		const Entry = props => <div>{props.children}</div>;

		class App extends Component {
			constructor(props) {
				super(props);

				this.state = { values: ['abc'] };

				add = this.add = this.add.bind(this);
				addTwice = this.addTwice = this.addTwice.bind(this);
				reset = this.reset = this.reset.bind(this);
			}

			add() {
				this.setState({ values: [...this.state.values, 'def'] });
			}

			addTwice() {
				this.setState({ values: [...this.state.values, 'def', 'ghi'] });
			}

			reset() {
				this.setState({ values: ['abc'] });
			}

			render() {
				return (
					<div>
						{this.state.values.map(v => (
							<Entry>{v}</Entry>
						))}
						<button>First Button</button>
						<button>Second Button</button>
						<button>Third Button</button>
					</div>
				);
			}
		}

		render(<App />, scratch);
		expect(scratch.firstChild.innerHTML).to.equal(
			'<div>abc</div>' +
				'<button>First Button</button><button>Second Button</button><button>Third Button</button>'
		);

		add();
		rerender();
		expect(scratch.firstChild.innerHTML).to.equal(
			'<div>abc</div><div>def' +
				'</div><button>First Button</button><button>Second Button</button><button>Third Button</button>'
		);

		add();
		rerender();
		expect(scratch.firstChild.innerHTML).to.equal(
			'<div>abc</div><div>def</div><div>def' +
				'</div><button>First Button</button><button>Second Button</button><button>Third Button</button>'
		);

		reset();
		rerender();
		expect(scratch.firstChild.innerHTML).to.equal(
			'<div>abc</div>' +
				'<button>First Button</button><button>Second Button</button><button>Third Button</button>'
		);

		addTwice();
		rerender();
		expect(scratch.firstChild.innerHTML).to.equal(
			'<div>abc</div><div>def</div><div>ghi' +
				'</div><button>First Button</button><button>Second Button</button><button>Third Button</button>'
		);
	});

	// Test for Issue averyjs/avery#254
	it('should not recycle common class children with different keys', () => {
		let idx = 0;
		let msgs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
		let sideEffect = vi.fn();

		class Comp extends Component {
			componentWillMount() {
				this.innerMsg = msgs[idx++ % 8];
				sideEffect();
			}
			render() {
				return <div>{this.innerMsg}</div>;
			}
		}
		vi.spyOn(Comp.prototype, 'componentWillMount');

		let good, bad;
		class GoodContainer extends Component {
			constructor(props) {
				super(props);
				this.state = { alt: false };
				good = this;
			}

			render(_, { alt }) {
				return (
					<div>
						{alt ? null : <Comp key={1} alt={alt} />}
						{alt ? null : <Comp key={2} alt={alt} />}
						{alt ? <Comp key={3} alt={alt} /> : null}
					</div>
				);
			}
		}

		class BadContainer extends Component {
			constructor(props) {
				super(props);
				this.state = { alt: false };
				bad = this;
			}

			render(_, { alt }) {
				return (
					<div>
						{alt ? null : <Comp alt={alt} />}
						{alt ? null : <Comp alt={alt} />}
						{alt ? <Comp alt={alt} /> : null}
					</div>
				);
			}
		}

		render(<GoodContainer />, scratch);
		expect(scratch.textContent, 'new component with key present').to.equal(
			'AB'
		);
		expect(Comp.prototype.componentWillMount).toHaveBeenCalledTimes(2);
		expect(sideEffect).toHaveBeenCalledTimes(2);

		sideEffect.mockClear();
		Comp.prototype.componentWillMount.mockClear();
		good.setState({ alt: true });
		rerender();
		expect(
			scratch.textContent,
			'new component with key present re-rendered'
		).to.equal('C');
		//we are recycling the first 2 components already rendered, just need a new one
		expect(Comp.prototype.componentWillMount).toHaveBeenCalledTimes(1);
		expect(sideEffect).toHaveBeenCalledTimes(1);

		sideEffect.mockClear();
		Comp.prototype.componentWillMount.mockClear();
		render(<BadContainer />, scratch);
		expect(scratch.textContent, 'new component without key').to.equal('DE');
		expect(Comp.prototype.componentWillMount).toHaveBeenCalledTimes(2);
		expect(sideEffect).toHaveBeenCalledTimes(2);

		sideEffect.mockClear();
		Comp.prototype.componentWillMount.mockClear();
		bad.setState({ alt: true });
		rerender();

		expect(
			scratch.textContent,
			'use null placeholders to detect new component is appended'
		).to.equal('F');
		expect(Comp.prototype.componentWillMount).toHaveBeenCalledOnce();
		expect(sideEffect).toHaveBeenCalledOnce();
	});

	describe('array children', () => {
		it("should render DOM element's array children", () => {
			render(<div>{getMixedArray()}</div>, scratch);
			expect(scratch.firstChild.innerHTML).to.equal(mixedArrayHTML);
		});

		it("should render Component's array children", () => {
			const Foo = () => getMixedArray();

			render(<Foo />, scratch);

			expect(scratch.innerHTML).to.equal(mixedArrayHTML);
		});

		it("should render Fragment's array children", () => {
			const Foo = () => <Fragment>{getMixedArray()}</Fragment>;

			render(<Foo />, scratch);

			expect(scratch.innerHTML).to.equal(mixedArrayHTML);
		});

		it('should render sibling array children', () => {
			const Todo = () => (
				<ul>
					<li>A header</li>
					{['a', 'b'].map(value => (
						<li>{value}</li>
					))}
					<li>A divider</li>
					{['c', 'd'].map(value => (
						<li>{value}</li>
					))}
					<li>A footer</li>
				</ul>
			);

			render(<Todo />, scratch);

			let ul = scratch.firstChild;
			expect(ul.childNodes.length).to.equal(7);
			expect(ul.childNodes[0].textContent).to.equal('A header');
			expect(ul.childNodes[1].textContent).to.equal('a');
			expect(ul.childNodes[2].textContent).to.equal('b');
			expect(ul.childNodes[3].textContent).to.equal('A divider');
			expect(ul.childNodes[4].textContent).to.equal('c');
			expect(ul.childNodes[5].textContent).to.equal('d');
			expect(ul.childNodes[6].textContent).to.equal('A footer');
		});
	});

	describe('props.children', () => {
		let children;

		let Foo = props => {
			children = props.children;
			return <div>{props.children}</div>;
		};

		let FunctionFoo = props => {
			children = props.children;
			return <div>{props.children(2)}</div>;
		};

		let Bar = () => <span>Bar</span>;

		beforeEach(() => {
			children = undefined;
		});

		it('should support passing children as a prop', () => {
			const Foo = props => <div {...props} />;

			render(
				<Foo a="b" children={[<span class="bar">bar</span>, '123', 456]} />,
				scratch
			);

			expect(scratch.innerHTML).to.equal(
				'<div a="b"><span class="bar">bar</span>123456</div>'
			);
		});

		it('should be ignored when explicit children exist', () => {
			const Foo = props => <div {...props}>a</div>;

			render(<Foo children={'b'} />, scratch);

			expect(scratch.innerHTML).to.equal('<div>a</div>');
		});

		it('should be undefined with no child', () => {
			render(<Foo />, scratch);

			expect(children).to.be.undefined;
			expect(scratch.innerHTML).to.equal('<div></div>');
		});

		it('should be null with null as a child', () => {
			render(<Foo>{null}</Foo>, scratch);

			expect(children).to.be.null;
			expect(scratch.innerHTML).to.equal('<div></div>');
		});

		it('should be false with false as a child', () => {
			render(<Foo>{false}</Foo>, scratch);

			expect(children).to.be.false;
			expect(scratch.innerHTML).to.equal('<div></div>');
		});

		it('should be true with true as a child', () => {
			render(<Foo>{true}</Foo>, scratch);

			expect(children).to.be.true;
			expect(scratch.innerHTML).to.equal('<div></div>');
		});

		it('should be a string with a text child', () => {
			render(<Foo>text</Foo>, scratch);

			expect(children).to.be.a('string');
			expect(children).to.equal('text');
			expect(scratch.innerHTML).to.equal('<div>text</div>');
		});

		it('should be a string with a number child', () => {
			render(<Foo>1</Foo>, scratch);

			expect(children).to.be.a('string');
			expect(children).to.equal('1');
			expect(scratch.innerHTML).to.equal('<div>1</div>');
		});

		it('should be a VNode with a DOM node child', () => {
			render(
				<Foo>
					<span />
				</Foo>,
				scratch
			);

			expect(children).to.be.an('object');
			expect(children.type).to.equal('span');
			expect(scratch.innerHTML).to.equal('<div><span></span></div>');
		});

		it('should be a VNode with a Component child', () => {
			render(
				<Foo>
					<Bar />
				</Foo>,
				scratch
			);

			expect(children).to.be.an('object');
			expect(children.type).to.equal(Bar);
			expect(scratch.innerHTML).to.equal('<div><span>Bar</span></div>');
		});

		it('should be a function with a function child', () => {
			const child = num => num.toFixed(2);
			render(<FunctionFoo>{child}</FunctionFoo>, scratch);

			expect(children).to.be.an('function');
			expect(children).to.equal(child);
			expect(scratch.innerHTML).to.equal('<div>2.00</div>');
		});

		it('should be an array with multiple children', () => {
			render(
				<Foo>
					0<span />
					<input />
					<div />1
				</Foo>,
				scratch
			);

			expect(children).to.be.an('array');
			expect(children[0]).to.equal('0');
			expect(children[1].type).to.equal('span');
			expect(children[2].type).to.equal('input');
			expect(children[3].type).to.equal('div');
			expect(children[4]).to.equal('1');
			expect(scratch.innerHTML).to.equal(
				`<div>0<span></span><input><div></div>1</div>`
			);
		});

		it('should be an array with an array as children', () => {
			const mixedArray = getMixedArray();
			render(<Foo>{mixedArray}</Foo>, scratch);

			expect(children).to.be.an('array');
			expect(children).to.deep.equal(mixedArray);
			expect(scratch.innerHTML).to.equal(`<div>${mixedArrayHTML}</div>`);
		});

		it('should not flatten sibling and nested arrays', () => {
			const list1 = [0, 1];
			const list2 = [2, 3];
			const list3 = [4, 5];
			const list4 = [6, 7];
			const list5 = [8, 9];

			render(
				<Foo>
					{[list1, list2]}
					{[list3, list4]}
					{list5}
				</Foo>,
				scratch
			);

			expect(children).to.be.an('array');
			expect(children).to.deep.equal([[list1, list2], [list3, list4], list5]);
			expect(scratch.innerHTML).to.equal('<div>0123456789</div>');
		});
	});

	describe('High-Order Components', () => {
		it('should render wrapper HOCs', () => {
			const text = "We'll throw some happy little limbs on this tree.";

			function withBobRoss(ChildComponent) {
				return class BobRossIpsum extends Component {
					getChildContext() {
						return { text };
					}

					render(props) {
						return <ChildComponent {...props} />;
					}
				};
			}

			const PaintSomething = (props, context) => <div>{context.text}</div>;
			const Paint = withBobRoss(PaintSomething);

			render(<Paint />, scratch);
			expect(scratch.innerHTML).to.equal(`<div>${text}</div>`);
		});

		it('should render HOCs with generic children', () => {
			const text =
				"Let your imagination just wonder around when you're doing these things.";

			class BobRossProvider extends Component {
				getChildContext() {
					return { text };
				}

				render(props) {
					return props.children;
				}
			}

			function BobRossConsumer(props, context) {
				return props.children(context.text);
			}

			const Say = props => <div>{props.text}</div>;

			const Speak = () => (
				<BobRossProvider>
					<span>A span</span>
					<BobRossConsumer>{text => <Say text={text} />}</BobRossConsumer>
					<span>A final span</span>
				</BobRossProvider>
			);

			render(<Speak />, scratch);

			expect(scratch.innerHTML).to.equal(
				`<span>A span</span><div>${text}</div><span>A final span</span>`
			);
		});

		it('should render nested functional components', () => {
			const PROPS = { foo: 'bar', onBaz: () => {} };

			const Outer = vi.fn(props => <Inner {...props} />);

			const Inner = vi.fn(props => <div {...props}>inner</div>);

			render(<Outer {...PROPS} />, scratch);

			expect(Outer)
				.toHaveBeenCalledOnce()
				.toHaveBeenCalledWith(PROPS, {})
				.toHaveReturned(
					expect.objectContaining({
						type: Inner,
						props: PROPS
					})
				);

			expect(Inner)
				.toHaveBeenCalledOnce()
				.toHaveBeenCalledWith(PROPS, {})
				.toHaveReturned(
					expect.objectContaining({
						type: 'div',
						props: { ...PROPS, children: 'inner' }
					})
				);

			expect(scratch.innerHTML).to.equal('<div foo="bar">inner</div>');
		});

		it('should re-render nested functional components', () => {
			let doRender = null;
			class Outer extends Component {
				componentDidMount() {
					let i = 1;
					doRender = () => this.setState({ i: ++i });
				}
				componentWillUnmount() {}
				render(props, { i }) {
					return <Inner i={i} {...props} />;
				}
			}
			vi.spyOn(Outer.prototype, 'render');
			vi.spyOn(Outer.prototype, 'componentWillUnmount');

			let j = 0;
			const Inner = vi.fn(props => (
				<div j={++j} {...props}>
					inner
				</div>
			));

			render(<Outer foo="bar" />, scratch);

			// update & flush
			doRender();
			rerender();

			expect(Outer.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			expect(Inner).toHaveBeenCalledTimes(2);

			expect(Inner).toHaveBeenNthCalledWith(2, { foo: 'bar', i: 2 }, {});

			expect(getAttributes(scratch.firstElementChild)).to.eql({
				j: '2',
				i: '2',
				foo: 'bar'
			});

			// update & flush
			doRender();
			rerender();

			expect(Inner).toHaveBeenCalledTimes(3);

			expect(Inner).toHaveBeenNthCalledWith(3, { foo: 'bar', i: 3 }, {});

			expect(getAttributes(scratch.firstElementChild)).to.eql({
				j: '3',
				i: '3',
				foo: 'bar'
			});
		});

		it('should re-render nested components', () => {
			let doRender = null,
				alt = false;

			class Outer extends Component {
				componentDidMount() {
					let i = 1;
					doRender = () => this.setState({ i: ++i });
				}
				componentWillUnmount() {}
				render(props, { i }) {
					if (alt) return <div is-alt />;
					return <Inner i={i} {...props} />;
				}
			}
			vi.spyOn(Outer.prototype, 'render');
			vi.spyOn(Outer.prototype, 'componentDidMount');
			vi.spyOn(Outer.prototype, 'componentWillUnmount');

			let j = 0;
			class Inner extends Component {
				constructor() {
					super();
				}
				componentWillMount() {}
				componentDidMount() {}
				componentWillUnmount() {}
				render(props) {
					return (
						<div j={++j} {...props}>
							inner
						</div>
					);
				}
			}
			vi.spyOn(Inner.prototype, 'render');
			vi.spyOn(Inner.prototype, 'componentWillMount');
			vi.spyOn(Inner.prototype, 'componentDidMount');
			vi.spyOn(Inner.prototype, 'componentWillUnmount');

			render(<Outer foo="bar" />, scratch);

			expect(Outer.prototype.componentDidMount).toHaveBeenCalledOnce();

			// update & flush
			doRender();
			rerender();

			expect(Outer.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);
			expect(Inner.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.render).toHaveBeenCalledTimes(2);

			expect(Inner.prototype.render).toHaveBeenNthCalledWith(
				2,
				{ foo: 'bar', i: 2 },
				{},
				{}
			);

			expect(getAttributes(scratch.firstElementChild)).to.eql({
				j: '2',
				i: '2',
				foo: 'bar'
			});

			expect(serializeHtml(scratch)).to.equal(
				sortAttributes('<div foo="bar" j="2" i="2">inner</div>')
			);

			// update & flush
			doRender();
			rerender();

			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);
			expect(Inner.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.render).toHaveBeenCalledTimes(3);

			expect(Inner.prototype.render).toHaveBeenNthCalledWith(
				3,
				{ foo: 'bar', i: 3 },
				{},
				{}
			);

			expect(getAttributes(scratch.firstElementChild)).to.eql({
				j: '3',
				i: '3',
				foo: 'bar'
			});

			// update & flush
			alt = true;
			doRender();
			rerender();

			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledOnce();

			expect(scratch.innerHTML).to.equal('<div is-alt="true"></div>');

			// update & flush
			alt = false;
			doRender();
			rerender();

			expect(serializeHtml(scratch)).to.equal(
				sortAttributes('<div foo="bar" j="4" i="5">inner</div>')
			);
		});

		it('should resolve intermediary functional component', () => {
			let ctx = {};
			class Root extends Component {
				getChildContext() {
					return { ctx };
				}
				render() {
					return <Func />;
				}
			}
			const Func = () => <Inner />;
			class Inner extends Component {
				componentWillMount() {}
				componentDidMount() {}
				componentWillUnmount() {}
				render() {
					return <div>inner</div>;
				}
			}

			vi.spyOn(Inner.prototype, 'componentWillUnmount');
			vi.spyOn(Inner.prototype, 'componentWillMount');
			vi.spyOn(Inner.prototype, 'componentDidMount');
			vi.spyOn(Inner.prototype, 'render');

			render(<Root />, scratch);

			expect(Inner.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentWillMount).toHaveBeenCalledBefore(
				Inner.prototype.componentDidMount
			);

			render(<asdf />, scratch);

			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledOnce();
		});

		it('should unmount children of high-order components without unmounting parent', () => {
			let outer,
				inner2,
				counter = 0;

			class Outer extends Component {
				constructor(props, context) {
					super(props, context);
					outer = this;
					this.state = {
						child: this.props.child
					};
				}
				componentWillUnmount() {}
				componentWillMount() {}
				componentDidMount() {}
				render(_, { child: C }) {
					return <C />;
				}
			}
			vi.spyOn(Outer.prototype, 'componentWillUnmount');
			vi.spyOn(Outer.prototype, 'componentWillMount');
			vi.spyOn(Outer.prototype, 'componentDidMount');
			vi.spyOn(Outer.prototype, 'render');

			class Inner extends Component {
				componentWillUnmount() {}
				componentWillMount() {}
				componentDidMount() {}
				render() {
					return h('element' + ++counter);
				}
			}
			vi.spyOn(Inner.prototype, 'componentWillUnmount');
			vi.spyOn(Inner.prototype, 'componentWillMount');
			vi.spyOn(Inner.prototype, 'componentDidMount');
			vi.spyOn(Inner.prototype, 'render');

			class Inner2 extends Component {
				constructor(props, context) {
					super(props, context);
					inner2 = this;
				}
				componentWillUnmount() {}
				componentWillMount() {}
				componentDidMount() {}
				render() {
					return h('element' + ++counter);
				}
			}
			vi.spyOn(Inner2.prototype, 'componentWillUnmount');
			vi.spyOn(Inner2.prototype, 'componentWillMount');
			vi.spyOn(Inner2.prototype, 'componentDidMount');
			vi.spyOn(Inner2.prototype, 'render');

			render(<Outer child={Inner} />, scratch);

			// outer should only have been mounted once
			expect(Outer.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Outer.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Outer.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			// inner should only have been mounted once
			expect(Inner.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			outer.setState({ child: Inner2 });
			outer.forceUpdate();
			rerender();

			expect(Inner2.prototype.render).toHaveBeenCalledOnce();

			// outer should still only have been mounted once
			expect(Outer.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Outer.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Outer.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			// inner should only have been mounted once
			expect(Inner2.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner2.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Inner2.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			inner2.forceUpdate();
			rerender();

			expect(Inner2.prototype.render).toHaveBeenCalledTimes(2);
			expect(Inner2.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner2.prototype.componentDidMount).toHaveBeenCalledOnce();
			expect(Inner2.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);
		});

		it('should remount when swapping between HOC child types', () => {
			class Outer extends Component {
				render({ child: Child }) {
					return <Child />;
				}
			}

			class Inner extends Component {
				componentWillMount() {}
				componentWillUnmount() {}
				render() {
					return <div class="inner">foo</div>;
				}
			}
			vi.spyOn(Inner.prototype, 'componentWillMount');
			vi.spyOn(Inner.prototype, 'componentWillUnmount');
			vi.spyOn(Inner.prototype, 'render');

			const InnerFunc = () => <div class="inner-func">bar</div>;

			render(<Outer child={Inner} />, scratch);

			expect(Inner.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);

			Inner.prototype.componentWillMount.mockReset();
			render(<Outer child={InnerFunc} />, scratch);

			expect(Inner.prototype.componentWillMount).toHaveBeenCalledTimes(0);
			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledOnce();

			Inner.prototype.componentWillUnmount.mockReset();
			render(<Outer child={Inner} />, scratch);

			expect(Inner.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(Inner.prototype.componentWillUnmount).toHaveBeenCalledTimes(0);
		});
	});

	describe('Component Nesting', () => {
		let useIntermediary = false;

		let createComponent = Intermediary => {
			class C extends Component {
				componentWillMount() {}
				render({ children }) {
					if (!useIntermediary) return children;
					let I = useIntermediary === true ? Intermediary : useIntermediary;
					return <I>{children}</I>;
				}
			}
			vi.spyOn(C.prototype, 'componentWillMount');
			vi.spyOn(C.prototype, 'render');
			return C;
		};

		let createFunction = () => vi.fn(({ children }) => children);

		let F1 = createFunction();
		let F2 = createFunction();
		let F3 = createFunction();

		let C1 = createComponent(F1);
		let C2 = createComponent(F2);
		let C3 = createComponent(F3);

		let reset = () =>
			[C1, C2, C3]
				.reduce(
					(acc, c) =>
						acc.concat(c.prototype.render, c.prototype.componentWillMount),
					[F1, F2, F3]
				)
				.forEach(c => c.mockReset());

		it('should handle lifecycle for no intermediary in component tree', () => {
			reset();
			render(
				<C1>
					<C2>
						<C3>Some Text</C3>
					</C2>
				</C1>,
				scratch
			);

			expect(C1.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(C2.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(C3.prototype.componentWillMount).toHaveBeenCalledOnce();

			reset();
			render(
				<C1>
					<C2>Some Text</C2>
				</C1>,
				scratch
			);

			expect(C1.prototype.componentWillMount).toHaveBeenCalledTimes(0);
			expect(C2.prototype.componentWillMount).toHaveBeenCalledTimes(0);

			reset();
			render(
				<C1>
					<C3>Some Text</C3>
				</C1>,
				scratch
			);

			expect(C1.prototype.componentWillMount).toHaveBeenCalledTimes(0);
			expect(C3.prototype.componentWillMount).toHaveBeenCalledOnce();

			reset();
			render(
				<C1>
					<C2>
						<C3>Some Text</C3>
					</C2>
				</C1>,
				scratch
			);

			expect(C1.prototype.componentWillMount).toHaveBeenCalledTimes(0);
			expect(C2.prototype.componentWillMount).toHaveBeenCalledOnce();
			expect(C3.prototype.componentWillMount).toHaveBeenCalledOnce();
		});

		it('should handle lifecycle for nested intermediary functional components', () => {
			useIntermediary = true;

			render(<div />, scratch);
			reset();
			render(
				<C1>
					<C2>
						<C3>Some Text</C3>
					</C2>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'initial mount w/ intermediary fn, C1'
			).toHaveBeenCalledOnce();
			expect(
				C2.prototype.componentWillMount,
				'initial mount w/ intermediary fn, C2'
			).toHaveBeenCalledOnce();
			expect(
				C3.prototype.componentWillMount,
				'initial mount w/ intermediary fn, C3'
			).toHaveBeenCalledOnce();

			reset();
			render(
				<C1>
					<C2>Some Text</C2>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'unmount innermost w/ intermediary fn, C1'
			).toHaveBeenCalledTimes(0);
			expect(
				C2.prototype.componentWillMount,
				'unmount innermost w/ intermediary fn, C2'
			).toHaveBeenCalledTimes(0);

			reset();
			render(
				<C1>
					<C3>Some Text</C3>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'swap innermost w/ intermediary fn'
			).toHaveBeenCalledTimes(0);
			expect(
				C3.prototype.componentWillMount,
				'swap innermost w/ intermediary fn'
			).toHaveBeenCalledOnce();

			reset();
			render(
				<C1>
					<C2>
						<C3>Some Text</C3>
					</C2>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'inject between, C1 w/ intermediary fn'
			).toHaveBeenCalledTimes(0);
			expect(
				C2.prototype.componentWillMount,
				'inject between, C2 w/ intermediary fn'
			).toHaveBeenCalledOnce();
			expect(
				C3.prototype.componentWillMount,
				'inject between, C3 w/ intermediary fn'
			).toHaveBeenCalledOnce();
		});

		it('should render components by depth', () => {
			let spy = vi.fn();
			let update;
			class Child extends Component {
				constructor(props) {
					super(props);
					update = () => {
						this.props.update();
						this.setState({});
					};
				}

				render() {
					spy();
					let items = [];
					for (let i = 0; i < this.props.items; i++) items.push(i);
					return <div>{items.join(',')}</div>;
				}
			}

			let i = 0;
			class Parent extends Component {
				render() {
					return <Child items={++i} update={() => this.setState({})} />;
				}
			}

			render(<Parent />, scratch);
			expect(spy).toHaveBeenCalledOnce();

			update();
			rerender();
			expect(spy).toHaveBeenCalledTimes(2);
		});

		it('should handle lifecycle for nested intermediary elements', () => {
			useIntermediary = 'div';

			render(<div />, scratch);
			reset();
			render(
				<C1>
					<C2>
						<C3>Some Text</C3>
					</C2>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'initial mount w/ intermediary div, C1'
			).toHaveBeenCalledOnce();
			expect(
				C2.prototype.componentWillMount,
				'initial mount w/ intermediary div, C2'
			).toHaveBeenCalledOnce();
			expect(
				C3.prototype.componentWillMount,
				'initial mount w/ intermediary div, C3'
			).toHaveBeenCalledOnce();

			reset();
			render(
				<C1>
					<C2>Some Text</C2>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'unmount innermost w/ intermediary div, C1'
			).toHaveBeenCalledTimes(0);
			expect(
				C2.prototype.componentWillMount,
				'unmount innermost w/ intermediary div, C2'
			).toHaveBeenCalledTimes(0);

			reset();
			render(
				<C1>
					<C3>Some Text</C3>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'swap innermost w/ intermediary div'
			).toHaveBeenCalledTimes(0);
			expect(
				C3.prototype.componentWillMount,
				'swap innermost w/ intermediary div'
			).toHaveBeenCalledOnce();

			reset();
			render(
				<C1>
					<C2>
						<C3>Some Text</C3>
					</C2>
				</C1>,
				scratch
			);

			expect(
				C1.prototype.componentWillMount,
				'inject between, C1 w/ intermediary div'
			).toHaveBeenCalledTimes(0);
			expect(
				C2.prototype.componentWillMount,
				'inject between, C2 w/ intermediary div'
			).toHaveBeenCalledOnce();
			expect(
				C3.prototype.componentWillMount,
				'inject between, C3 w/ intermediary div'
			).toHaveBeenCalledOnce();
		});
	});

	it('should set component._vnode._dom when sCU returns false', () => {
		let parent;
		class Parent extends Component {
			render() {
				parent = this;
				return <Child />;
			}
		}

		let renderChildDiv = false;

		let child;
		class Child extends Component {
			shouldComponentUpdate() {
				return false;
			}
			render() {
				child = this;
				if (!renderChildDiv) return null;
				return <div class="child" />;
			}
		}

		let app;
		class App extends Component {
			render() {
				app = this;
				return <Parent />;
			}
		}

		// TODO: Consider rewriting test to not rely on internal properties
		// and instead capture user-facing bug that would occur if this
		// behavior were broken
		const getDom = c => ('__v' in c ? c.__v.__e : c._vnode._dom);

		render(<App />, scratch);
		expect(getDom(child)).to.equalNode(scratch.querySelector('.child'));

		app.forceUpdate();
		expect(getDom(child)).to.equalNode(scratch.querySelector('.child'));

		parent.setState({});
		renderChildDiv = true;
		child.forceUpdate();
		expect(getDom(child)).to.equalNode(scratch.querySelector('.child'));
		rerender();

		expect(getDom(child)).to.equalNode(scratch.querySelector('.child'));

		renderChildDiv = false;
		app.setState({});
		child.forceUpdate();
		rerender();
		expect(getDom(child)).to.equalNode(scratch.querySelector('.child'));
	});

	// avery/#1323
	it('should handle hoisted component vnodes without DOM', () => {
		let x = 0;
		let mounted = '';
		let unmounted = '';
		let updateAppState;

		class X extends Component {
			constructor(props) {
				super(props);
				this.name = `${x++}`;
			}

			componentDidMount() {
				mounted += `,${this.name}`;
			}

			componentWillUnmount() {
				unmounted += `,${this.name}`;
			}

			render() {
				return null;
			}
		}

		// Statically create X element
		const A = <X />;

		class App extends Component {
			constructor(props) {
				super(props);
				this.state = { i: 0 };
				updateAppState = () => this.setState({ i: this.state.i + 1 });
			}

			render() {
				return (
					<div key={this.state.i}>
						{A}
						{A}
					</div>
				);
			}
		}

		render(<App />, scratch);

		updateAppState();
		rerender();
		updateAppState();
		rerender();

		expect(mounted).to.equal(',0,1,2,3,4,5');
		expect(unmounted).to.equal(',0,1,2,3');
	});

	it('should ignore invalid vnodes in children array', () => {
		/** @type { (() => void)} */
		let update;

		const obj = { a: 10, b: 'hello' };
		class App extends Component {
			constructor(props) {
				super(props);
				this.state = { i: 0 };
				update = () => this.setState({ i: this.state.i + 1 });
			}

			render() {
				return <p>{obj}</p>;
			}
		}

		render(<App />, scratch);
		update();
		expect(() => rerender()).not.to.throw();
	});

	describe('setState', () => {
		it('should not error if called on an unmounted component', () => {
			/** @type {() => void} */
			let increment;

			class Foo extends Component {
				constructor(props) {
					super(props);
					this.state = { count: 0 };
					increment = () => this.setState({ count: this.state.count + 1 });
				}
				render(props, state) {
					return <div>{state.count}</div>;
				}
			}

			render(<Foo />, scratch);
			expect(scratch.innerHTML).to.equal('<div>0</div>');

			increment();
			rerender();
			expect(scratch.innerHTML).to.equal('<div>1</div>');

			render(null, scratch);
			expect(scratch.innerHTML).to.equal('');

			expect(() => increment()).to.not.throw();
			expect(() => rerender()).to.not.throw();
			expect(scratch.innerHTML).to.equal('');
		});

		it('setState callbacks should have latest state, even when called in render', () => {
			let callbackState;
			let i = 0;

			class Foo extends Component {
				constructor(props) {
					super(props);
					this.state = { foo: 'bar' };
				}
				render() {
					// So we don't get infinite loop
					if (i++ === 0) {
						this.setState({ foo: 'baz' }, () => {
							callbackState = this.state;
						});
					}
					return String(this.state.foo);
				}
			}

			render(<Foo />, scratch);
			expect(scratch.innerHTML).to.equal('bar');

			rerender();
			expect(scratch.innerHTML).to.equal('baz');
			expect(callbackState).to.deep.equal({ foo: 'baz' });
		});

		// #2716
		it('should work with readonly state', () => {
			let update;
			class Foo extends Component {
				constructor(props) {
					super(props);
					this.state = { foo: 'bar' };
					update = () =>
						this.setState(prev => {
							Object.defineProperty(prev, 'foo', {
								writable: false
							});

							return prev;
						});
				}

				render() {
					return <div />;
				}
			}

			render(<Foo />, scratch);
			expect(() => {
				update();
				rerender();
			}).to.not.throw();
		});
	});

	describe('forceUpdate', () => {
		it('should not error if called on an unmounted component', () => {
			/** @type {() => void} */
			let forceUpdate;

			class Foo extends Component {
				constructor(props) {
					super(props);
					forceUpdate = () => this.forceUpdate();
				}
				render(props, state) {
					return <div>Hello</div>;
				}
			}

			render(<Foo />, scratch);
			expect(scratch.innerHTML).to.equal('<div>Hello</div>');

			render(null, scratch);
			expect(scratch.innerHTML).to.equal('');

			expect(() => forceUpdate()).to.not.throw();
			expect(() => rerender()).to.not.throw();
			expect(scratch.innerHTML).to.equal('');
		});

		it('should update old dom on forceUpdate in a lifecycle', () => {
			let i = 0;
			class App extends Component {
				componentWillReceiveProps() {
					this.forceUpdate();
				}
				render() {
					if (i++ == 0) return <div>foo</div>;
					return <div>bar</div>;
				}
			}

			render(<App />, scratch);
			render(<App />, scratch);

			expect(scratch.innerHTML).to.equal('<div>bar</div>');
		});

		it('should skip shouldComponentUpdate when called during render', () => {
			let isSCUCalled = false;
			class App extends Component {
				shouldComponentUpdate() {
					isSCUCalled = true;
					return false;
				}
				render() {
					const isUpdated = this.isUpdated;
					if (!isUpdated) {
						this.isUpdated = true;
						this.forceUpdate();
					}
					return <div>Updated: {isUpdated ? 'yes' : 'no'}</div>;
				}
			}
			render(<App />, scratch);
			rerender();
			expect(isSCUCalled).to.be.false;
			expect(scratch.innerHTML).to.equal('<div>Updated: yes</div>');
		});

		it('should break through strict equality optimization', () => {
			let isSCUCalled = false;

			class Child extends Component {
				componentDidMount() {
					this.props.parent.forceUpdate();
					this.forceUpdate();
					this.isUpdated = true;
				}
				shouldComponentUpdate() {
					isSCUCalled = true;
					return false;
				}
				render() {
					return <div>Updated: {this.isUpdated ? 'yes' : 'no'}</div>;
				}
			}

			class App extends Component {
				children = <Child parent={this} />;
				render() {
					return this.children;
				}
			}

			render(<App />, scratch);
			rerender();
			expect(isSCUCalled).to.be.false;
			expect(scratch.innerHTML).to.equal('<div>Updated: yes</div>');
		});
	});
});
