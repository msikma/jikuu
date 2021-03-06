const { readFileSync } = require('fs')
const { resolve } = require('path')
const { execSync } = require('child_process')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const package = require('../package.json')

const root = resolve(__dirname, '..')
const distPath = `${root}/dist`

// Find PrismJS configuration to get our list of included languages.
const babelRc = JSON.parse(readFileSync(resolve(`${root}/.babelrc`), 'utf8'))
const prismConfig = babelRc.plugins.find(p => p[0] === 'prismjs')[1]

// Retrieve current state of the repo.
const exec = cmd => execSync(cmd, { encoding: 'utf8' }).trim()
const repo = {
  date: exec('git log -1 --format=%ad'),
  count: exec('git rev-list head --count'),
  hash: exec('git rev-parse --short head'),
  branch: exec('git describe --all | sed s@heads/@@')
}
// We'll pass on these variables to the output files.
const tplVars = {
  rev: `${repo.branch}-${repo.count} [${repo.hash}]`,
  year: new Date().getUTCFullYear(),
  version: package.version,
  homepage: package.homepage,
  ...repo
}

module.exports = {
  root,
  config: {
    entry: {
      jikuu: './src/jikuu.js'
    },
    context: root,
    output: {
      filename: '[name].bundle.js',
      path: distPath,
      publicPath: process.env.NODE_ENV === 'development'
        ? ''
        : `https://letsdeliver.com/tumblr/jikuu/${package.version}/`
    },
    plugins: [
      new CleanWebpackPlugin(['dist'], { root }),
      ...(
        // Include the test file if we're developing.
        process.env.NODE_ENV === 'development'
          ? [new HtmlWebpackPlugin({ template: 'src/test/jikuu.test.html', inject: false, ...tplVars })]
          : []
      ),
      new HtmlWebpackPlugin({
        filename: 'jikuu.tumblr.html',
        template: 'src/jikuu.tumblr.html',
        inject: false,
        ...tplVars
      }),
      new webpack.DefinePlugin({
        PRISM_JS_CONFIG: JSON.stringify(prismConfig)
      })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
          }
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        }
      ]
    }
  }
}
