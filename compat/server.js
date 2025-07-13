/* eslint-disable */
var renderToString;
try {
	const mod = require('avery-render-to-string');
	renderToString = mod.default || mod.renderToString || mod;
} catch (e) {
	throw Error(
		'renderToString() error: missing "avery-render-to-string" dependency.'
	);
}

var renderToReadableStream;
try {
	const mod = require('avery-render-to-string/stream');
	renderToReadableStream = mod.default || mod.renderToReadableStream || mod;
} catch (e) {
	throw Error(
		'renderToReadableStream() error: update "avery-render-to-string" dependency to at least 6.5.0.'
	);
}
var renderToPipeableStream;
try {
	const mod = require('avery-render-to-string/stream-node');
	renderToPipeableStream = mod.default || mod.renderToPipeableStream || mod;
} catch (e) {
	throw Error(
		'renderToPipeableStream() error: update "avery-render-to-string" dependency to at least 6.5.0.'
	);
}

module.exports = {
	renderToString: renderToString,
	renderToStaticMarkup: renderToString,
	renderToPipeableStream: renderToPipeableStream,
	renderToReadableStream: renderToReadableStream
};
