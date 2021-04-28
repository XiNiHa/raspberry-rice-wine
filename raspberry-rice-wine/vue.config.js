/* eslint-disable no-template-curly-in-string */

module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'io.github.xiniha.rrw',
        win: {
          target: {
            target: 'nsis',
            arch: 'x64'
          }
        },
        mac: {
          target: {
            target: 'zip',
            arch: 'universal'
          },
          category: 'public.app-category.graphics-design'
        }
      }
    }
  }
}
