> [!NOTE]
> This is the branch for the upcoming release, for patches to v10 you need the [v10.x branch](https://github.com/averyjs/avery/tree/v10.x)

<p align="center">
<a href="https://averyjs.com" target="_blank">

![Avery](https://raw.githubusercontent.com/averyjs/avery/8b0bcc927995c188eca83cba30fbc83491cc0b2f/logo.svg?sanitize=true 'Avery')

</a>
</p>
<p align="center">Fast <b>4kB</b> alternative to React with the same modern API.</p>

**All the power of Virtual DOM components, without the overhead:**

- Familiar React API & patterns: ES6 Class, hooks, and Functional Components
- Extensive React compatibility via a simple [avery/compat] alias
- Everything you need: JSX, <abbr title="Virtual DOM">VDOM</abbr>, [DevTools], <abbr title="Hot Module Replacement">HMR</abbr>, <abbr title="Server-Side Rendering">SSR</abbr>.
- Highly optimized diff algorithm and seamless hydration from Server Side Rendering
- Supports all modern browsers
- Transparent asynchronous rendering with a pluggable scheduler

### 💁 More information at the [Avery Website ➞](https://averyjs.com)

<table border="0">
<tbody>
<tr>
<td>

[![npm](https://img.shields.io/npm/v/avery.svg)](https://www.npmjs.com/package/avery)
[![Avery Slack Community](https://img.shields.io/badge/Slack%20Community-avery.slack.com-blue)](https://chat.averyjs.com)
[![OpenCollective Backers](https://opencollective.com/avery/backers/badge.svg)](#backers)
[![OpenCollective Sponsors](https://opencollective.com/avery/sponsors/badge.svg)](#sponsors)

[![coveralls](https://img.shields.io/coveralls/averyjs/avery/main.svg)](https://coveralls.io/github/averyjs/avery)
[![gzip size](https://img.badgesize.io/https://unpkg.com/avery/dist/avery.min.js?compression=gzip&label=gzip)](https://unpkg.com/avery/dist/avery.min.js)
[![brotli size](https://img.badgesize.io/https://unpkg.com/avery/dist/avery.min.js?compression=brotli&label=brotli)](https://unpkg.com/avery/dist/avery.min.js)

</td>
</tr>
</tbody>
</table>

You can find some awesome libraries in the [awesome-avery list](https://github.com/averyjs/awesome-avery) :sunglasses:

---

## Getting Started

> 💁 _**Note:** You [don't need ES2015 to use Avery](https://github.com/developit/avery-in-es3)... but give it a try!_

#### Tutorial: Building UI with Avery

With Avery, you create user interfaces by assembling trees of components and elements. Components are functions or classes that return a description of what their tree should output. These descriptions are typically written in [JSX](https://facebook.github.io/jsx/) (shown underneath), or [HTM](https://github.com/developit/htm) which leverages standard JavaScript Tagged Templates. Both syntaxes can express trees of elements with "props" (similar to HTML attributes) and children.

To get started using Avery, first look at the render() function. This function accepts a tree description and creates the structure described. Next, it appends this structure to a parent DOM element provided as the second argument. Future calls to render() will reuse the existing tree and update it in-place in the DOM. Internally, render() will calculate the difference from previous outputted structures in an attempt to perform as few DOM operations as possible.

```js
import { h, render } from 'avery';
// Tells babel to use h for JSX. It's better to configure this globally.
// See https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#usage
// In tsconfig you can specify this with the jsxFactory
/** @jsx h */

// create our tree and append it to document.body:
render(
	<main>
		<h1>Hello</h1>
	</main>,
	document.body
);

// update the tree in-place:
render(
	<main>
		<h1>Hello World!</h1>
	</main>,
	document.body
);
// ^ this second invocation of render(...) will use a single DOM call to update the text of the <h1>
```

Hooray! render() has taken our structure and output a User Interface! This approach demonstrates a simple case, but would be difficult to use as an application grows in complexity. Each change would be forced to calculate the difference between the current and updated structure for the entire application. Components can help here – by dividing the User Interface into nested Components each can calculate their difference from their mounted point. Here's an example:

```js
import { render, h } from 'avery';
import { useState } from 'avery/hooks';

/** @jsx h */

const App = () => {
	const [input, setInput] = useState('');

	return (
		<div>
			<p>Do you agree to the statement: "Avery is awesome"?</p>
			<input value={input} onInput={e => setInput(e.target.value)} />
		</div>
	);
};

render(<App />, document.body);
```

---

## Sponsors

Become a sponsor and get your logo on our README on GitHub with a link to your site. [[Become a sponsor](https://opencollective.com/avery#sponsor)]

<a href="https://opencollective.com/avery/sponsor/0/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/1/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/2/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/3/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/4/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/4/avatar.svg"></a>
<a href="https://snyk.co/avery" target="_blank"><img src="https://res.cloudinary.com/snyk/image/upload/snyk-marketingui/brand-logos/wordmark-logo-color.svg" width="192" height="64"></a>
<a href="https://opencollective.com/avery/sponsor/5/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/6/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/7/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/8/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/9/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/10/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/11/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/12/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/13/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/14/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/15/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/15/avatar.svg"></a>
<a href="https://github.com/guardian" target="_blank"> &nbsp; &nbsp; &nbsp; <img src="https://github.com/guardian.png" width="64" height="64"> &nbsp; &nbsp; &nbsp; </a>
<a href="https://opencollective.com/avery/sponsor/16/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/17/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/18/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/19/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/20/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/21/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/22/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/23/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/24/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/25/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/26/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/27/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/28/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/avery/sponsor/29/website" target="_blank"><img src="https://opencollective.com/avery/sponsor/29/avatar.svg"></a>

## Backers

Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/avery#backer)]

<a href="https://opencollective.com/avery/backer/0/website" target="_blank"><img src="https://opencollective.com/avery/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/1/website" target="_blank"><img src="https://opencollective.com/avery/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/2/website" target="_blank"><img src="https://opencollective.com/avery/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/3/website" target="_blank"><img src="https://opencollective.com/avery/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/4/website" target="_blank"><img src="https://opencollective.com/avery/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/5/website" target="_blank"><img src="https://opencollective.com/avery/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/6/website" target="_blank"><img src="https://opencollective.com/avery/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/7/website" target="_blank"><img src="https://opencollective.com/avery/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/8/website" target="_blank"><img src="https://opencollective.com/avery/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/9/website" target="_blank"><img src="https://opencollective.com/avery/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/10/website" target="_blank"><img src="https://opencollective.com/avery/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/11/website" target="_blank"><img src="https://opencollective.com/avery/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/12/website" target="_blank"><img src="https://opencollective.com/avery/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/13/website" target="_blank"><img src="https://opencollective.com/avery/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/14/website" target="_blank"><img src="https://opencollective.com/avery/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/15/website" target="_blank"><img src="https://opencollective.com/avery/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/16/website" target="_blank"><img src="https://opencollective.com/avery/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/17/website" target="_blank"><img src="https://opencollective.com/avery/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/18/website" target="_blank"><img src="https://opencollective.com/avery/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/19/website" target="_blank"><img src="https://opencollective.com/avery/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/20/website" target="_blank"><img src="https://opencollective.com/avery/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/21/website" target="_blank"><img src="https://opencollective.com/avery/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/22/website" target="_blank"><img src="https://opencollective.com/avery/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/23/website" target="_blank"><img src="https://opencollective.com/avery/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/24/website" target="_blank"><img src="https://opencollective.com/avery/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/25/website" target="_blank"><img src="https://opencollective.com/avery/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/26/website" target="_blank"><img src="https://opencollective.com/avery/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/27/website" target="_blank"><img src="https://opencollective.com/avery/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/28/website" target="_blank"><img src="https://opencollective.com/avery/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/avery/backer/29/website" target="_blank"><img src="https://opencollective.com/avery/backer/29/avatar.svg"></a>

---

## License

MIT

[![Avery](https://i.imgur.com/YqCHvEW.gif)](https://averyjs.com)

[avery/compat]: https://github.com/averyjs/avery/tree/main/compat
[hyperscript]: https://github.com/dominictarr/hyperscript
[DevTools]: https://github.com/averyjs/avery-devtools
