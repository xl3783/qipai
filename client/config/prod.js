export default {
  // 生产环境日志配置
  logger: {
    quiet: true,  // 生产环境静默日志
    stats: false  // 不显示统计信息
  },
  
  // 小程序配置
  mini: {
    // 生产环境优化
    optimizeMainPackage: {
      enable: true
    },
    // 代码压缩
    terser: {
      enable: true,
      config: {
        // 移除 console
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    // 禁用 CSS 压缩以避免 WXSS 编译错误
    cssMinifier: {
      enable: false
    }
  },
  
  // H5 配置
  h5: {
    // 代码分割
    output: {
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].js'
    },
    // CSS 优化
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css'
    }
  }
}
