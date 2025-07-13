import { renderToString } from 'avery-render-to-string';
import { renderToPipeableStream } from 'avery-render-to-string/stream-node';
import { renderToReadableStream } from 'avery-render-to-string/stream';

export {
	renderToString,
	renderToString as renderToStaticMarkup
} from 'avery-render-to-string';

export { renderToPipeableStream } from 'avery-render-to-string/stream-node';
export { renderToReadableStream } from 'avery-render-to-string/stream';
export default {
	renderToString,
	renderToStaticMarkup: renderToString,
	renderToPipeableStream,
	renderToReadableStream
};
