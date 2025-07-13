import { createElement as averyCreateElement, Fragment } from 'avery';
import React, { isFragment } from 'avery/compat';

describe('isFragment', () => {
	it('should check return false for invalid arguments', () => {
		expect(isFragment(null)).to.equal(false);
		expect(isFragment(false)).to.equal(false);
		expect(isFragment(true)).to.equal(false);
		expect(isFragment('foo')).to.equal(false);
		expect(isFragment(123)).to.equal(false);
		expect(isFragment([])).to.equal(false);
		expect(isFragment({})).to.equal(false);
	});

	it('should detect a avery vnode', () => {
		expect(isFragment(averyCreateElement(Fragment, {}))).to.equal(true);
	});

	it('should detect a compat vnode', () => {
		expect(isFragment(React.createElement(Fragment, {}))).to.equal(true);
	});
});
