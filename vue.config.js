const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const plugins = [new ContextReplacementPlugin(/moment[/\\]locale$/, /en/)]
if (process.env.npm_config_report) {
  plugins.push(new BundleAnalyzerPlugin())
}

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('gql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag')
      .loader('graphql-tag/loader')
  },
  configureWebpack: {
    plugins
  }
}
