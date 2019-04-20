// Jikuu - Tumblr Theme <https://github.com/msikma/jikuu>
// © 2008-2018, Michiel Sikma. MIT license.

import Prism from 'prismjs'

// List of PrismJS languages we recognize, passed on from .babelrc.
const languages = PRISM_JS_CONFIG.languages
// Aliases: used to map short codes (e.g. 'js') to PrismJS language names.
const aliases = { js: 'jsx', html: 'markup', sh: 'bash', shell: 'bash', fish: 'bash', css: 'scss' }

/** Patches the syntax highlighting definitions. */
export const patchGrammar = () => {
  Prism.languages.jsx.punctuation = /[().:]/
  Prism.languages.jsx['punctuation comma'] = /[;,]/
  Prism.languages.jsx['punctuation bracket'] = /[[\]]/
  Prism.languages.jsx['punctuation curly-brace'] = /[{}]/

  Prism.languages.css.punctuation = Prism.languages.scss.punctuation = /[();:,]/
  Prism.languages.css['punctuation curly-brace'] = Prism.languages.scss['punctuation curly-brace'] = /[{}]/

  Prism.languages.php.punctuation = /[().:]/
  Prism.languages.php['punctuation comma'] = /[,;]/
  Prism.languages.php['punctuation curly-brace'] = /[{}]/
  Prism.languages.php['punctuation bracket'] = /[[\]]/

  // Add a regex to detect shell commands, e.g. '$ npm run dev'.
  // This adds syntax highlighting to all unknown commands in this format.
  Prism.languages.bash['shell-command'] = {
    greedy: true,
    inside: {
      dollar: /\$/,
      function: /\s+([^\s]+)/
    },
    pattern: /(^|\n)\$\s+([^\s]+)/
  }
}

/**
 * Adds syntax highlighting to a number of code blocks.
 */
export function highlightSyntax(codeBlocks) {
  codeBlocks.forEach(code => {
    // A <code> block will have a class named e.g. 'js' or 'css'.
    // Prism requires that we give it a class such as 'lang-js'.
    // Add a new class for each matching class we find on this block.
    [...code.classList]
      .map(c => aliases[c] ? aliases[c] : c)
      .filter(c => languages.indexOf(c) !== -1)
      .forEach(c => code.classList.add(`lang-${aliases[c] ? aliases[c] : c}`))

    code.classList.add('prismjs')
    Prism.highlightElement(code, false)
  })
}
