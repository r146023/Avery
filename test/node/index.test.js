import { expect } from 'chai';
import * as avery from '../../';

describe('build artifact', () => {
	// #1075 Check that the build artifact has the correct exports
	it('should have exported properties', () => {
		expect(typeof avery).to.equal('object');
		expect(avery).to.have.property('createElement');
		expect(avery).to.have.property('h');
		expect(avery).to.have.property('Component');
		expect(avery).to.have.property('render');
		expect(avery).to.have.property('hydrate');
		// expect(avery).to.have.property('options');
	});
});
