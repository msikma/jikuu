const { resolve } = require('path')
const { execSync } = require('child_process')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const root = resolve(__dirname, '..')
const distPath = `${root}/dist`

// Retrieve current state of the repo.
const exec = cmd => execSync(cmd, { encoding: 'utf8' }).trim()
const repo = {
  count: exec('git rev-list head --count'),
  hash: exec('git rev-parse --short head'),
  branch: exec('git describe --all | sed s@heads/@@')
}
// We'll pass on these variables to the output files.
const tplVars = {
  rev: `${repo.branch}-${repo.count} [${repo.hash}]`,
  year: new Date().getUTCFullYear(),
  buildDate: new Date().toString(),
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
      path: distPath
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
              loader: 'file-loader'
            }
          ]
        }
      ]
    }
  }
}
