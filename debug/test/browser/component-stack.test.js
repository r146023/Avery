import { createElement, render, Component } from 'avery';
import 'avery/debug';
import { vi } from 'vitest';
import { setupScratch, teardown } from '../../../test/_util/helpers';

/** @jsx createElement */

describe('component stack', () => {
	/** @type {HTMLDivElement} */
	let scratch;

	let errors = [];
	let warnings = [];

	const getStack = arr => arr[0].split('\n\n')[1];

	beforeEach(() => {
		scratch = setupScratch();

		errors = [];
		warnings = [];
		vi.spyOn(console, 'error').mockImplementation(e => errors.push(e));
		vi.spyOn(console, 'warn').mockImplementation(w => warnings.push(w));
	});

	afterEach(() => {
		vi.resetAllMocks();
		teardown(scratch);
	});

	it('should print component stack', () => {
		function Foo() {
			return <Thrower />;
		}

		class Thrower extends Component {
			constructor(props) {
				super(props);
				this.setState({ foo: 1 });
			}

			render() {
				return <div>foo</div>;
			}
		}

		render(<Foo />, scratch);

		// This has a JSX transform warning, so we need to remove it
		warnings.shift();
		let lines = getStack(warnings).split('\n');
		expect(lines[0].indexOf('Thrower') > -1).to.equal(true);
		expect(lines[1].indexOf('Foo') > -1).to.equal(true);
	});

	it('should only print owners', () => {
		function Foo(props) {
			return <div>{props.children}</div>;
		}

		function Bar() {
			return (
				<Foo>
					<Thrower />
				</Foo>
			);
		}

		class Thrower extends Component {
			render() {
				return (
					<table>
						<td>
							<tr>foo</tr>
						</td>
					</table>
				);
			}
		}

		render(<Bar />, scratch);

		let lines = getStack(errors).split('\n');
		expect(lines[0].indexOf('tr') > -1).to.equal(true);
		expect(lines[1].indexOf('Thrower') > -1).to.equal(true);
		expect(lines[2].indexOf('Bar') > -1).to.equal(true);
	});

	it('should not print a warning when "@babel/plugin-transform-react-jsx-source" is installed', () => {
		function Thrower() {
			throw new Error('foo');
		}

		try {
			render(<Thrower />, scratch);
		} catch {}

		expect(warnings.join(' ')).to.not.include(
			'@babel/plugin-transform-react-jsx-source'
		);
	});
});
