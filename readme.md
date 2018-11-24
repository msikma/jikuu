[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Jikuu Tumblr Theme

A simple light theme. See an example [on the testing blog](https://jikuu.tumblr.com/).

This design was actually made all the way back in early 2008. [The very first version](https://raw.githubusercontent.com/msikma/jikuu/master/design/jikuu_design_v1.png) was used for a graphic design blog (originally in Wordpress). The goal for the theme was to be lightweight and modest, so that it would not overpower the designs in the posts. It went through a few small revisions and ended up looking more or less like the current version.

This repo is a reimplementation of the theme for Tumblr using a modern [Webpack 4](https://webpack.js.org/) setup. I've added a better image lightbox than the original ([Luminous lightbox](https://github.com/imgix/luminous)) and syntax highlighting support through [highlight.js](https://highlightjs.org/).

If you're interested in Tumblr theme development this might also be a good starting place. The markup for this theme is pretty verbose; I'd say for most designs you can probably leave the HTML unchanged and just use new CSS. If nothing else you can use this as an example of how to set up Webpack 4 for small HTML projects.

If, for some reason, you want to use this theme, feel free to do that as well. [I'd love to hear about it.](https://twitter.com/michielsikma/)

### The decorator pattern

All the way back in 2008 it was common to run all Javascript after the page had loaded, e.g. through jQuery's `$(document).ready()` callback. This meant your JS would not work at all until after your page had fully finished loading and parsing the HTML—which can take quite a while for large pages on slow connections. A better approach is the one used in this theme: pre-load a small master JS file in the `<head>` that exposes a `decorate()` function; and then, for every bit of HTML that requires JS that loads, follow it up with a `<script>decorate('#post_1234')</script>` (or whatever ID the item has). At the cost of a small blocking load, this means the user will never see HTML that should be interactive but isn't.

The funny thing is, this pattern (called the "decorator" pattern) is actually more relevant today than it was in 2008 given that page sizes have ballooned. Even when taking today's faster connection speed into account, the web is probably slower than it was a decade ago if you don't have an ad blocker.

There are many other good ways to go about it, of course, but if you are a web developer you might want to consider this method. Always make sure that your site or app can recover from failed or stalled requests, and to test with a poor connection.

### Development

Run `npm i` to install.

Available commands:

* `npm run build` - creates a production build
* `npm run profile` - creates a `stats.json` file with information on the production build
* `npm run develop` - spawns the dev server on [`localhost:8080`](http://localhost:8080/)

The dev server displays a copy of the testing blog with all external links (e.g. Tumblr's follow iframe) removed. It hot reloads on SCSS changes, but unfortunately for HTML changes you'll need to directly edit the test file. If you know of a better way to do this, please let me know!

### Copyright

MIT license.

### Example screenshot

<p align="center">
  <img src="https://raw.githubusercontent.com/msikma/jikuu/master/design/jikuu_example_master_67.png" alt="Screenshot of example blog as of master-67" />
</p>
