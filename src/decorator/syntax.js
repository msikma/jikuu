// Jikuu - Tumblr Theme <https://github.com/msikma/jikuu>
// © 2008-2018, Michiel Sikma. MIT license.

import hljs from 'highlight.js/lib/highlight.js'

// Note: we can't import 'highlight.js' itself because it'll include every language.
// Instead we manually select a few specific languages that we're likely to use.
// See <node_modules/highlight.js/lib/languages/*.js> for more items.
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('php', require('highlight.js/lib/languages/php'))
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'))
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'))
// Empty language to avoid guessing what language something is.
hljs.registerLanguage('empty', require('./empty'))

/**
 * Adds syntax highlighting to a number of code blocks.
 */
export function highlightSyntax(codeBlocks) {
  codeBlocks.forEach(code => hljs.highlightBlock(code))
}
